import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Settings = {
  id: string;
  business_name: string;
  currency: string;
  currency_symbol: string;
  gst_percent: number;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  theme: string;
};

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });

  const [form, setForm] = useState<Partial<Settings>>({});
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data?.id) return;
      const { error } = await supabase.from("settings").update(form).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function up<K extends keyof Settings>(k: K, v: Settings[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Business details, tax and currency.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business</CardTitle>
          <CardDescription>These details appear on invoices and receipts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Business name</Label>
              <Input value={form.business_name ?? ""} onChange={(e) => up("business_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone ?? ""} onChange={(e) => up("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={form.email ?? ""} onChange={(e) => up("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input value={form.currency ?? "INR"} onChange={(e) => up("currency", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency symbol</Label>
              <Input value={form.currency_symbol ?? "₹"} onChange={(e) => up("currency_symbol", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Default GST %</Label>
              <Input
                type="number"
                step="0.01"
                value={form.gst_percent ?? 18}
                onChange={(e) => up("gst_percent", Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address ?? ""} onChange={(e) => up("address", e.target.value)} />
            </div>
          </div>
          <div>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
