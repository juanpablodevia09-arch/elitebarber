import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/cliente/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
      });
  }, [user]);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ full_name: name, phone }).eq("id", user!.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil actualizado");
  };

  return (
    <>
      <PageHeader title="Configuración" subtitle="Administra los datos de tu perfil." />
      <div className="max-w-xl rounded-2xl border border-border bg-card p-8 shadow-elegant space-y-5">
        <div className="space-y-2">
          <Label>Correo electrónico</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opcional" />
        </div>
        <Button onClick={save} disabled={busy} className="gradient-gold text-primary-foreground border-0 shadow-gold">
          {busy ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </>
  );
}