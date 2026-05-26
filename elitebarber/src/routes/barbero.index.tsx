import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, DollarSign, UserCheck } from "lucide-react";
import { PageHeader, StatCard } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/barbero/")({
  component: BarberHome,
});

function BarberHome() {
  const { user } = useAuth();
  const { data: today = [] } = useQuery({
    queryKey: ["barber-today", user?.id],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("barber_id", user!.id)
        .gte("scheduled_at", start.toISOString())
        .lte("scheduled_at", end.toISOString())
        .order("scheduled_at");
      return data ?? [];
    },
    enabled: !!user,
  });

  const earnings = today.filter((a) => a.status !== "cancelled").reduce((s, a) => s + Number(a.total_price) * 0.5, 0);
  const next = today.find((a) => a.status === "scheduled" && new Date(a.scheduled_at) >= new Date());

  return (
    <>
      <PageHeader title="Hoy" subtitle="Tu día a simple vista." />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard icon={Calendar} label="Citas de hoy" value={today.length} accent />
        <StatCard icon={DollarSign} label="Ganancias de hoy" value={`$${earnings.toFixed(0)}`} hint="50% de las reservas" />
        <StatCard
          icon={UserCheck}
          label="Próximo cliente"
          value={next ? new Date(next.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
          hint={next ? "Confirmado" : "Sin citas programadas"}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold">Agenda de hoy</h3>
        </div>
        {today.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Sin citas hoy.</div>
        ) : (
          <ul className="divide-y divide-border">
            {today.map((a) => (
              <li key={a.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    {new Date(a.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-xs text-muted-foreground">Cita con cliente · 1 hora</div>
                </div>
                <div className="text-gold font-medium">${Number(a.total_price).toFixed(0)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}