import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/administracion/statistics")({
  component: StatsPage,
});

const GOLD = "oklch(0.78 0.13 82)";

function StatsPage() {
  const monthly = [
    { m: "Ene", v: 4200 }, { m: "Feb", v: 5100 }, { m: "Mar", v: 4800 },
    { m: "Abr", v: 6200 }, { m: "May", v: 7400 }, { m: "Jun", v: 8100 },
  ];
  const hourly = [
    { h: "9", v: 4 }, { h: "10", v: 6 }, { h: "11", v: 8 }, { h: "12", v: 5 },
    { h: "13", v: 3 }, { h: "14", v: 7 }, { h: "15", v: 9 }, { h: "16", v: 11 },
    { h: "17", v: 10 }, { h: "18", v: 8 }, { h: "19", v: 5 },
  ];

  return (
    <>
      <PageHeader title="Estadísticas" subtitle="Tendencias de tu estudio." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">Ingresos, últimos 6 meses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" stroke="oklch(0.68 0.015 80)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.68 0.015 80)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.006 60)", border: "1px solid oklch(0.28 0.008 60)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="v" stroke={GOLD} strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">Reservas por hora</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hourly}>
              <XAxis dataKey="h" stroke="oklch(0.68 0.015 80)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.68 0.015 80)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.006 60)", border: "1px solid oklch(0.28 0.008 60)", borderRadius: 12 }} />
              <Bar dataKey="v" fill={GOLD} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}