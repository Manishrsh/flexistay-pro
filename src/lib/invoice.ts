import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, unknown>;

export async function generatePaymentInvoice(payment: Row) {
  // Load related records + settings in parallel
  const memberId = payment.member_id as string | null;
  const membershipId = payment.membership_id as string | null;

  const [settingsRes, memberRes, membershipRes] = await Promise.all([
    supabase.from("settings").select("*").limit(1).maybeSingle(),
    memberId
      ? supabase.from("members").select("*").eq("id", memberId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    membershipId
      ? supabase.from("memberships").select("*").eq("id", membershipId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const settings = (settingsRes.data ?? {}) as Row;
  const member = (memberRes.data ?? null) as Row | null;
  const membership = (membershipRes.data ?? null) as Row | null;

  let plan: Row | null = null;
  if (membership?.plan_id) {
    const { data } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", membership.plan_id)
      .maybeSingle();
    plan = data as Row | null;
  }

  const sym = (settings.currency_symbol as string) || "Rs.";
  const biz = (settings.business_name as string) || "Gym";
  const addr = (settings.address as string) || "";
  const phone = (settings.phone as string) || "";
  const email = (settings.email as string) || "";

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 48;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(biz, 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 16;
  if (addr) { doc.text(addr, 40, y); y += 12; }
  const contact = [phone, email].filter(Boolean).join("  •  ");
  if (contact) { doc.text(contact, 40, y); y += 12; }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("TAX INVOICE", W - 40, 48, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice #: ${(payment.invoice_no as string) || (payment.id as string)?.slice(0, 8) || "-"}`, W - 40, 66, { align: "right" });
  const dateStr = (payment.paid_on as string) || new Date().toISOString().slice(0, 10);
  doc.text(`Date: ${dateStr}`, W - 40, 80, { align: "right" });
  doc.text(`Method: ${(payment.method as string) || "-"}`, W - 40, 94, { align: "right" });
  doc.text(`Status: ${(payment.status as string) || "-"}`, W - 40, 108, { align: "right" });

  y = Math.max(y, 120);
  doc.setDrawColor(200);
  doc.line(40, y, W - 40, y);
  y += 20;

  // Bill to
  doc.setFont("helvetica", "bold");
  doc.text("Bill To", 40, y);
  doc.setFont("helvetica", "normal");
  y += 14;
  if (member) {
    doc.text(String(member.full_name ?? ""), 40, y); y += 12;
    if (member.phone) { doc.text(String(member.phone), 40, y); y += 12; }
    if (member.email) { doc.text(String(member.email), 40, y); y += 12; }
    if (member.address) { doc.text(String(member.address), 40, y); y += 12; }
  } else {
    doc.text("—", 40, y); y += 12;
  }

  y += 12;

  // Line items table
  const tableTop = y;
  doc.setFillColor(240);
  doc.rect(40, tableTop, W - 80, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Description", 48, tableTop + 15);
  doc.text("Amount", W - 48, tableTop + 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  y = tableTop + 22;

  const desc: string[] = [];
  if (plan) {
    desc.push(`Plan: ${plan.name ?? "-"}`);
    if (plan.duration_days) desc.push(`Duration: ${plan.duration_days} days`);
  }
  if (membership) {
    if (membership.start_date && membership.end_date) {
      desc.push(`Period: ${membership.start_date} to ${membership.end_date}`);
    }
  }
  if (!desc.length) desc.push("Payment");

  const base = Number(payment.amount ?? 0);
  const gst = Number(payment.gst_amount ?? 0);
  const discount = Number(payment.discount ?? 0);
  const total = Number(payment.total ?? base + gst - discount);
  const due = Number(payment.due_amount ?? 0);

  const rowH = 20;
  desc.forEach((line, i) => {
    doc.text(line, 48, y + 14 + i * 12);
  });
  const descH = Math.max(rowH, desc.length * 12 + 8);
  doc.text(`${sym}${base.toFixed(2)}`, W - 48, y + 14, { align: "right" });
  y += descH;

  doc.setDrawColor(220);
  doc.line(40, y, W - 40, y);
  y += 8;

  // Totals block
  const totalsX = W - 220;
  const valX = W - 48;
  const row = (label: string, val: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(label, totalsX, y);
    doc.text(val, valX, y, { align: "right" });
    y += 16;
  };
  row("Subtotal", `${sym}${base.toFixed(2)}`);
  if (gst) row("GST", `${sym}${gst.toFixed(2)}`);
  if (discount) row("Discount", `- ${sym}${discount.toFixed(2)}`);
  row("Total", `${sym}${total.toFixed(2)}`, true);
  if (due) row("Due", `${sym}${due.toFixed(2)}`);

  y += 24;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Thank you for your payment.", 40, y);

  const fileName = `invoice-${(payment.invoice_no as string) || (payment.id as string)?.slice(0, 8) || Date.now()}.pdf`;
  doc.save(fileName);
}
