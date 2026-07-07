import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/workouts")({
  component: () => (
    <ResourcePage
      config={{
        title: "Workout Plans",
        description: "Plans you can assign to members. Add exercises per plan via SQL or extend this module later.",
        table: "workout_plans",
        searchColumn: "name",
        fields: [
          { name: "name", label: "Plan name", type: "text", required: true },
          { name: "member_id", label: "Member (optional)", type: "reference", refTable: "members", refLabel: "full_name" },
          { name: "trainer_id", label: "Trainer (optional)", type: "reference", refTable: "trainers", refLabel: "full_name" },
          { name: "notes", label: "Notes", type: "textarea" },
        ],
        columns: [
          { key: "name", label: "Name" },
          { key: "member_id", label: "Member" },
          { key: "trainer_id", label: "Trainer" },
        ],
      }}
    />
  ),
});
