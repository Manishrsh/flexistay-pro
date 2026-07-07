import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/attendance")({
  component: () => (
    <ResourcePage
      config={{
        title: "Attendance",
        description: "Member check-ins.",
        table: "attendance",
        orderBy: { column: "check_in", ascending: false },
        fields: [
          { name: "member_id", label: "Member", type: "reference", required: true, refTable: "members", refLabel: "full_name" },
          { name: "check_in", label: "Check-in time", type: "text", defaultValue: new Date().toISOString() },
          { name: "check_out", label: "Check-out time", type: "text" },
          {
            name: "method",
            label: "Method",
            type: "select",
            defaultValue: "manual",
            options: [
              { label: "Manual", value: "manual" },
              { label: "QR Code", value: "qr" },
              { label: "Barcode", value: "barcode" },
              { label: "Fingerprint", value: "fingerprint" },
              { label: "Face Recognition", value: "face" },
            ],
          },
        ],
        columns: [
          { key: "member_id", label: "Member" },
          { key: "check_in", label: "Check-in" },
          { key: "check_out", label: "Check-out" },
          { key: "method", label: "Method" },
        ],
      }}
    />
  ),
});
