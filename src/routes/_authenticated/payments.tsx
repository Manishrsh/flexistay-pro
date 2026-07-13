import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
import { generatePaymentInvoice } from "@/lib/invoice";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/payments")({
  component: () => (
    <ResourcePage
      config={{
        title: "Payments",
        description: "Invoices, cash, UPI, card, net banking.",
        table: "payments",
        fields: [
          { name: "invoice_no", label: "Invoice #", type: "text" },
          { name: "member_id", label: "Member", type: "reference", refTable: "members", refLabel: "full_name" },
          {
            name: "membership_id",
            label: "Membership",
            type: "reference",
            refTable: "membership_options",
            refLabel: "label",
            refSearchColumn: "label",
            autofill: { member_id: "member_id", amount: "amount" },
          },

          { name: "amount", label: "Base amount (₹)", type: "number", step: "0.01", required: true },
          { name: "gst_amount", label: "GST amount (₹)", type: "number", step: "0.01" },
          { name: "discount", label: "Discount (₹)", type: "number", step: "0.01" },
          { name: "total", label: "Total (₹)", type: "number", step: "0.01", required: true },
          { name: "due_amount", label: "Due (₹)", type: "number", step: "0.01" },
          {
            name: "method",
            label: "Method",
            type: "select",
            defaultValue: "cash",
            options: [
              { label: "Cash", value: "cash" },
              { label: "UPI", value: "upi" },
              { label: "Card", value: "card" },
              { label: "Net Banking", value: "netbanking" },
            ],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "paid",
            options: [
              { label: "Paid", value: "paid" },
              { label: "Partial", value: "partial" },
              { label: "Refunded", value: "refunded" },
              { label: "Pending", value: "pending" },
            ],
          },
          { name: "paid_on", label: "Paid on", type: "date" },
          { name: "notes", label: "Notes", type: "textarea" },
        ],
        columns: [
          { key: "invoice_no", label: "Invoice" },
          { key: "member_id", label: "Member" },
          { key: "total", label: "Total (₹)" },
          { key: "due_amount", label: "Due (₹)" },
          { key: "method", label: "Method" },
          { key: "status", label: "Status" },
          { key: "paid_on", label: "Date" },
        ],
        afterSave: async (row) => {
          try {
            await generatePaymentInvoice(row);
            toast.success("Invoice downloaded");
          } catch (e) {
            toast.error("Invoice failed: " + (e as Error).message);
          }
        },
      }}
    />
  ),
});
