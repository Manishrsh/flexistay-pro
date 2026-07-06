import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: () => (
    <ResourcePage
      config={{
        title: "Notifications",
        description: "SMS, WhatsApp and email notification log. Wire an SMS/WhatsApp/Email provider later.",
        table: "notifications",
        fields: [
          {
            name: "channel",
            label: "Channel",
            type: "select",
            defaultValue: "email",
            options: [
              { label: "Email", value: "email" },
              { label: "SMS", value: "sms" },
              { label: "WhatsApp", value: "whatsapp" },
            ],
          },
          { name: "recipient", label: "Recipient (email or phone)", type: "text", required: true },
          { name: "subject", label: "Subject", type: "text" },
          { name: "body", label: "Body", type: "textarea" },
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "queued",
            options: [
              { label: "Queued", value: "queued" },
              { label: "Sent", value: "sent" },
              { label: "Failed", value: "failed" },
            ],
          },
        ],
        columns: [
          { key: "channel", label: "Channel" },
          { key: "recipient", label: "Recipient" },
          { key: "subject", label: "Subject" },
          { key: "status", label: "Status" },
          { key: "created_at", label: "Created" },
        ],
      }}
    />
  ),
});
