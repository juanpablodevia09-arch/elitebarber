import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/barbero/schedule")({
  component: SchedulePage,
});

const HOURS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [blocked, setBlocked] = useState<string[]>([]);

  const { data: appts = [] } = useQuery({
    queryKey: ["barber-day", user?.id, date],
    queryFn: async () => {
      const start = new Date(`${date}T00:00:00`).toISOString();
      const end = new Date(`${date}T23:59:59`).toISOString();
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("barber_id", user!.id)
        .gte("scheduled_at", start)
        .lte("scheduled_at", end);
      return data ?? [];
    },
    enabled: !!user,
  });

  const busyHours = new Set(appts.map((a) => new Date(a.scheduled_at).toTimeString().slice(0, 5)));

  const toggleBlock = (h: string) =>
    setBlocked((b) => (b.includes(h) ? b.filter((x) => x !== h) : [...b, h]));

  return (
    <>
      <PageHeader title="Agenda" subtitle="Visualiza tu día. Bloquea horas cuando no estés disponible." />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
          />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gold" /> Ocupado</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary border border-border" /> Disponible</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Bloqueado</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {HOURS.map((h) => {
            const busy = busyHours.has(h);
            const isBlocked = blocked.includes(h);
            return (
              <button
                key={h}
                onClick={() => !busy && toggleBlock(h)}
                disabled={busy}
                className={`py-4 rounded-xl text-sm font-medium transition-all ${
                  busy
                    ? "gradient-gold text-primary-foreground shadow-gold cursor-default"
                    : isBlocked
                      ? "bg-destructive/20 text-destructive border border-destructive/40"
                      : "bg-secondary text-foreground hover:bg-secondary/70 border border-border"
                }`}
              >
                {h}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}