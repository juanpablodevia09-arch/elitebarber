import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Award, Clock, ArrowRight } from "lucide-react";
import { PageHeader, StatCard } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cliente/")({
  component: ClientHome,
});

function ClientHome() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: next } = useQuery({
    queryKey: ["next-appt", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", user!.id)
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const points = profile?.loyalty_points ?? 0;
  const progress = Math.min(100, (points % 10) * 10);
  const toFree = 10 - (points % 10);

  return (
    <>
      <PageHeader
        title={`Bienvenido${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        subtitle="Tu experiencia de cuidado refinada comienza aquí."
        action={
          <Link to="/cliente/book">
            <Button className="gradient-gold text-primary-foreground border-0 shadow-gold">
              Reservar cita <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          icon={Calendar}
          label="Próxima cita"
          value={next ? new Date(next.scheduled_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
          hint={next ? new Date(next.scheduled_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "Sin visitas próximas"}
          accent
        />
        <StatCard icon={Award} label="Puntos de fidelidad" value={points} hint={`${toFree} más para un servicio gratis`} />
        <StatCard icon={Clock} label="Estado" value={next ? "Confirmada" : "—"} hint={next ? "Nos vemos pronto" : "Reserva tu próxima visita"} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Progreso de fidelidad</h3>
            <span className="text-xs text-muted-foreground">{points % 10} / 10</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full gradient-gold transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Gana un punto por servicio. Cada 10 servicios desbloquean un corte de cortesía.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="text-lg font-semibold mb-4">Servicios del estudio</h3>
          <ul className="space-y-3 text-sm">
            {[
              ["Corte de cabello", "$30"],
              ["Barba", "$20"],
              ["Cejas", "$10"],
              ["Premium (Corte + lavado)", "$45"],
            ].map(([n, p]) => (
              <li key={n} className="flex justify-between border-b border-border/60 pb-2 last:border-0">
                <span className="text-foreground">{n}</span>
                <span className="text-gold font-medium">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}