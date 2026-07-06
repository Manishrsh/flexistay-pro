import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/trainers")({
  component: () => (
    <ResourcePage
      config={{
        title: "Trainers",
        table: "trainers",
        searchColumn: "full_name",
        fields: [
          { name: "full_name", label: "Full name", type: "text", required: true },
          { name: "mobile", label: "Mobile", type: "text" },
          { name: "email", label: "Email", type: "text" },
          { name: "experience_years", label: "Experience (years)", type: "number" },
          { name: "specialization", label: "Specialization", type: "text" },
          { name: "salary", label: "Salary (₹)", type: "number", step: "0.01" },
          { name: "working_hours", label: "Working hours", type: "text" },
          { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
        ],
        columns: [
          { key: "full_name", label: "Name" },
          { key: "specialization", label: "Specialization" },
          { key: "experience_years", label: "Exp (yrs)" },
          { key: "salary", label: "Salary" },
          { key: "is_active", label: "Active" },
        ],
      }}
    />
  ),
});
