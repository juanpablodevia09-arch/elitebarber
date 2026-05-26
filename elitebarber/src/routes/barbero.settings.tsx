import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/barbero/settings")({
  component: () => {
    const { user } = useAuth();
    return (
      <>
        <PageHeader title="Configuración" subtitle="Detalles de tu cuenta." />
        <div className="max-w-xl rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <div className="text-sm text-muted-foreground">Sesión iniciada como</div>
          <div className="mt-1 text-foreground font-medium">{user?.email}</div>
          <div className="mt-6 text-xs uppercase tracking-[0.18em] text-gold">Cuenta de barbero</div>
        </div>
      </>
    );
  },
});