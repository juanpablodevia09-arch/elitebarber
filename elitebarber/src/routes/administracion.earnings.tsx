import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Scissors, Building2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/administracion/earnings")({
  component: () => {
    const { data: appts = [] } = useQuery({
      queryKey: ["admin-earn"],
      queryFn: async () => {
        const { data } = await supabase.from("appointments").select("total_price, status").neq("status", "cancelled");
        return data ?? [];
      },
    });
    const total = appts.reduce((s, a) => s + Number(a.total_price), 0);
    return (
      <>
        <PageHeader title="Ganancias" subtitle="Ingresos brutos y desglose del reparto." />
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard icon={DollarSign} label="Ingresos brutos" value={`$${total.toFixed(0)}`} accent />
          <StatCard icon={Building2} label="Parte de la barbería (50%)" value={`$${(total * 0.5).toFixed(0)}`} />
          <StatCard icon={Scissors} label="Pagos a barberos (50%)" value={`$${(total * 0.5).toFixed(0)}`} />
        </div>
      </>
    );
  },
});