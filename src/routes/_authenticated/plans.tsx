import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/plans")({
  component: () => (
    <ResourcePage
      config={{
        title: "Membership Plans",
        description: "Define the plans you sell.",
        table: "membership_plans",
        searchColumn: "name",
        fields: [
          { name: "name", label: "Plan name", type: "text", required: true },
          { name: "duration_days", label: "Duration (days)", type: "number", required: true },
          { name: "price", label: "Price (₹)", type: "number", step: "0.01", required: true },
          { name: "gst_percent", label: "GST %", type: "number", step: "0.01", defaultValue: 18 },
          { name: "freeze_days", label: "Freeze days", type: "number", defaultValue: 0 },
          { name: "personal_training", label: "Personal training included", type: "checkbox" },
          { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
          { name: "description", label: "Description", type: "textarea" },
        ],
        columns: [
          { key: "name", label: "Name" },
          { key: "duration_days", label: "Days" },
          { key: "price", label: "Price (₹)" },
          { key: "gst_percent", label: "GST %" },
          { key: "is_active", label: "Active" },
        ],
      }}
    />
  ),
});
