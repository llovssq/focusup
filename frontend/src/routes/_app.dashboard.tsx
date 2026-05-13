import { createFileRoute } from "@tanstack/react-router";
import { Target, Timer, TrendingUp } from "lucide-react";
import { FireIcon } from "@/components/FireIcon";
import { FocusTimer } from "@/components/FocusTimer";
import { StatCard } from "@/components/StatCard";
import { TaskList } from "@/components/TaskList";
import { useFocusStore } from "@/hooks/use-focus-store";
import { useState, useEffect } from "react";
import { StreakModal } from "@/components/StreakModal";
import { useLanguage } from "@/components/language-provider";
import { TasksCompletedModal, FocusHoursModal, ConcentrationModal } from "@/components/DashboardModals";
import { UsersCard } from "@/components/UsersCard";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { streak, sessions, goals, user } = useFocusStore();
  const [activeModal, setActiveModal] = useState<"streak" | "tasks" | "hours" | "concentration" | null>(null);
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const completedCount = goals.filter(g => g.completed).length;
  const totalFocusHours = (sessions.reduce((acc, s) => acc + s.duration / 60, 0) / 60).toFixed(1);

  if (!mounted) return null;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("greeting")}, <span className="text-gradient">{user.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t("today_tasks", { count: 5 })}
          </p>
        </div>
        {!streak.completedDays.includes(new Date().toISOString().split('T')[0]) && (
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/50 dark:border-orange-900/20">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
              {t("nudge_complete")}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          title={t("tasks_completed")} 
          value={completedCount.toString()} 
          change={t("plus_today", { count: 6 })} 
          icon={Target} 
          accent="primary" 
          onClick={() => setActiveModal("tasks")}
        />
        <StatCard 
          title={t("focus_hours")} 
          value={`${totalFocusHours}ч`} 
          change={t("vs_avg", { count: 18 })} 
          icon={Timer} 
          accent="accent" 
          onClick={() => setActiveModal("hours")}
        />
        <StatCard 
          title={t("concentration_level")} 
          value="87%" 
          change={t("excellent_result")} 
          icon={TrendingUp} 
          accent="success" 
          onClick={() => setActiveModal("concentration")}
        />
        <StatCard 
          title={t("streak_days_count")} 
          value={`${streak.count} 🔥`} 
          change={t("streak_keep")} 
          icon={FireIcon} 
          accent="warning" 
          onClick={() => setActiveModal("streak")}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-1">
          <FocusTimer />
        </div>
        <div className="lg:col-span-2">
          <TaskList />
        </div>
        <div className="lg:col-span-1">
          <UsersCard />
        </div>
      </div>

      {/* Modals */}
      <StreakModal open={activeModal === "streak"} onOpenChange={(open) => setActiveModal(open ? "streak" : null)} />
      <TasksCompletedModal open={activeModal === "tasks"} onOpenChange={(open) => setActiveModal(open ? "tasks" : null)} />
      <FocusHoursModal open={activeModal === "hours"} onOpenChange={(open) => setActiveModal(open ? "hours" : null)} />
      <ConcentrationModal open={activeModal === "concentration"} onOpenChange={(open) => setActiveModal(open ? "concentration" : null)} />
    </div>
  );
}
