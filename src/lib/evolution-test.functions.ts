import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const testEvolutionApi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { phone?: string; message?: string }) => input)
  .handler(async ({ data }) => {
    const url = process.env.EVOLUTION_API_URL?.replace(/\/+$/, "");
    const key = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;

    const config = {
      url_set: !!url,
      key_set: !!key,
      instance_set: !!instance,
      url_preview: url ?? null,
      instance,
    };

    if (!url || !key || !instance) {
      return { ok: false, step: "config", config, error: "Missing EVOLUTION_API_URL / EVOLUTION_API_KEY / EVOLUTION_INSTANCE" };
    }

    // 1) Check instance connection state
    const stateUrl = `${url}/instance/connectionState/${instance}`;
    let stateStatus = 0;
    let stateBody = "";
    try {
      const r = await fetch(stateUrl, { headers: { apikey: key } });
      stateStatus = r.status;
      stateBody = await r.text();
    } catch (e) {
      return { ok: false, step: "connectionState", config, request_url: stateUrl, error: (e as Error).message };
    }

    // 2) Optional test send
    let send: { url: string; status?: number; body?: string; error?: string; payload: { number: string; text: string } } | null = null;
    if (data.phone) {
      const sendUrl = `${url}/message/sendText/${instance}`;
      const payload = { number: data.phone, text: data.message || "Test from gym admin ✅" };
      try {
        const r = await fetch(sendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: key },
          body: JSON.stringify(payload),
        });
        send = { url: sendUrl, status: r.status, body: await r.text(), payload };
      } catch (e) {
        send = { url: sendUrl, error: (e as Error).message, payload };
      }
    }


    return {
      ok: stateStatus >= 200 && stateStatus < 300,
      config,
      connectionState: { url: stateUrl, status: stateStatus, body: stateBody },
      send,
    };
  });
