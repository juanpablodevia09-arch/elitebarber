import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, CalendarDays, Users, Wallet, Settings } from "lucide-react";
import { AppShell, type NavItem } from "@/components/AppShell";

const items: NavItem[] = [
  { label: "Inicio", to: "/barbero", icon: Home },
  { label: "Agenda", to: "/barbero/schedule", icon: CalendarDays },
  { label: "Clientes", to: "/barbero/clients", icon: Users },
  { label: "Ganancias", to: "/barbero/earnings", icon: Wallet },
  { label: "Configuración", to: "/barbero/settings", icon: Settings },
];

export const Route = createFileRoute("/barbero")({
  component: () => (
    <AppShell role="barber" items={items}>
      <Outlet />
    </AppShell>
  ),
});