import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "@/components/AppShell";
import { Award, Gift, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/cliente/loyalty")({
  component: LoyaltyPage,
});

function LoyaltyPage() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const points = profile?.loyalty_points ?? 0;
  const rewards = Math.floor(points / 10);
  const toNext = 10 - (points % 10);
  const progress = ((points % 10) / 10) * 100;

  return (
    <>
      <PageHeader title="Puntos de fidelidad" subtitle="Un punto por servicio. Cada 10 desbloquean una visita de cortesía." />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard icon={Award} label="Puntos totales" value={points} accent />
        <StatCard icon={Gift} label="Servicios gratis ganados" value={rewards} />
        <StatCard icon={Sparkles} label="Próxima recompensa en" value={`${toNext} pts`} />
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-lg font-semibold">Progreso al próximo servicio gratis</h3>
          <span className="text-sm text-muted-foreground">{points % 10} / 10</span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div className="h-full gradient-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </>
  );
}