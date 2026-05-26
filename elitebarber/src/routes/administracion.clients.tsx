import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/administracion/clients")({
  component: AdminClients,
});

function AdminClients() {
  const { data: clients = [] } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader title="Clientes" subtitle="Todos los clientes registrados." />
      <div className="rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Correo</th>
              <th className="px-6 py-4">Puntos</th>
              <th className="px-6 py-4">Se unió</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-border/60 last:border-0">
                <td className="px-6 py-4 text-foreground">{c.full_name || "—"}</td>
                <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                <td className="px-6 py-4 text-gold font-medium">{c.loyalty_points}</td>
                <td className="px-6 py-4 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}