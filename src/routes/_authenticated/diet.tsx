import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/diet")({
  component: () => (
    <ResourcePage
      config={{
        title: "Diet Plans",
        table: "diet_plans",
        searchColumn: "name",
        fields: [
          { name: "name", label: "Plan name", type: "text", required: true },
          { name: "member_id", label: "Member ID (optional)", type: "text" },
          { name: "breakfast", label: "Breakfast", type: "textarea" },
          { name: "lunch", label: "Lunch", type: "textarea" },
          { name: "snacks", label: "Snacks", type: "textarea" },
          { name: "dinner", label: "Dinner", type: "textarea" },
          { name: "calories", label: "Calories (kcal)", type: "number" },
          { name: "protein_g", label: "Protein (g)", type: "number" },
          { name: "water_liters", label: "Water (L)", type: "number", step: "0.1" },
          { name: "notes", label: "Notes", type: "textarea" },
        ],
        columns: [
          { key: "name", label: "Name" },
          { key: "calories", label: "kcal" },
          { key: "protein_g", label: "Protein (g)" },
          { key: "water_liters", label: "Water (L)" },
        ],
      }}
    />
  ),
});
