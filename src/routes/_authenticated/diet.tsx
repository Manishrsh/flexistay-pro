import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus, Trash2, Pencil, Calendar as CalendarIcon, ChevronsUpDown, Check, Zap } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { testEvolutionApi } from "@/lib/evolution-test.functions";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Plan = {
  id: string;
  name: string;
  member_id: string | null;
  notes: string | null;
  calories: number | null;
  protein_g: number | null;
  water_liters: number | null;
};
type Meal = {
  id: string;
  plan_id: string;
  day_of_week: number;
  meal_time: string;
  meal_name: string;
  description: string | null;
  notify: boolean;
};

function DietPage() {
  const qc = useQueryClient();
  const [planOpen, setPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [schedulePlan, setSchedulePlan] = useState<Plan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["diet_plans_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diet_plans")
        .select("id, name, member_id, notes, calories, protein_g, water_liters")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Plan[];
    },
  });

  const delPlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diet_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["diet_plans_all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Diet Plans</h1>
          <p className="text-sm text-muted-foreground">
            Build weekly meal schedules with times. WhatsApp reminders auto-send at meal time (IST).
          </p>
        </div>
        <div className="flex gap-2">
          <EvolutionTestButton />
          <Dialog open={planOpen} onOpenChange={(v) => { setPlanOpen(v); if (!v) setEditingPlan(null); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> New Plan</Button>
            </DialogTrigger>
            <PlanForm
              key={editingPlan?.id ?? "new"}
              initial={editingPlan}
              onDone={() => { setPlanOpen(false); setEditingPlan(null); qc.invalidateQueries({ queryKey: ["diet_plans_all"] }); }}
            />
          </Dialog>
        </div>

      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Calories</TableHead>
              <TableHead>Protein (g)</TableHead>
              <TableHead>Water (L)</TableHead>
              <TableHead className="w-64 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>}
            {!isLoading && plans.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No plans yet.</TableCell></TableRow>
            )}
            {plans.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.calories ?? "—"}</TableCell>
                <TableCell>{p.protein_g ?? "—"}</TableCell>
                <TableCell>{p.water_liters ?? "—"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setSchedulePlan(p)}>
                    <CalendarIcon className="h-4 w-4" /> Schedule
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingPlan(p); setPlanOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="text-destructive"
                    onClick={() => { if (confirm("Delete plan?")) delPlan.mutate(p.id); }}
                  ><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!schedulePlan} onOpenChange={(v) => !v && setSchedulePlan(null)}>
        {schedulePlan && <ScheduleEditor plan={schedulePlan} />}
      </Dialog>
    </div>
  );
}

