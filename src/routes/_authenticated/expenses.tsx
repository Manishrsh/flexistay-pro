import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/expenses")({
  component: () => (
    <ResourcePage
      config={{
        title: "Expenses",
        table: "expenses",
        fields: [
          {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            options: [
              { label: "Rent", value: "rent" },
              { label: "Electricity", value: "electricity" },
              { label: "Equipment", value: "equipment" },
              { label: "Salary", value: "salary" },
              { label: "Marketing", value: "marketing" },
              { label: "Maintenance", value: "maintenance" },
              { label: "Miscellaneous", value: "misc" },
            ],
          },
          { name: "amount", label: "Amount (₹)", type: "number", step: "0.01", required: true },
          { name: "spent_on", label: "Date", type: "date" },
          { name: "vendor", label: "Vendor", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
        ],
        columns: [
          { key: "category", label: "Category" },
          { key: "amount", label: "Amount (₹)" },
          { key: "vendor", label: "Vendor" },
          { key: "spent_on", label: "Date" },
        ],
      }}
    />
  ),
});
