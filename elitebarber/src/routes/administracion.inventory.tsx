import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/administracion/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const { data: items = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data } = await supabase.from("inventory").select("*").order("name");
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader title="Inventario" subtitle="Controla el stock de productos." />
      <div className="rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Cant.</th>
              <th className="px-6 py-4">Precio unitario</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const low = it.quantity <= it.low_stock_threshold;
              return (
                <tr key={it.id} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4 text-foreground">{it.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{it.sku}</td>
                  <td className="px-6 py-4 text-foreground">{it.quantity}</td>
                  <td className="px-6 py-4 text-gold font-medium">${Number(it.unit_price).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] border ${low ? "border-destructive/30 text-destructive bg-destructive/10" : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"}`}>
                      {low ? "Stock bajo" : "En stock"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}