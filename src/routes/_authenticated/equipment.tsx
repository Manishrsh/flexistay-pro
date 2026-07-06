import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/equipment")({
  component: () => (
    <ResourcePage
      config={{
        title: "Equipment",
        table: "equipment",
        searchColumn: "name",
        fields: [
          { name: "name", label: "Equipment name", type: "text", required: true },
          { name: "purchase_date", label: "Purchase date", type: "date" },
          { name: "warranty_until", label: "Warranty until", type: "date" },
          { name: "last_service_date", label: "Last service date", type: "date" },
          {
            name: "condition",
            label: "Condition",
            type: "select",
            defaultValue: "good",
            options: [
              { label: "New", value: "new" },
              { label: "Good", value: "good" },
              { label: "Needs Service", value: "needs_service" },
              { label: "Broken", value: "broken" },
            ],
          },
          { name: "vendor", label: "Vendor", type: "text" },
          { name: "cost", label: "Cost (₹)", type: "number", step: "0.01" },
        ],
        columns: [
          { key: "name", label: "Name" },
          { key: "condition", label: "Condition" },
          { key: "purchase_date", label: "Purchased" },
          { key: "warranty_until", label: "Warranty" },
          { key: "cost", label: "Cost" },
        ],
      }}
    />
  ),
});
