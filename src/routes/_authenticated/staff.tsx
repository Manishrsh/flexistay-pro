import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/staff")({
  component: () => (
    <ResourcePage
      config={{
        title: "Staff",
        table: "staff",
        searchColumn: "full_name",
        fields: [
          { name: "full_name", label: "Full name", type: "text", required: true },
          {
            name: "role_title",
            label: "Role",
            type: "select",
            required: true,
            options: [
              { label: "Receptionist", value: "Receptionist" },
              { label: "Cleaner", value: "Cleaner" },
              { label: "Trainer", value: "Trainer" },
              { label: "Manager", value: "Manager" },
              { label: "Accountant", value: "Accountant" },
            ],
          },
          { name: "mobile", label: "Mobile", type: "text" },
          { name: "email", label: "Email", type: "text" },
          { name: "salary", label: "Salary (₹)", type: "number", step: "0.01" },
          { name: "joined_on", label: "Joined on", type: "date" },
          { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
        ],
        columns: [
          { key: "full_name", label: "Name" },
          { key: "role_title", label: "Role" },
          { key: "mobile", label: "Mobile" },
          { key: "salary", label: "Salary" },
          { key: "is_active", label: "Active" },
        ],
      }}
    />
  ),
});
