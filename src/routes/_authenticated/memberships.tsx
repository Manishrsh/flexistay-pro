import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/memberships")({
  component: () => (
    <ResourcePage
      config={{
        title: "Memberships",
        description: "Assign plans to members.",
        table: "memberships",
        fields: [
          { name: "member_id", label: "Member ID (UUID)", type: "text", required: true },
          { name: "plan_id", label: "Plan ID (UUID)", type: "text", required: true },
          { name: "start_date", label: "Start date", type: "date", required: true },
          { name: "end_date", label: "End date", type: "date", required: true },
          { name: "amount", label: "Amount", type: "number", step: "0.01" },
          { name: "discount", label: "Discount", type: "number", step: "0.01" },
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "active",
            options: [
              { label: "Active", value: "active" },
              { label: "Expired", value: "expired" },
              { label: "Frozen", value: "frozen" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
        ],
        columns: [
          { key: "member_id", label: "Member" },
          { key: "plan_id", label: "Plan" },
          { key: "start_date", label: "Start" },
          { key: "end_date", label: "End" },
          { key: "amount", label: "Amount" },
          { key: "status", label: "Status" },
        ],
      }}
    />
  ),
});
