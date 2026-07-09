import { createFileRoute } from "@tanstack/react-router";

const IST_TZ = "Asia/Kolkata";

function istToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
}

function addDaysISO(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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

export const Route = createFileRoute("/api/public/hooks/membership-expiry-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        if (!apikey || apikey !== process.env.SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const today = istToday();
        const results: Array<Record<string, unknown>> = [];

        for (const daysBefore of [3, 2, 1]) {
          const targetDate = addDaysISO(today, daysBefore);

          const { data: memberships, error } = await supabaseAdmin
            .from("memberships")
            .select("id, end_date, member_id, plan_id, members(id, full_name, mobile), membership_plans(name)")
            .eq("end_date", targetDate)
            .in("status", ["active", "Active"]);

          if (error) {
            results.push({ days_before: daysBefore, error: error.message });
            continue;
          }

          for (const ms of memberships ?? []) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const member: any = (ms as any).members;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const plan: any = (ms as any).membership_plans;

            if (!member?.mobile) {
              results.push({ membership_id: ms.id, skipped: "no phone" });
              continue;
            }

            const { data: existing } = await supabaseAdmin
              .from("membership_expiry_sends")
              .select("id")
              .eq("membership_id", ms.id)
              .eq("days_before", daysBefore)
              .eq("sent_date", today)
              .maybeSingle();
            if (existing) {
              results.push({ membership_id: ms.id, skipped: "already sent" });
              continue;
            }

            const phone = normalizePhone(member.mobile);
            if (!phone) {
              results.push({ membership_id: ms.id, skipped: "invalid phone" });
              continue;
            }

            const dayWord = daysBefore === 1 ? "tomorrow" : `in ${daysBefore} days`;
            const msg =
              `⏰ *Membership Expiry Reminder*\n` +
              `Hi ${member.full_name || "there"}, your ${plan?.name ?? "gym"} membership expires *${dayWord}* (${ms.end_date}).\n\n` +
              `Please renew to continue enjoying uninterrupted access. Contact us to renew today!`;
            const subject = `Membership expires ${dayWord}`;

            try {
              await sendEvolution(phone, msg);
              await supabaseAdmin.from("membership_expiry_sends").insert({
                membership_id: ms.id, member_id: member.id, days_before: daysBefore,
                sent_date: today, status: "sent",
              });
              await supabaseAdmin.from("notifications").insert({
                channel: "whatsapp", recipient: phone, subject, body: msg,
                status: "sent", sent_at: new Date().toISOString(),
              });
              results.push({ membership_id: ms.id, days_before: daysBefore, sent: true, phone });
            } catch (e) {
              const err = (e as Error).message;
              await supabaseAdmin.from("membership_expiry_sends").insert({
                membership_id: ms.id, member_id: member.id, days_before: daysBefore,
                sent_date: today, status: "failed", error: err,
              });
              await supabaseAdmin.from("notifications").insert({
                channel: "whatsapp", recipient: phone,
                subject: `${subject} (FAILED)`,
                body: `${msg}\n\n---\nError: ${err}`, status: "failed",
              });
              results.push({ membership_id: ms.id, days_before: daysBefore, sent: false, error: err });
            }
          }
        }

        return Response.json({ ok: true, at: today, count: results.length, results });
      },
      GET: async () => Response.json({ ok: true, hint: "POST to trigger" }),
    },
  },
});
