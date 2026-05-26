import { type ReactNode, useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth, primaryRole, homePathFor, type Role } from "@/hooks/use-auth";
import { Scissors, LogOut, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface Props {
  role: Role;
  items: NavItem[];
  children: ReactNode;
}

export function AppShell({ role, items, children }: Props) {
  const { user, roles, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const actual = primaryRole(roles);
    if (actual !== role) navigate({ to: homePathFor(actual) });
  }, [loading, user, roles, role, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="px-6 py-6 border-b border-border flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center shadow-gold">
            <Scissors className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold tracking-tight text-foreground">EliteBarber</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold">{role}</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-gold" : ""}`} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-gold flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">EliteBarber</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-gold">{role}</span>
        </div>
        <nav className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 border-b border-border bg-sidebar/60 scrollbar-none">
          {items.map((it) => {
            const active = pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
                  active ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 border border-border bg-card shadow-elegant overflow-hidden transition-transform hover:-translate-y-0.5 ${
        accent ? "ring-1 ring-primary/30" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold" />
          </div>
        )}
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}