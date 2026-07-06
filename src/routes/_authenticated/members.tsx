import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/members")({
  component: () => (
    <ResourcePage
      config={{
        title: "Members",
        description: "All gym members.",
        table: "members",
        searchColumn: "full_name",
        fields: [
          { name: "full_name", label: "Full name", type: "text", required: true },
          { name: "member_code", label: "Member ID", type: "text" },
          { name: "mobile", label: "Mobile", type: "text" },
          { name: "email", label: "Email", type: "text" },
          { name: "dob", label: "Date of birth", type: "date" },
          {
            name: "gender",
            label: "Gender",
            type: "select",
            options: [
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ],
          },
          { name: "height_cm", label: "Height (cm)", type: "number" },
          { name: "weight_kg", label: "Weight (kg)", type: "number", step: "0.1" },
          { name: "blood_group", label: "Blood group", type: "text" },
          { name: "emergency_contact_name", label: "Emergency contact name", type: "text" },
          { name: "emergency_contact_phone", label: "Emergency contact phone", type: "text" },
          { name: "joined_on", label: "Joined on", type: "date" },
          {
            name: "status",
            label: "Status",
            type: "select",
            defaultValue: "active",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Frozen", value: "frozen" },
            ],
          },
          { name: "address", label: "Address", type: "textarea" },
          { name: "medical_conditions", label: "Medical conditions", type: "textarea" },
        ],
        columns: [
          { key: "full_name", label: "Name" },
          { key: "mobile", label: "Mobile" },
          { key: "email", label: "Email" },
          { key: "status", label: "Status" },
          { key: "joined_on", label: "Joined" },
        ],
      }}
    />
  ),
});
