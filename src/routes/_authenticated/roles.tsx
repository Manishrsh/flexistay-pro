import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/roles")({
  component: () => (
    <ResourcePage
      config={{
        title: "Roles & Permissions",
        description:
          "Choose a team member and assign their access level. The first signed-up user is automatically the Owner.",
        table: "user_roles",
        fields: [
          { name: "user_id", label: "Team member", type: "reference", required: true, refTable: "user_profiles", refLabel: "display_name", refSearchColumn: "display_name" },
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
          { key: "user_id", label: "Team member" },
          { key: "role", label: "Role" },
          { key: "created_at", label: "Assigned" },
        ],
      }}
    />
  ),
});
