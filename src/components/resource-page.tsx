import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Plus, Search, Trash2, Pencil, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "textarea"
  | "checkbox"
  | "select"
  | "reference";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
  step?: string;
  // For type: "reference"
  refTable?: string;
  refValue?: string; // default "id"
  refLabel?: string; // display column, e.g. "full_name"
  refSearchColumn?: string; // column to ilike-search, defaults to refLabel
  // Map: this form field name -> column on the referenced row to copy from
  autofill?: Record<string, string>;
};



export type Column<T = Record<string, unknown>> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export type ResourceConfig = {
  title: string;
  description?: string;
  table: string;
  searchColumn?: string;
  orderBy?: { column: string; ascending?: boolean };
  fields: Field[];
  columns: Column[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export function ResourcePage({ config }: { config: ResourceConfig }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const listKey = ["res", config.table, search];

  const { data: rows = [], isLoading } = useQuery({
    queryKey: listKey,
    queryFn: async () => {
      let q = supabase.from(config.table as never).select("*");
      if (search && config.searchColumn) {
        q = q.ilike(config.searchColumn, `%${search}%`) as typeof q;
      }
      const order = config.orderBy ?? { column: "created_at", ascending: false };
      q = q.order(order.column, { ascending: order.ascending ?? false }) as typeof q;
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (values: Row) => {
      if (editing?.id) {
        const { error } = await supabase
          .from(config.table as never)
          .update(values as never)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(config.table as never).insert(values as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Updated" : "Created");
      setOpen(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["res", config.table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(config.table as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["res", config.table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{config.title}</h1>
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {config.searchColumn && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 w-64"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </DialogTrigger>
            <ResourceForm
              key={editing?.id ?? "new"}
              config={config}
              initial={editing}
              onSubmit={(v) => upsert.mutate(v)}
              submitting={upsert.isPending}
            />
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={config.columns.length + 1} className="text-center py-8 text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={config.columns.length + 1} className="text-center py-8 text-muted-foreground">
                  No records yet. Click Add to create one.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id as string}>
                {config.columns.map((c) => (
                  <TableCell key={c.key}>
                    {c.render ? c.render(r) : formatCell(r[c.key])}
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(r);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this record?")) del.mutate(r.id as string);
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatCell(v: unknown): React.ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-muted-foreground">—</span>;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
    return new Date(v).toLocaleString();
  }
  return String(v);
}

function ResourceForm({
  config,
  initial,
  onSubmit,
  submitting,
}: {
  config: ResourceConfig;
  initial: Row | null;
  onSubmit: (v: Row) => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<Row>(() => {
    const seed: Row = {};
    for (const f of config.fields) {
      seed[f.name] = initial?.[f.name] ?? f.defaultValue ?? (f.type === "checkbox" ? false : "");
    }
    return seed;
  });

  function set<K extends string>(k: K, v: unknown) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean: Row = {};
    for (const f of config.fields) {
      let v = values[f.name];
      if (f.type === "number") v = v === "" || v == null ? null : Number(v);
      if ((v === "" || v == null) && !f.required) v = null;
      clean[f.name] = v;
    }
    onSubmit(clean);
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{initial ? "Edit" : "Add"} {config.title.replace(/s$/, "")}</DialogTitle>
        <DialogDescription>Fill in the details and save.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {config.fields.map((f) => (
            <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
              <Label>
                {f.label}
                {f.required && <span className="text-destructive"> *</span>}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  required={f.required}
                />
              ) : f.type === "checkbox" ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={!!values[f.name]}
                    onCheckedChange={(v) => set(f.name, !!v)}
                  />
                  <span className="text-sm text-muted-foreground">Enabled</span>
                </div>
              ) : f.type === "select" ? (
                <Select
                  value={values[f.name] ? String(values[f.name]) : ""}
                  onValueChange={(v) => set(f.name, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "reference" ? (
                <ReferenceCombobox
                  field={f}
                  value={values[f.name] ? String(values[f.name]) : ""}
                  onChange={(v, row) => {
                    setValues((s) => {
                      const next: Row = { ...s, [f.name]: v };
                      if (row && f.autofill) {
                        for (const [target, src] of Object.entries(f.autofill)) {
                          const val = row[src];
                          if (val !== undefined && val !== null) next[target] = val;
                        }
                      }
                      return next;
                    });
                  }}
                  required={f.required}
                />

              ) : (
                <Input
                  type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                  step={f.step}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  required={f.required}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function ReferenceCombobox({
  field,
  value,
  onChange,
  required,
}: {
  field: Field;
  value: string;
  onChange: (v: string, row?: Row | null) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const table = field.refTable!;
  const valueCol = field.refValue ?? "id";
  const labelCol = field.refLabel ?? "name";
  const searchCol = field.refSearchColumn ?? labelCol;

  const { data: options = [] } = useQuery({
    queryKey: ["ref-opts", table, labelCol, search],
    queryFn: async () => {
      let q = supabase.from(table as never).select("*");
      if (search) q = q.ilike(searchCol, `%${search}%`) as typeof q;
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });


  const { data: selected } = useQuery({
    queryKey: ["ref-selected", table, labelCol, value],
    enabled: !!value,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table as never)
        .select(`${valueCol}, ${labelCol}`)
        .eq(valueCol, value)
        .maybeSingle();
      if (error) throw error;
      return data as Row | null;
    },
  });

  const selectedLabel =
    (selected?.[labelCol] as string | undefined) ??
    (options.find((o) => String(o[valueCol]) === value)?.[labelCol] as string | undefined);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}
          >
            {selectedLabel ?? (value ? value.slice(0, 8) + "…" : "Select…")}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search…" value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onChange("");
                      setOpen(false);
                    }}
                  >
                    <span className="text-muted-foreground">Clear selection</span>
                  </CommandItem>
                )}
                {options.map((o) => {
                  const v = String(o[valueCol]);
                  const l = String(o[labelCol] ?? v);
                  return (
                    <CommandItem
                      key={v}
                      value={v}
                      onSelect={() => {
                        onChange(v, o);
                        setOpen(false);
                      }}

                    >
                      <Check className={cn("h-4 w-4", value === v ? "opacity-100" : "opacity-0")} />
                      {l}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* hidden input for native required validation */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          value={value}
          onChange={() => {}}
          required
        />
      )}
    </>
  );
}
