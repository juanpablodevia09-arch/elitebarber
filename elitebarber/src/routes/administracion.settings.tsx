import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Bell, Calendar, X, Clock } from "lucide-react";

export const Route = createFileRoute("/administracion/settings")({
  component: () => (
    <>
      <PageHeader title="Configuración" subtitle="Preferencias del estudio y notificaciones." />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-gold" /> Notificaciones
        </h3>
        <ul className="divide-y divide-border">
          {[
            { icon: Calendar, t: "Nueva cita", d: "Recibe aviso cuando un cliente reserva" },
            { icon: X, t: "Cancelación de cita", d: "Mantente informado de las cancelaciones" },
            { icon: Clock, t: "Recordatorio de cita", d: "Recordatorio 1 hora antes de cada visita" },
          ].map((n) => {
            const I = n.icon;
            return (
              <li key={n.t} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <I className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{n.t}</div>
                    <div className="text-xs text-muted-foreground">{n.d}</div>
                  </div>
                </div>
                <span className="inline-block w-10 h-5 bg-gold rounded-full relative">
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary-foreground" />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  ),
});