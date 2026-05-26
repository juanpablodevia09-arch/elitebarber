import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Calendar, Users, Crown } from "lucide-react";
import { PageHeader, StatCard } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export const Route = createFileRoute("/administracion/")({
  component: AdminHome,
});

const GOLD = "oklch(0.78 0.13 82)";
const GOLD_SOFT = "oklch(0.88 0.08 88)";
const DARK = "oklch(0.42 0.05 65)";

function AdminHome() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ data: appts }, { count: clients }] = await Promise.all([
        supabase.from("appointments").select("*"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      const total = (appts ?? []).filter((a) => a.status !== "cancelled").reduce((s, a) => s + Number(a.total_price), 0);
      const today = (appts ?? []).filter((a) => new Date(a.scheduled_at).toDateString() === new Date().toDateString()).length;
      const counts: Record<string, number> = {};
      (appts ?? []).forEach((a) => (counts[a.barber_id] = (counts[a.barber_id] ?? 0) + 1));
      const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      return { total, today, clients: clients ?? 0, topId };
    },
  });

  const weekly = [
    { d: "Lun", v: 480 },
    { d: "Mar", v: 620 },
    { d: "Mié", v: 540 },
    { d: "Jue", v: 780 },
    { d: "Vie", v: 950 },
    { d: "Sáb", v: 1240 },
    { d: "Dom", v: 320 },
  ];
  const services = [
    { name: "Corte", value: 45 },
    { name: "Barba", value: 25 },
    { name: "Premium", value: 20 },
    { name: "Cejas", value: 10 },
  ];
  const appts = [
    { d: "S1", v: 32 },
    { d: "S2", v: 41 },
    { d: "S3", v: 38 },
    { d: "S4", v: 52 },
  ];

  return (
    <>
      <PageHeader title="Panel" subtitle="Resumen del desempeño de tu estudio." />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Ganancias totales" value={`$${(stats?.total ?? 0).toFixed(0)}`} accent />
        <StatCard icon={Calendar} label="Citas de hoy" value={stats?.today ?? 0} />
        <StatCard icon={Users} label="Clientes registrados" value={stats?.clients ?? 0} />
        <StatCard icon={Crown} label="Barbero destacado" value={stats?.topId ? "Activo" : "—"} hint="Más reservado" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Ganancias semanales">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekly}>
              <XAxis dataKey="d" stroke="oklch(0.68 0.015 80)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.68 0.015 80)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.006 60)", border: "1px solid oklch(0.28 0.008 60)", borderRadius: 12 }} />
              <Bar dataKey="v" fill={GOLD} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Servicios populares">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={services} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                {services.map((_, i) => (
                  <Cell key={i} fill={[GOLD, GOLD_SOFT, DARK, "oklch(0.55 0.08 70)"][i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.18 0.006 60)", border: "1px solid oklch(0.28 0.008 60)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Resumen de citas">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={appts}>
              <XAxis dataKey="d" stroke="oklch(0.68 0.015 80)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.68 0.015 80)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.006 60)", border: "1px solid oklch(0.28 0.008 60)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="v" stroke={GOLD} strokeWidth={2.5} dot={{ r: 4, fill: GOLD }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
      <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}