import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Check, Calendar, Clock, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cliente/book")({
  component: BookPage,
});

const HOURS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function BookPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [barberId, setBarberId] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hour, setHour] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").eq("active", true).order("price");
      return data ?? [];
    },
  });

  const { data: barbers = [] } = useQuery({
    queryKey: ["barbers"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "barber");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (!ids.length) return [];
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      return data ?? [];
    },
  });

  const { data: taken = [] } = useQuery({
    queryKey: ["taken", barberId, date],
    enabled: !!barberId && !!date,
    queryFn: async () => {
      const start = new Date(`${date}T00:00:00`).toISOString();
      const end = new Date(`${date}T23:59:59`).toISOString();
      const { data } = await supabase
        .from("appointments")
        .select("scheduled_at")
        .eq("barber_id", barberId!)
        .eq("status", "scheduled")
        .gte("scheduled_at", start)
        .lte("scheduled_at", end);
      return (data ?? []).map((a) => new Date(a.scheduled_at).toTimeString().slice(0, 5));
    },
  });

  const total = useMemo(
    () => services.filter((s) => picked.includes(s.id)).reduce((sum, s) => sum + Number(s.price), 0),
    [services, picked],
  );

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    if (!barberId || !hour || picked.length === 0) {
      toast.error("Selecciona barbero, hora y al menos un servicio");
      return;
    }
    setBusy(true);
    try {
      const scheduled_at = new Date(`${date}T${hour}:00`).toISOString();
      const { error } = await supabase.from("appointments").insert({
        client_id: user!.id,
        barber_id: barberId,
        scheduled_at,
        service_ids: picked,
        total_price: total,
      });
      if (error) throw error;
      toast.success("Cita reservada. El pago se realiza en el local.");
      setPicked([]);
      setHour(null);
      qc.invalidateQueries({ queryKey: ["taken"] });
      qc.invalidateQueries({ queryKey: ["next-appt"] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo reservar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Reserva tu cita" subtitle="Elige tu barbero, horario y servicios. El pago es en efectivo en el local." />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gold" /> Barbero
          </h3>
          {barbers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay barberos disponibles. Vuelve pronto.</p>
          ) : (
            <div className="space-y-2">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBarberId(b.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    barberId === b.id ? "border-primary bg-secondary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="font-medium text-foreground">{b.full_name || "Barbero"}</div>
                  <div className="text-xs text-muted-foreground">Estilista Maestro</div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold" /> Fecha
          </h3>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm"
          />

          <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mt-6 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" /> Hora
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {HOURS.map((h) => {
              const isTaken = taken.includes(h);
              const isPicked = hour === h;
              return (
                <button
                  key={h}
                  disabled={isTaken || !barberId}
                  onClick={() => setHour(h)}
                  className={`py-2 rounded-md text-sm transition-all ${
                    isTaken
                      ? "bg-secondary/40 text-muted-foreground/40 line-through cursor-not-allowed"
                      : isPicked
                        ? "gradient-gold text-primary-foreground shadow-gold"
                        : "bg-secondary text-foreground hover:bg-secondary/70"
                  }`}
                >
                  {h}
                </button>
              );
            })}
          </div>
          {!barberId && <p className="mt-3 text-xs text-muted-foreground">Selecciona un barbero para ver disponibilidad.</p>}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-elegant flex flex-col">
          <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">Servicios</h3>
          <div className="space-y-2 flex-1">
            {services.map((s) => {
              const on = picked.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => togglePick(s.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                    on ? "border-primary bg-secondary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        on ? "gradient-gold border-primary" : "border-border"
                      }`}
                    >
                      {on && <Check className="w-3 h-3 text-primary-foreground" />}
                    </span>
                    <span className="text-sm font-medium">{s.name}</span>
                  </span>
                  <span className="text-gold font-medium text-sm">${Number(s.price).toFixed(0)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex justify-between text-sm mb-4">
              <span className="text-muted-foreground">Total (efectivo en el local)</span>
              <span className="text-foreground font-semibold text-lg">${total.toFixed(0)}</span>
            </div>
            <Button onClick={submit} disabled={busy} className="w-full gradient-gold text-primary-foreground border-0 shadow-gold">
              {busy ? "Reservando…" : "Confirmar cita"}
            </Button>
            <p className="mt-3 text-[11px] text-center text-muted-foreground">Las citas duran 1 hora. Cancela hasta 1 hora antes.</p>
          </div>
        </section>
      </div>
    </>
  );
}