import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { ProductivityChart } from "@/components/ProductivityChart";
import { DistractionsCard } from "@/components/DistractionsCard";
import { Target, Timer, TrendingUp, Flame } from "lucide-react";
import { useFocusStore } from "@/hooks/use-focus-store";
import { useMemo } from "react";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/_app/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { goals, sessions } = useFocusStore();
  const { t, language } = useLanguage();

  const stats = useMemo(() => {
    const totalTasks = goals.reduce((acc, g) => acc + g.subtasks.length, 0);
    const completedTasks = goals.reduce((acc, g) => acc + g.subtasks.filter(s => s.done).length, 0);
    const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
    const focusHours = Math.floor(totalFocusSeconds / 3600);
    const focusMinutes = Math.floor((totalFocusSeconds % 3600) / 60);
    const avgProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;

    const hourlyData = Array.from({ length: 11 }, (_, i) => ({
      h: `${i + 8}:00`,
      focus: Math.floor(Math.random() * 40) + 40,
    }));

    const categories = [
      { name: language === "ru" ? "Учёба" : "Study", value: 45, color: "oklch(0.68 0.21 295)" },
      { name: language === "ru" ? "Работа" : "Work", value: 30, color: "oklch(0.72 0.18 200)" },
      { name: language === "ru" ? "Личное" : "Personal", value: 15, color: "oklch(0.72 0.18 155)" },
      { name: language === "ru" ? "Спорт" : "Sport", value: 10, color: "oklch(0.8 0.17 75)" },
    ];

    return {
      totalTasks,
      completedTasks,
      focusHours: `${focusHours}${t("hour")} ${focusMinutes}${t("min")}`,
      avgProgress: `${avgProgress}%`,
      hourlyData,
      categories
    };
  }, [goals, sessions, language]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("stats_title")}</h1>
        <p className="text-muted-foreground mt-1">{t("stats_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={language === "ru" ? "Всего задач" : "Total Tasks"} value={stats.totalTasks.toString()} change={language === "ru" ? `${stats.completedTasks} выполнено` : `${stats.completedTasks} completed`} icon={Target} accent="primary" />
        <StatCard title={language === "ru" ? "Часов в фокусе" : "Focus Hours"} value={stats.focusHours} change={language === "ru" ? "На этой неделе" : "This week"} icon={Timer} accent="accent" />
        <StatCard title={language === "ru" ? "Средний прогресс" : "Avg Progress"} value={stats.avgProgress} change={language === "ru" ? "+2% сегодня" : "+2% today"} icon={TrendingUp} accent="success" />
        <StatCard title={language === "ru" ? "Макс. серия" : "Best Streak"} value={language === "ru" ? "3 дня" : "3 days"} change={language === "ru" ? "Растем!" : "Growing!"} icon={Flame} accent="warning" />
      </div>

      <ProductivityChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-card border-border/60 shadow-card">
          <div className="mb-4">
            <h3 className="font-semibold">{language === "ru" ? "Концентрация по часам" : "Focus by Hour"}</h3>
            <p className="text-xs text-muted-foreground">{language === "ru" ? "Средний уровень фокуса" : "Average focus level"}</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 265)" vertical={false} />
              <XAxis dataKey="h" stroke="oklch(0.68 0.02 260)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.68 0.02 260)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.19 0.028 265)",
                  border: "1px solid oklch(0.28 0.03 265)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="focus" fill="oklch(0.68 0.21 295)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-card border-border/60 shadow-card">
          <div className="mb-4">
            <h3 className="font-semibold">{language === "ru" ? "Распределение" : "Distribution"}</h3>
            <p className="text-xs text-muted-foreground">{language === "ru" ? "Категории времени" : "Time categories"}</p>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={stats.categories} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {stats.categories.map((c, i) => (
                    <Cell key={i} fill={c.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.19 0.028 265)",
                    border: "1px solid oklch(0.28 0.03 265)",
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {stats.categories.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-sm" style={{ background: c.color }} />
                  <span className="flex-1">{c.name}</span>
                  <span className="font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <DistractionsCard />
    </div>
  );
}
