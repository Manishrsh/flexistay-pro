import { createFileRoute } from "@tanstack/react-router";

// Runs every minute via pg_cron. Sends WhatsApp reminders for diet meals whose
// day-of-week and time match the current IST minute, and haven't been sent today.

const IST_TZ = "Asia/Kolkata";

function istNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TZ,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const dowMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    dow: dowMap[map.weekday] ?? 0,
    hh: map.hour,
    mm: map.minute,
    date: `${map.year}-${map.month}-${map.day}`,
  };
}

function normalizePhone(raw: string): string | null {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function sendEvolution(phone: string, message: string) {
  const url = process.env.EVOLUTION_API_URL?.replace(/\/+$/, "");
  const key = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  if (!url || !key || !instance) throw new Error("Evolution API not configured");
  const res = await fetch(`${url}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key },
    body: JSON.stringify({ number: phone, text: message }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Evolution ${res.status}: ${body}`);
  return body;
}

export const Route = createFileRoute("/api/public/hooks/diet-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        if (!apikey || apikey !== process.env.SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }
        const body = await readJsonBody(request);
        const forceMealId = typeof body.mealId === "string" ? body.mealId : null;
        const forceMemberId = typeof body.memberId === "string" ? body.memberId : null;
        const testMode = body.mode === "test" || body.test === true;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = istNow();
        const timeStr = `${now.hh}:${now.mm}`;

        // Find meals due right now
        let mealsQuery = supabaseAdmin
          .from("diet_meals")
          .select("id, plan_id, meal_name, description, meal_time, day_of_week, notify, diet_plans!inner(id, member_id, name)")
          .eq("notify", true);

        if (forceMealId) {
          mealsQuery = mealsQuery.eq("id", forceMealId);
        } else {
          mealsQuery = mealsQuery
            .eq("day_of_week", now.dow)
            .gte("meal_time", `${timeStr}:00`)
            .lte("meal_time", `${timeStr}:59`);
        }

        const { data: meals, error } = await mealsQuery;

        if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

        const results: Array<Record<string, unknown>> = [];

        for (const m of meals ?? []) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plan: any = (m as any).diet_plans;

          // Collect all assigned members: join table + legacy single member_id
          const memberIds = new Set<string>();
          const { data: assigns } = await supabaseAdmin
            .from("diet_plan_members")
            .select("member_id")
            .eq("plan_id", plan.id);
          for (const a of assigns ?? []) memberIds.add(a.member_id);
          if (plan?.member_id) memberIds.add(plan.member_id);
          if (forceMemberId && memberIds.has(forceMemberId)) {
            memberIds.clear();
            memberIds.add(forceMemberId);
          }

          if (memberIds.size === 0) {
            results.push({ meal_id: m.id, skipped: "no members assigned" });
            continue;
          }

          const { data: members } = await supabaseAdmin
            .from("members")
            .select("id, full_name, mobile")
            .in("id", Array.from(memberIds));

          for (const member of members ?? []) {
            const memberId = member.id;
            if (!member.mobile) {
              results.push({ meal_id: m.id, member_id: memberId, skipped: "no member phone" });
              continue;
            }

            // Dedup only successful sends; failed attempts can be retried and logged again.
            const { data: existing } = await supabaseAdmin
              .from("diet_meal_sends")
              .select("id, status")
              .eq("meal_id", m.id)
              .eq("member_id", memberId)
              .eq("sent_date", now.date)
              .maybeSingle();
            if (!testMode && existing?.status === "sent") {
              results.push({ meal_id: m.id, member_id: memberId, skipped: "already sent" });
              continue;
            }

            const phone = normalizePhone(member.mobile);
            if (!phone) {
              results.push({ meal_id: m.id, member_id: memberId, skipped: "invalid phone" });
              continue;
            }

            const msg =
              `🍽️ *${m.meal_name}* reminder\n` +
              `Hi ${member.full_name || "there"}, it's time for your ${m.meal_name.toLowerCase()}.\n` +
              (m.description ? `\n${m.description}\n` : "") +
              `\nPlan: ${plan?.name ?? ""}`;

            const subject = `Diet reminder: ${m.meal_name}`;
            try {
              const evolutionBody = await sendEvolution(phone, msg);
              const { error: sendLogError } = testMode
                ? { error: null }
                : await supabaseAdmin.from("diet_meal_sends").upsert({
                  meal_id: m.id, member_id: memberId, sent_date: now.date, status: "sent", error: null,
                }, {
                  onConflict: "meal_id,member_id,sent_date",
                });
              const { error: notificationLogError } = await supabaseAdmin.from("notifications").insert({
                channel: "whatsapp", recipient: phone, subject: testMode ? `${subject} (TEST)` : subject, body: msg,
                status: "sent", sent_at: new Date().toISOString(),
              });
              results.push({
                meal_id: m.id, member_id: memberId, sent: true, phone, test_mode: testMode,
                evolution_response_preview: evolutionBody.slice(0, 500),
                send_log_error: sendLogError?.message,
                notification_log_error: notificationLogError?.message,
              });
            } catch (e) {
              const err = (e as Error).message;
              const { error: sendLogError } = await supabaseAdmin.from("diet_meal_sends").upsert({
                meal_id: m.id, member_id: memberId, sent_date: now.date, status: "failed", error: err,
              }, {
                onConflict: "meal_id,member_id,sent_date",
              });
              const { error: notificationLogError } = await supabaseAdmin.from("notifications").insert({
                channel: "whatsapp", recipient: phone, subject: `${subject} (FAILED)`,
                body: `${msg}\n\n---\nError: ${err}`, status: "failed",
              });
              results.push({
                meal_id: m.id, member_id: memberId, sent: false, error: err,
                send_log_error: sendLogError?.message,
                notification_log_error: notificationLogError?.message,
              });
            }
          }
        }


        return Response.json({ ok: true, at: `${now.date} ${timeStr} IST`, count: results.length, results });
      },
      GET: async () => Response.json({ ok: true, hint: "POST to trigger" }),
    },
  },
});
