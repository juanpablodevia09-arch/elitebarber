import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/administracion/appointments")({
  component: AdminAppointments,
});

function AdminAppointments() {
  const [status, setStatus] = useState<string>("all");

  const { data: appts = [] } = useQuery({
    queryKey: ["admin-appts"],
    queryFn: async () => {
      const { data } = await supabase.from("appointments").select("*").order("scheduled_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = status === "all" ? appts : appts.filter((a) => a.status === status);

  return (
    <>
      <PageHeader title="Citas" subtitle="Todas las reservas del estudio." />
      <div className="flex gap-2 mb-5">
        {[
          ["all", "Todas"],
          ["scheduled", "Programadas"],
          ["completed", "Completadas"],
          ["cancelled", "Canceladas"],
          ["no_show", "No asistió"],
        ].map(([s, label]) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wide border transition-colors ${
              status === s ? "border-primary text-gold bg-secondary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
              <th className="px-6 py-4">Cuándo</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Barbero</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0">
                <td className="px-6 py-3 text-foreground">{new Date(a.scheduled_at).toLocaleString()}</td>
                <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{a.client_id.slice(0, 8)}</td>
                <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{a.barber_id.slice(0, 8)}</td>
                <td className="px-6 py-3 text-gold font-medium">${Number(a.total_price).toFixed(0)}</td>
                <td className="px-6 py-3 text-xs uppercase tracking-wide text-muted-foreground">{a.status.replace("_", " ")}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-muted-foreground">Sin citas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}