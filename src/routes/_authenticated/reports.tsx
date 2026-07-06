import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/reports")({
  component: Reports,
});

function Reports() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const monthStart = new Date();
      monthStart.setDate(1);
      const iso = monthStart.toISOString().slice(0, 10);

      const [payments, expenses, members, memberships, atts] = await Promise.all([
        supabase.from("payments").select("total, due_amount, paid_on").gte("paid_on", iso),
        supabase.from("expenses").select("amount, spent_on").gte("spent_on", iso),
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase.from("memberships").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("attendance").select("*", { count: "exact", head: true }).gte("check_in", iso + "T00:00:00"),
      ]);

      const revenue = (payments.data ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0);
      const due = (payments.data ?? []).reduce((s, r) => s + Number(r.due_amount ?? 0), 0);
      const exp = (expenses.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
      return {
        revenue,
        due,
        expenses: exp,
        profit: revenue - exp,
        members: members.count ?? 0,
        activeMemberships: memberships.count ?? 0,
        attendance: atts.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Revenue (this month)", value: `₹${(data?.revenue ?? 0).toLocaleString("en-IN")}` },
    { label: "Expenses (this month)", value: `₹${(data?.expenses ?? 0).toLocaleString("en-IN")}` },
    { label: "Profit & Loss", value: `₹${(data?.profit ?? 0).toLocaleString("en-IN")}` },
    { label: "Pending Dues", value: `₹${(data?.due ?? 0).toLocaleString("en-IN")}` },
    { label: "Total Members", value: data?.members ?? "—" },
    { label: "Active Memberships", value: data?.activeMemberships ?? "—" },
    { label: "Attendance (this month)", value: data?.attendance ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Revenue, expenses, profit, attendance & member growth for the current month.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
