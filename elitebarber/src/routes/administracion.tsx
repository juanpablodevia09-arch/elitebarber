import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Scissors, Users, Calendar, Wallet, Package, BarChart3, Settings } from "lucide-react";
import { AppShell, type NavItem } from "@/components/AppShell";

const items: NavItem[] = [
  { label: "Panel", to: "/administracion", icon: LayoutDashboard },
  { label: "Barberos", to: "/administracion/barbers", icon: Scissors },
  { label: "Clientes", to: "/administracion/clients", icon: Users },
  { label: "Citas", to: "/administracion/appointments", icon: Calendar },
  { label: "Ganancias", to: "/administracion/earnings", icon: Wallet },
  { label: "Inventario", to: "/administracion/inventory", icon: Package },
  { label: "Estadísticas", to: "/administracion/statistics", icon: BarChart3 },
  { label: "Configuración", to: "/administracion/settings", icon: Settings },
];

export const Route = createFileRoute("/administracion")({
  component: () => (
    <AppShell role="admin" items={items}>
      <Outlet />
    </AppShell>
  ),
});