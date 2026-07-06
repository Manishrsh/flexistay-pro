import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";

export const Route = createFileRoute("/_authenticated/products")({
  component: () => (
    <ResourcePage
      config={{
        title: "Inventory",
        description: "Protein, supplements, merchandise stock.",
        table: "products",
        searchColumn: "name",
        fields: [
          { name: "name", label: "Product name", type: "text", required: true },
          {
            name: "category",
            label: "Category",
            type: "select",
            options: [
              { label: "Protein", value: "protein" },
              { label: "Supplements", value: "supplements" },
              { label: "Merchandise", value: "merchandise" },
              { label: "Other", value: "other" },
            ],
          },
          { name: "sku", label: "SKU", type: "text" },
          { name: "cost_price", label: "Cost price (₹)", type: "number", step: "0.01" },
          { name: "sell_price", label: "Sell price (₹)", type: "number", step: "0.01" },
          { name: "stock", label: "Stock", type: "number", defaultValue: 0 },
          { name: "reorder_level", label: "Reorder at", type: "number", defaultValue: 0 },
        ],
        columns: [
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "stock", label: "Stock" },
          { key: "sell_price", label: "Price" },
        ],
      }}
    />
  ),
});
