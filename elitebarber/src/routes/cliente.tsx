import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Home, Calendar, History, Award, Settings } from "lucide-react";
import { AppShell, type NavItem } from "@/components/AppShell";

const items: NavItem[] = [
  { label: "Inicio", to: "/cliente", icon: Home },
  { label: "Reservar cita", to: "/cliente/book", icon: Calendar },
  { label: "Historial", to: "/cliente/history", icon: History },
  { label: "Puntos de fidelidad", to: "/cliente/loyalty", icon: Award },
  { label: "Configuración", to: "/cliente/settings", icon: Settings },
];

export const Route = createFileRoute("/cliente")({
  component: () => (
    <AppShell role="client" items={items}>
      <Outlet />
    </AppShell>
  ),
});