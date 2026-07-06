import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/leads")({
  component: () => (
    <ResourcePage
      config={{
        title: "Leads",
        description: "Walk-ins and online enquiries.",
        table: "leads",
        searchColumn: "full_name",
        fields: [
          { name: "full_name", label: "Full name", type: "text", required: true },
          { name: "mobile", label: "Mobile", type: "text" },
          { name: "email", label: "Email", type: "text" },
          {
            name: "source",
            label: "Source",
            type: "select",
            defaultValue: "walk_in",
            options: [
              { label: "Walk-in", value: "walk_in" },
              { label: "Facebook", value: "facebook" },
              { label: "Instagram", value: "instagram" },
              { label: "Website", value: "website" },
              { label: "Referral", value: "referral" },
            ],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "new",
            options: [
              { label: "New", value: "new" },
              { label: "Contacted", value: "contacted" },
              { label: "Trial", value: "trial" },
              { label: "Converted", value: "converted" },
              { label: "Lost", value: "lost" },
            ],
          },
          { name: "interest", label: "Interest", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
        ],
        columns: [
          { key: "full_name", label: "Name" },
          { key: "mobile", label: "Mobile" },
          { key: "source", label: "Source" },
          { key: "status", label: "Status" },
        ],
      }}
    />
  ),
});
