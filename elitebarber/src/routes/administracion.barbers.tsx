import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/administracion/barbers")({
  component: BarbersPage,
});

function BarbersPage() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: barbers = [] } = useQuery({
    queryKey: ["admin-barbers"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "barber");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (!ids.length) return [];
      const { data } = await supabase.from("profiles").select("*").in("id", ids);
      return data ?? [];
    },
  });

  const promote = async () => {
    setBusy(true);
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!profile) {
      toast.error("No existe usuario con ese correo. Debe registrarse primero.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: profile.id, role: "barber" });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Barbero agregado");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin-barbers"] });
    }
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("profiles").update({ active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-barbers"] });
  };

  return (
    <>
      <PageHeader title="Barberos" subtitle="Agrega y gestiona tu equipo." />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant mb-6">
        <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">Agregar un barbero</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[240px] space-y-2">
            <Label>Correo de un usuario existente</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="barbero@ejemplo.com" />
          </div>
          <Button onClick={promote} disabled={busy || !email} className="gradient-gold text-primary-foreground border-0 shadow-gold">
            {busy ? "Agregando…" : "Promover a barbero"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">El usuario debe registrar una cuenta de cliente primero; luego lo promueves aquí.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        {barbers.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Aún no hay barberos.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {barbers.map((b) => (
                <tr key={b.id} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4 text-foreground">{b.full_name || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{b.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] border ${b.active ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-border text-muted-foreground bg-muted"}`}>
                      {b.active ? "Activo" : "Deshabilitado"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toggle(b.id, b.active)}>
                      {b.active ? "Deshabilitar" : "Habilitar"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}