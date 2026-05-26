import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "@/components/AppShell";
import { DollarSign, TrendingUp, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/barbero/earnings")({
  component: EarningsPage,
});

function EarningsPage() {
  const { user } = useAuth();
  const { data: appts = [] } = useQuery({
    queryKey: ["barber-earnings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("barber_id", user!.id)
        .neq("status", "cancelled")
        .order("scheduled_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const total = appts.reduce((s, a) => s + Number(a.total_price), 0);
  const yours = total * 0.5;
  const shop = total * 0.5;

  return (
    <>
      <PageHeader title="Ganancias" subtitle="50% para ti, 50% para la barbería." />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard icon={DollarSign} label="Tus ganancias" value={`$${yours.toFixed(0)}`} accent />
        <StatCard icon={Receipt} label="Parte de la barbería" value={`$${shop.toFixed(0)}`} />
        <StatCard icon={TrendingUp} label="Ingresos brutos" value={`$${total.toFixed(0)}`} />
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-semibold">Servicios recientes</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Tu parte</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {appts.slice(0, 20).map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0">
                <td className="px-6 py-3 text-foreground">{new Date(a.scheduled_at).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-muted-foreground">${Number(a.total_price).toFixed(0)}</td>
                <td className="px-6 py-3 text-gold font-medium">${(Number(a.total_price) * 0.5).toFixed(0)}</td>
                <td className="px-6 py-3 text-xs uppercase tracking-wide text-muted-foreground">{a.status.replace("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}