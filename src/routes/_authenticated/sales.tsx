import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/sales")({
  component: () => (
    <ResourcePage
      config={{
        title: "Product Sales",
        table: "product_sales",
        fields: [
          { name: "product_id", label: "Product", type: "reference", required: true, refTable: "products", refLabel: "name" },
          { name: "member_id", label: "Member (optional)", type: "reference", refTable: "members", refLabel: "full_name" },
          { name: "quantity", label: "Quantity", type: "number", defaultValue: 1 },
          { name: "unit_price", label: "Unit price (₹)", type: "number", step: "0.01" },
          { name: "total", label: "Total (₹)", type: "number", step: "0.01" },
          { name: "sold_on", label: "Sold on", type: "date" },
        ],
        columns: [
          { key: "product_id", label: "Product" },
          { key: "quantity", label: "Qty" },
          { key: "unit_price", label: "Unit ₹" },
          { key: "total", label: "Total ₹" },
          { key: "sold_on", label: "Date" },
        ],
      }}
    />
  ),
});
