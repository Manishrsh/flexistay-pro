import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/roles")({
  component: () => (
    <ResourcePage
      config={{
        title: "Roles & Permissions",
        description:
          "Assign a role to a user by their auth User ID. The first signed-up user is automatically the Owner.",
        table: "user_roles",
        fields: [
          { name: "user_id", label: "User ID (auth.users UUID)", type: "text", required: true },
          {
            name: "role",
            label: "Role",
            type: "select",
            required: true,
            options: [
              { label: "Super Admin", value: "super_admin" },
              { label: "Owner", value: "owner" },
              { label: "Manager", value: "manager" },
              { label: "Trainer", value: "trainer" },
              { label: "Receptionist", value: "receptionist" },
              { label: "Accountant", value: "accountant" },
            ],
          },
        ],
        columns: [
          { key: "user_id", label: "User ID" },
          { key: "role", label: "Role" },
          { key: "created_at", label: "Assigned" },
        ],
      }}
    />
  ),
});
