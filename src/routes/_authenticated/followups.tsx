import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/followups")({
  component: () => (
    <ResourcePage
      config={{
        title: "Follow-ups",
        table: "followups",
        orderBy: { column: "followup_at", ascending: false },
        fields: [
          { name: "lead_id", label: "Lead (optional)", type: "reference", refTable: "leads", refLabel: "full_name" },
          { name: "member_id", label: "Member (optional)", type: "reference", refTable: "members", refLabel: "full_name" },
          { name: "followup_at", label: "Follow-up at (ISO)", type: "text", defaultValue: new Date().toISOString() },
          {
            name: "channel",
            label: "Channel",
            type: "select",
            defaultValue: "call",
            options: [
              { label: "Call", value: "call" },
              { label: "WhatsApp", value: "whatsapp" },
              { label: "SMS", value: "sms" },
              { label: "Email", value: "email" },
              { label: "In-person", value: "in_person" },
            ],
          },
          { name: "outcome", label: "Outcome", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
          { name: "done", label: "Done", type: "checkbox" },
        ],
        columns: [
          { key: "followup_at", label: "When" },
          { key: "channel", label: "Channel" },
          { key: "outcome", label: "Outcome" },
          { key: "done", label: "Done" },
        ],
      }}
    />
  ),
});
