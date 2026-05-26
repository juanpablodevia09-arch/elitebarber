import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/barbero/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const { user } = useAuth();
  const { data: clients = [] } = useQuery({
    queryKey: ["barber-clients", user?.id],
    queryFn: async () => {
      const { data: appts } = await supabase.from("appointments").select("client_id").eq("barber_id", user!.id);
      const ids = Array.from(new Set((appts ?? []).map((a) => a.client_id)));
      if (!ids.length) return [];
      const { data } = await supabase.from("profiles").select("id, full_name, email, loyalty_points").in("id", ids);
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <>
      <PageHeader title="Clientes" subtitle="Tus clientes habituales y visitantes recientes." />
      <div className="rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Aún no hay clientes.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4 text-foreground">{c.full_name || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                  <td className="px-6 py-4 text-gold font-medium">{c.loyalty_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}