import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/cliente/history")({
  component: HistoryPage,
});

const statusStyle: Record<string, string> = {
  scheduled: "bg-primary/15 text-gold border-primary/30",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  no_show: "bg-destructive/10 text-destructive border-destructive/30",
};

function HistoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: appts = [] } = useQuery({
    queryKey: ["my-appts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", user!.id)
        .order("scheduled_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const cancel = async (id: string, at: string) => {
    const diff = (new Date(at).getTime() - Date.now()) / 36e5;
    if (diff < 1) {
      toast.error("Las cancelaciones requieren al menos 1 hora de anticipación");
      return;
    }
    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Cita cancelada");
      qc.invalidateQueries({ queryKey: ["my-appts"] });
    }
  };

  return (
    <>
      <PageHeader title="Historial" subtitle="Todas tus visitas, en orden." />
      <div className="rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        {appts.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Aún no hay citas.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Hora</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => {
                const d = new Date(a.scheduled_at);
                return (
                  <tr key={a.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-4 text-foreground">{d.toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-6 py-4 text-gold font-medium">${Number(a.total_price).toFixed(0)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium border ${statusStyle[a.status]}`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {a.status === "scheduled" && (
                        <Button size="sm" variant="ghost" onClick={() => cancel(a.id, a.scheduled_at)}>
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}