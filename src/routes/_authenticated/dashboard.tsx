import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserPlus,
  CalendarClock,
  IndianRupee,
  AlertCircle,
  Dumbbell,
  CalendarCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      const todayISO = today.toISOString().slice(0, 10);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      const in7 = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

      const [tm, am, nm, exp, rev, due, tr, att] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .gte("joined_on", monthStart),
        supabase
          .from("memberships")
          .select("*", { count: "exact", head: true })
          .lte("end_date", in7)
          .gte("end_date", todayISO),
        supabase.from("payments").select("total").eq("paid_on", todayISO),
        supabase.from("payments").select("due_amount").gt("due_amount", 0),
        supabase.from("trainers").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("attendance").select("*", { count: "exact", head: true }).gte("check_in", todayISO + "T00:00:00"),
      ]);

      const todayRevenue = (rev.data ?? []).reduce((s, p) => s + Number(p.total ?? 0), 0);
      const pendingDue = (due.data ?? []).reduce((s, p) => s + Number(p.due_amount ?? 0), 0);

      return {
        totalMembers: tm.count ?? 0,
        activeMembers: am.count ?? 0,
        newThisMonth: nm.count ?? 0,
        expiringSoon: exp.count ?? 0,
        todayRevenue,
        pendingDue,
        trainers: tr.count ?? 0,
        todayCheckins: att.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Total Members", value: stats?.totalMembers ?? "—", icon: Users, tone: "text-blue-600" },
    { label: "Active Members", value: stats?.activeMembers ?? "—", icon: UserCheck, tone: "text-emerald-600" },
    { label: "New This Month", value: stats?.newThisMonth ?? "—", icon: UserPlus, tone: "text-violet-600" },
    { label: "Expiring in 7 days", value: stats?.expiringSoon ?? "—", icon: CalendarClock, tone: "text-amber-600" },
    { label: "Today's Revenue", value: `₹${(stats?.todayRevenue ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, tone: "text-emerald-600" },
    { label: "Pending Dues", value: `₹${(stats?.pendingDue ?? 0).toLocaleString("en-IN")}`, icon: AlertCircle, tone: "text-red-600" },
    { label: "Active Trainers", value: stats?.trainers ?? "—", icon: Dumbbell, tone: "text-indigo-600" },
    { label: "Today's Check-ins", value: stats?.todayCheckins ?? "—", icon: CalendarCheck, tone: "text-cyan-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Snapshot of your gym today.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${c.tone}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Add your <strong>Branches</strong> and <strong>Membership Plans</strong>.</p>
          <p>2. Add <strong>Members</strong>, assign a plan under <strong>Memberships</strong>.</p>
          <p>3. Record <strong>Payments</strong> and <strong>Attendance</strong>. Track <strong>Expenses</strong>, review <strong>Reports</strong>.</p>
          <p>4. Manage <strong>Trainers</strong>, <strong>Workout &amp; Diet plans</strong>, <strong>Inventory</strong> and <strong>Leads</strong>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
