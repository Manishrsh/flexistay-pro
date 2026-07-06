import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/branches")({
  component: () => (
    <ResourcePage
      config={{
        title: "Branches",
        table: "branches",
        searchColumn: "name",
        fields: [
          { name: "name", label: "Branch name", type: "text", required: true },
          { name: "address", label: "Address", type: "textarea" },
          { name: "phone", label: "Phone", type: "text" },
          { name: "email", label: "Email", type: "text" },
          { name: "is_active", label: "Active", type: "checkbox", defaultValue: true },
        ],
        columns: [
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "is_active", label: "Active" },
        ],
      }}
    />
  ),
});
