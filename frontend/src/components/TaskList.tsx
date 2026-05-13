import { useState } from "react";
import { useFocusStore } from "@/hooks/use-focus-store";
import { Check, Sparkles, Clock, Edit2, Trash2, X, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

export function TaskList() {
  const { goals, updateGoal, completeDay } = useFocusStore();
  const { t, language } = useLanguage();
  
  const parseDurationToMinutes = (duration: string): number => {
    if (!duration) return 0;
    const parts = duration.split(" ");
    const value = parseFloat(parts[0]) || 0;
    const unit = parts[1] || (language === "ru" ? "мин" : "min");
    if (unit === "ч" || unit === "h") return Math.round(value * 60);
    return Math.round(value);
  };

  const formatMinutes = (totalMinutes: number): string => {
    if (totalMinutes < 60) return `${totalMinutes} ${t("min")}`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}${t("hour")} ${minutes}${t("min")}` : `${hours}${t("hour")}`;
  };

  // Get all subtasks from all goals
  const todayTasks = goals.flatMap(goal => 
    goal.subtasks.map(sub => ({
      ...sub,
      goalId: goal.id,
      goalTitle: goal.title
    }))
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDurationValue, setEditDurationValue] = useState("");
  const [editDurationUnit, setEditDurationUnit] = useState(t("min"));

  const toggle = (goalId: string, subId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const subs = goal.subtasks.map(s => {
      if (s.id === subId) {
        const isNowDone = !s.done;
        if (isNowDone) completeDay();
        return { ...s, done: isNowDone };
      }
      return s;
    });

    const progress = Math.round((subs.filter(s => s.done).length / subs.length) * 100);
    updateGoal({ ...goal, subtasks: subs, progress });
  };

  const deleteTask = (goalId: string, subId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const subs = goal.subtasks.filter(s => s.id !== subId);
    const progress = subs.length > 0 ? Math.round((subs.filter(s => s.done).length / subs.length) * 100) : 0;
    updateGoal({ ...goal, subtasks: subs, progress });
  };

  const startEditing = (task: any) => {
    setEditingId(task.id);
    setEditValue(task.title);
    const parts = task.duration.split(" ");
    setEditDurationValue(parts[0] || "");
    setEditDurationUnit(parts[1] || t("min"));
  };

  const saveEdit = (goalId: string, subId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const finalDuration = `${editDurationValue} ${editDurationUnit}`;
    const subs = goal.subtasks.map(s => s.id === subId ? { ...s, title: editValue, duration: finalDuration } : s);
    updateGoal({ ...goal, subtasks: subs });
    setEditingId(null);
  };

  return (
    <Card className="p-5 bg-card border-border/60 shadow-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{t("tasks_for_today")}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span>{todayTasks.filter((t) => t.done).length} {t("of")} {todayTasks.length} {t("completed")}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatMinutes(todayTasks.reduce((acc, t) => acc + parseDurationToMinutes(t.duration), 0))}
            </span>
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {t("ai_plan")}
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {todayTasks.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border/20 rounded-xl">
            {t("no_tasks_found")}
          </div>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors group/item",
                task.done && "opacity-60"
              )}
            >
              <Checkbox
                checked={task.done}
                onCheckedChange={() => toggle(task.goalId, task.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                {task.goalTitle && (
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 font-bold truncate">{task.goalTitle}</div>
                )}
                {editingId === task.id ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <input 
                        className="flex-1 bg-background border border-primary/20 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:border-primary font-medium text-foreground"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.goalId, task.id)}
                        autoFocus
                      />
                      <button onClick={() => saveEdit(task.goalId, task.id)} className="text-success hover:scale-110 transition-transform">
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-destructive hover:scale-110 transition-transform">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <div className="flex items-center bg-background border border-primary/20 rounded-md overflow-hidden h-6">
                        <input 
                          type="number"
                          className="w-12 px-1.5 py-0.5 text-xs focus:outline-none bg-transparent text-foreground"
                          value={editDurationValue}
                          placeholder="0"
                          onChange={(e) => setEditDurationValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.goalId, task.id)}
                        />
                        <select 
                          className="bg-muted/50 border-l border-primary/10 text-[10px] px-1 h-full focus:outline-none cursor-pointer font-medium text-foreground"
                          value={editDurationUnit}
                          onChange={(e) => setEditDurationUnit(e.target.value)}
                        >
                          <option value={t("min")}>{t("min")}</option>
                          <option value={t("hour")}>{t("hour")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={cn("text-sm font-medium group/text flex items-center gap-2", task.done && "line-through")}>
                      <span className="flex-1 truncate">{task.title}</span>
                      <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 transition-opacity">
                        <button 
                          onClick={() => startEditing(task)}
                          className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.goalId, task.id)}
                          className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.duration}
                      </span>
                      {task.aiSuggested && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              {task.done && (
                <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-success" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
