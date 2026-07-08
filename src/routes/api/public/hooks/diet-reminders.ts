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
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = istNow();
        const timeStr = `${now.hh}:${now.mm}`;

        // Find meals due right now
        const { data: meals, error } = await supabaseAdmin
          .from("diet_meals")
          .select("id, plan_id, meal_name, description, meal_time, day_of_week, notify, diet_plans!inner(member_id, name, members(id, full_name, mobile))")
          .eq("day_of_week", now.dow)
          .eq("notify", true)
          .gte("meal_time", `${timeStr}:00`)
          .lte("meal_time", `${timeStr}:59`);

        if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

        const results: Array<Record<string, unknown>> = [];

        for (const m of meals ?? []) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plan: any = (m as any).diet_plans;
          const member = plan?.members;
          const memberId = member?.id ?? null;
          if (!member?.mobile) {
            results.push({ meal_id: m.id, skipped: "no member phone" });
            continue;
          }

          // Dedup: already sent today?
          const { data: existing } = await supabaseAdmin
            .from("diet_meal_sends")
            .select("id")
            .eq("meal_id", m.id)
            .eq("member_id", memberId)
            .eq("sent_date", now.date)
            .maybeSingle();
          if (existing) {
            results.push({ meal_id: m.id, skipped: "already sent" });
            continue;
          }

          const phone = normalizePhone(member.mobile);
          if (!phone) {
            results.push({ meal_id: m.id, skipped: "invalid phone" });
            continue;
          }

          const msg =
            `🍽️ *${m.meal_name}* reminder\n` +
            `Hi ${member.full_name || "there"}, it's time for your ${m.meal_name.toLowerCase()}.\n` +
            (m.description ? `\n${m.description}\n` : "") +
            `\nPlan: ${plan?.name ?? ""}`;

          try {
            await sendEvolution(phone, msg);
            await supabaseAdmin.from("diet_meal_sends").insert({
              meal_id: m.id,
              member_id: memberId,
              sent_date: now.date,
              status: "sent",
            });
            results.push({ meal_id: m.id, sent: true, phone });
          } catch (e) {
            const err = (e as Error).message;
            await supabaseAdmin.from("diet_meal_sends").insert({
              meal_id: m.id,
              member_id: memberId,
              sent_date: now.date,
              status: "failed",
              error: err,
            });
            results.push({ meal_id: m.id, sent: false, error: err });
          }
        }

        return Response.json({ ok: true, at: `${now.date} ${timeStr} IST`, count: results.length, results });
      },
      GET: async () => Response.json({ ok: true, hint: "POST to trigger" }),
    },
  },
});