function PlanForm({ initial, onDone }: { initial: Plan | null; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [memberId, setMemberId] = useState(initial?.member_id ?? "");
  const [calories, setCalories] = useState(initial?.calories?.toString() ?? "");
  const [protein, setProtein] = useState(initial?.protein_g?.toString() ?? "");
  const [water, setWater] = useState(initial?.water_liters?.toString() ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const values = {
      name,
      member_id: memberId || null,
      calories: calories ? Number(calories) : null,
      protein_g: protein ? Number(protein) : null,
      water_liters: water ? Number(water) : null,
      notes: notes || null,
    };
    try {
      if (initial?.id) {
        const { error } = await supabase.from("diet_plans").update(values).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("diet_plans").insert(values);
        if (error) throw error;
      }
      toast.success("Saved");
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{initial ? "Edit" : "New"} Diet Plan</DialogTitle>
        <DialogDescription>Assign to a member to enable WhatsApp reminders.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Plan name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Member</Label>
          <MemberPicker value={memberId} onChange={setMemberId} />
        </div>
        <div className="space-y-1.5"><Label>Calories (kcal)</Label><Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Protein (g)</Label><Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Water (L)</Label><Input type="number" step="0.1" value={water} onChange={(e) => setWater(e.target.value)} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <DialogFooter className="sm:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function MemberPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: options = [] } = useQuery({
    queryKey: ["members-opts", search],
    queryFn: async () => {
      let q = supabase.from("members").select("id, full_name, mobile");
      if (search) q = q.ilike("full_name", `%${search}%`) as typeof q;
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: selected } = useQuery({
    queryKey: ["member-sel", value],
    enabled: !!value,
    queryFn: async () => {
      const { data } = await supabase.from("members").select("id, full_name").eq("id", value).maybeSingle();
      return data;
    },
  });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}>
          {selected?.full_name ?? (value ? "…" : "Select member…")}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search members…" value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No members.</CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem value="__clear__" onSelect={() => { onChange(""); setOpen(false); }}>
                  <span className="text-muted-foreground">Clear</span>
                </CommandItem>
              )}
              {options.map((o) => (
                <CommandItem key={o.id} value={o.id} onSelect={() => { onChange(o.id); setOpen(false); }}>
                  <Check className={cn("h-4 w-4", value === o.id ? "opacity-100" : "opacity-0")} />
                  {o.full_name} <span className="text-muted-foreground text-xs ml-2">{o.mobile}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ScheduleEditor({ plan }: { plan: Plan }) {
  const qc = useQueryClient();
  const { data: meals = [] } = useQuery({
    queryKey: ["diet_meals", plan.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diet_meals")
        .select("*")
        .eq("plan_id", plan.id)
        .order("day_of_week")
        .order("meal_time");
      if (error) throw error;
      return (data ?? []) as Meal[];
    },
  });

  const add = useMutation({
    mutationFn: async (row: Omit<Meal, "id">) => {
      const { error } = await supabase.from("diet_meals").insert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diet_meals", plan.id] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: async (m: Meal) => {
      const { error } = await supabase.from("diet_meals").update({
        day_of_week: m.day_of_week, meal_time: m.meal_time, meal_name: m.meal_name,
        description: m.description, notify: m.notify,
      }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diet_meals", plan.id] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diet_meals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diet_meals", plan.id] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Weekly schedule — {plan.name}</DialogTitle>
        <DialogDescription>
          Add meals per day with time (24h, IST). Enable "Notify" to send a WhatsApp reminder at that time.
          {!plan.member_id && <span className="block text-destructive mt-1">No member assigned — reminders won't be sent until you link a member.</span>}
        </DialogDescription>
      </DialogHeader>

      <NewMealRow onAdd={(row) => add.mutate({ ...row, plan_id: plan.id })} />

      <div className="max-h-[55vh] overflow-y-auto space-y-4 mt-2">
        {DAYS.map((day, idx) => {
          const dayMeals = meals.filter((m) => m.day_of_week === idx);
          return (
            <div key={idx} className="rounded-md border">
              <div className="px-3 py-2 bg-muted/40 font-medium text-sm">{day}</div>
              {dayMeals.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">No meals scheduled.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Time</TableHead>
                      <TableHead className="w-48">Meal</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Notify</TableHead>
                      <TableHead className="w-24" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayMeals.map((m) => (
                      <MealRow key={m.id} meal={m} onSave={(u) => update.mutate(u)} onDelete={() => del.mutate(m.id)} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          );
        })}
      </div>
    </DialogContent>
  );
}

function NewMealRow({ onAdd }: { onAdd: (row: Omit<Meal, "id" | "plan_id">) => void }) {
  const [day, setDay] = useState("1");
  const [time, setTime] = useState("08:00");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [notify, setNotify] = useState(true);
  return (
    <div className="grid grid-cols-1 md:grid-cols-[120px_100px_1fr_2fr_auto_auto] gap-2 items-end p-3 rounded-md border bg-muted/20">
      <div className="space-y-1"><Label className="text-xs">Day</Label>
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label className="text-xs">Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
      <div className="space-y-1"><Label className="text-xs">Meal</Label><Input placeholder="Breakfast" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="space-y-1"><Label className="text-xs">Description</Label><Input placeholder="2 eggs, oats, banana…" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      <div className="flex items-center gap-2 pb-2"><Checkbox checked={notify} onCheckedChange={(v) => setNotify(!!v)} /><span className="text-xs">Notify</span></div>
      <Button
        size="sm"
        onClick={() => {
          if (!name) { toast.error("Meal name required"); return; }
          onAdd({ day_of_week: Number(day), meal_time: time, meal_name: name, description: desc || null, notify });
          setName(""); setDesc("");
        }}
      ><Plus className="h-4 w-4" /> Add</Button>
    </div>
  );
}

function MealRow({ meal, onSave, onDelete }: { meal: Meal; onSave: (m: Meal) => void; onDelete: () => void }) {
  const [m, setM] = useState(meal);
  const dirty = JSON.stringify(m) !== JSON.stringify(meal);
  return (
    <TableRow>
      <TableCell><Input type="time" value={m.meal_time.slice(0, 5)} onChange={(e) => setM({ ...m, meal_time: e.target.value })} /></TableCell>
      <TableCell><Input value={m.meal_name} onChange={(e) => setM({ ...m, meal_name: e.target.value })} /></TableCell>
      <TableCell><Input value={m.description ?? ""} onChange={(e) => setM({ ...m, description: e.target.value })} /></TableCell>
      <TableCell><Checkbox checked={m.notify} onCheckedChange={(v) => setM({ ...m, notify: !!v })} /></TableCell>
      <TableCell className="flex gap-1">
        {dirty && <Button size="sm" onClick={() => onSave(m)}>Save</Button>}
        <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
      </TableCell>
    </TableRow>
  );
}

export const Route = createFileRoute("/_authenticated/diet")({
  component: DietPage,
});
