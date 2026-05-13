import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { chatWithGemini } from "@/lib/gemini";
import { toast } from "sonner";
import { Plus, Sparkles, ChevronRight, Clock, Trash2, Pencil, Check, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFocusStore } from "@/hooks/use-focus-store";
import { Goal, Subtask } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isSameDay, addDays, subDays, parseISO } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/_app/tasks")({
  component: TasksPage,
});

type FilterType = "all" | "active" | "completed";
type ViewMode = "daily" | "global";

function TasksPage() {
  const { goals, addGoal, deleteGoal: removeGoal, updateGoal, completeDay } = useFocusStore();
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState("");
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDurationValue, setEditDurationValue] = useState("15");
  const [editDurationUnit, setEditDurationUnit] = useState(t("min"));

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  const yesterday = subDays(new Date(), 1);
  const today = new Date();
  const tomorrow = addDays(new Date(), 1);

  const dateLocale = language === "ru" ? ru : enUS;

  const parseDurationToMinutes = (duration: string): number => {
    if (!duration) return 0;
    const parts = duration.split(" ");
    const value = parseFloat(parts[0]) || 0;
    const unit = parts[1] || t("min");
    if (unit === "ч" || unit === "h") return Math.round(value * 60);
    return Math.round(value);
  };

  const formatMinutes = (totalMinutes: number): string => {
    if (totalMinutes < 60) return `${totalMinutes} ${t("min")}`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}${t("hour")} ${minutes}${t("min")}` : `${hours}${t("hour")}`;
  };

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      if (viewMode === "global") {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return goal.progress < 100;
        if (statusFilter === "completed") return goal.progress === 100;
        return true;
      } else {
        const goalDate = goal.createdAt ? parseISO(goal.createdAt) : new Date();
        const matchesDate = isSameDay(goalDate, selectedDate);
        if (!matchesDate) return false;

        if (statusFilter === "active") return goal.progress < 100;
        if (statusFilter === "completed") return goal.progress === 100;
        return true;
      }
    });
  }, [goals, selectedDate, statusFilter, viewMode]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setViewMode("daily");
    if (viewMode === "global") setStatusFilter("all");
  };

  const handleStatusSelect = (filter: FilterType) => {
    setStatusFilter(filter);
    setViewMode("global");
  };

  const breakdownWithAI = async () => {
    if (!newGoal.trim() || isBreakingDown) return;

    setIsBreakingDown(true);
    const toastId = toast.loading(language === "ru" ? "AI анализирует цель..." : "AI analyzing goal...");

    try {
      const prompt = `You are a productivity expert. Break down "${newGoal}" into 4-6 diverse stages. 
      Rules: No repetitive steps. Clear actions. 
      Return JSON array of objects with title and duration. Title MUST BE in the same language as "${newGoal}".`;

      const response = await chatWithGemini(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid AI response");
      
      const subtasksData = JSON.parse(jsonMatch[0]);
      
      const newGoalObj: Goal = {
        id: Math.random().toString(36).substring(2, 11),
        title: newGoal,
        progress: 0,
        createdAt: selectedDate.toISOString(),
        subtasks: subtasksData.map((s: any) => ({
          id: Math.random().toString(36).substring(2, 11),
          title: s.title,
          duration: s.duration,
          done: false,
        })),
      };

      addGoal(newGoalObj);
      setExpanded(newGoalObj.id);
      setNewGoal("");
      setIsDialogOpen(false);
      toast.success(language === "ru" ? "Задача создана!" : "Task created!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(language === "ru" ? "Ошибка." : "Error.", { id: toastId });
    } finally {
      setIsBreakingDown(false);
    }
  };

  const createManually = () => {
    if (!newGoal.trim()) return;

    const newGoalObj: Goal = {
      id: Math.random().toString(36).substring(2, 11),
      title: newGoal,
      progress: 0,
      createdAt: selectedDate.toISOString(),
      subtasks: [],
    };

    addGoal(newGoalObj);
    setExpanded(newGoalObj.id);
    setNewGoal("");
    setIsDialogOpen(false);
    toast.success(language === "ru" ? "Создано вручную!" : "Created manually!");
  };

  const toggleSubtask = (goalId: string, subId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const subs = goal.subtasks.map((s) => {
      if (s.id === subId) {
        const isNowDone = !s.done;
        if (isNowDone) completeDay();
        return { ...s, done: isNowDone };
      }
      return s;
    });
    const progress = Math.round((subs.filter((s) => s.done).length / subs.length) * 100);
    updateGoal({ ...goal, subtasks: subs, progress });
  };

  const deleteGoalAction = (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t("delete_task_confirm"))) {
      removeGoal(goalId);
      toast.success(language === "ru" ? "Удалено" : "Deleted");
    }
  };

  const deleteSubtask = (goalId: string, subId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const subs = goal.subtasks.filter((s) => s.id !== subId);
    const progress = subs.length > 0 ? Math.round((subs.filter((s) => s.done).length / subs.length) * 100) : 0;
    updateGoal({ ...goal, subtasks: subs, progress });
  };

  const startEditGoal = (goal: Goal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGoalId(goal.id);
    setEditValue(goal.title);
  };

  const saveGoalEdit = (goalId: string) => {
    if (editValue.trim()) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        updateGoal({ ...goal, title: editValue.trim() });
      }
    }
    setEditingGoalId(null);
  };

  const startEditSubtask = (sub: Subtask) => {
    setEditingSubId(sub.id);
    setEditValue(sub.title);
    const parts = sub.duration.split(" ");
    setEditDurationValue(parts[0] || "");
    setEditDurationUnit(parts[1] || t("min"));
  };

  const saveSubEdit = (goalId: string, subId: string) => {
    if (editValue.trim()) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const finalDuration = `${editDurationValue} ${editDurationUnit}`;
        const subs = goal.subtasks.map(s => s.id === subId ? { ...s, title: editValue.trim(), duration: finalDuration } : s);
        updateGoal({ ...goal, subtasks: subs });
      }
    }
    setEditingSubId(null);
  };

  const addSubtaskManually = (goalId: string) => {
    if (!editValue.trim()) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newSub: Subtask = {
      id: Math.random().toString(36).substring(2, 11),
      title: editValue.trim(),
      duration: `${editDurationValue || "15"} ${editDurationUnit}`,
      done: false,
    };

    const subs = [...goal.subtasks, newSub];
    const progress = Math.round((subs.filter((s) => s.done).length / subs.length) * 100);
    updateGoal({ ...goal, subtasks: subs, progress });
    setEditValue("");
    setEditDurationValue("15");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("tasks_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("tasks_subtitle")}</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-elegant h-11 px-6 rounded-2xl">
              <Plus className="h-5 w-5 mr-1" /> {t("new_task_btn")}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/60 rounded-[32px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">{t("create_new_task")}</DialogTitle>
              <DialogDescription>{language === "ru" ? "Опишите вашу задачу" : "Describe your task"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/40 focus-within:border-primary/40 transition-colors">
                <Sparkles className={cn("h-5 w-5 text-accent shrink-0", isBreakingDown && "animate-spin")} />
                <Input 
                  placeholder={t("task_description_placeholder")} 
                  className="bg-transparent border-none focus-visible:ring-0 text-base p-0" 
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  disabled={isBreakingDown}
                  onKeyDown={(e) => e.key === "Enter" && (isBreakingDown ? null : breakdownWithAI())}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  className="border-border/60 hover:bg-muted/50 rounded-2xl h-12 text-base font-medium"
                  onClick={createManually}
                  disabled={isBreakingDown || !newGoal.trim()}
                >
                  {t("split_manually")}
                </Button>
                <Button 
                  className="bg-gradient-primary h-12 rounded-2xl text-base font-semibold shadow-elegant" 
                  onClick={breakdownWithAI}
                  disabled={isBreakingDown || !newGoal.trim()}
                >
                  {isBreakingDown ? "..." : t("split_with_ai")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-2xl border border-border/40 w-fit transition-all">
            <Button
              variant={viewMode === "daily" && isSameDay(selectedDate, yesterday) ? "secondary" : "ghost"}
              className={cn("rounded-xl h-9 px-4 text-sm font-medium", viewMode === "daily" && isSameDay(selectedDate, yesterday) && "bg-background shadow-sm")}
              onClick={() => handleDateSelect(yesterday)}
            >
              {t("yesterday")}
            </Button>
            <Button
              variant={viewMode === "daily" && isSameDay(selectedDate, today) ? "secondary" : "ghost"}
              className={cn("rounded-xl h-9 px-4 text-sm font-medium", viewMode === "daily" && isSameDay(selectedDate, today) && "bg-background shadow-sm")}
              onClick={() => handleDateSelect(today)}
            >
              {t("today_cap")}
            </Button>
            <Button
              variant={viewMode === "daily" && isSameDay(selectedDate, tomorrow) ? "secondary" : "ghost"}
              className={cn("rounded-xl h-9 px-4 text-sm font-medium", viewMode === "daily" && isSameDay(selectedDate, tomorrow) && "bg-background shadow-sm")}
              onClick={() => handleDateSelect(tomorrow)}
            >
              {t("tomorrow")}
            </Button>
            <div className="w-[1px] h-4 bg-border/60 mx-1" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && handleDateSelect(date)} locale={dateLocale} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-2xl border border-border/40">
            <Button variant={viewMode === "global" && statusFilter === "all" ? "secondary" : "ghost"} size="sm" className="rounded-xl h-8 px-3 text-xs" onClick={() => handleStatusSelect("all")}>{t("all_btn")}</Button>
            <Button variant={viewMode === "global" && statusFilter === "active" ? "secondary" : "ghost"} size="sm" className="rounded-xl h-8 px-3 text-xs" onClick={() => handleStatusSelect("active")}>{t("active_btn")}</Button>
            <Button variant={viewMode === "global" && statusFilter === "completed" ? "secondary" : "ghost"} size="sm" className="rounded-xl h-8 px-3 text-xs" onClick={() => handleStatusSelect("completed")}>{t("completed_btn")}</Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium px-1">
          {viewMode === "global" ? (
            <>
              <Filter className="h-4 w-4 text-primary" />
              <span>{statusFilter === "all" ? t("all_tasks_ever") : statusFilter === "active" ? t("active_tasks_now") : t("completed_tasks_ever")}</span>
            </>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>{format(selectedDate, "d MMMM yyyy", { locale: dateLocale })} {statusFilter !== "all" && `(${statusFilter === "active" ? t("active_only") : t("completed_only")})`}</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-[32px] bg-muted/10">
            <h3 className="text-lg font-semibold text-muted-foreground">{t("no_tasks_found")}</h3>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const isOpen = expanded === goal.id;
            const isEditing = editingGoalId === goal.id;
            return (
              <Card key={goal.id} className="bg-card border-border/60 shadow-card overflow-hidden rounded-3xl group">
                <div className="flex items-center gap-2 pr-4">
                  <div onClick={() => !isEditing && setExpanded(isOpen ? null : goal.id)} className={cn("flex-1 p-5 flex items-center gap-4 text-left transition-colors", !isEditing && "hover:bg-muted/20 cursor-pointer")}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-90")} />
                          {isEditing ? (
                            <Input value={editValue} autoFocus className="h-9 rounded-xl" onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveGoalEdit(goal.id)} />
                          ) : (
                            <h3 className="font-bold text-lg truncate leading-none">{goal.title}</h3>
                          )}
                        </div>
                        <span className="text-sm font-bold text-primary ml-2 shrink-0 bg-primary/10 px-3 py-1 rounded-full">{goal.progress}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-primary transition-all duration-500 ease-out" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <p className="text-xs text-muted-foreground font-medium">{t("stages_completed", { count: goal.subtasks.filter(s => s.done).length, total: goal.subtasks.length })}</p>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> {t("total_time", { time: formatMinutes(goal.subtasks.reduce((acc, s) => acc + parseDurationToMinutes(s.duration), 0)) })}</p>
                      </div>
                    </div>
                  </div>
                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors rounded-xl" onClick={(e) => startEditGoal(goal, e)}><Pencil className="h-4.5 w-4.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors rounded-xl" onClick={(e) => deleteGoalAction(goal.id, e)}><Trash2 className="h-4.5 w-4.5" /></Button>
                    </div>
                  )}
                </div>
                {isOpen && (
                  <div className="border-t border-border/40 p-4 space-y-2 bg-muted/10">
                    {goal.subtasks.map((s) => (
                      <div key={s.id} className={cn("flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/30 group/sub transition-all", s.done ? "opacity-60 grayscale-[0.5]" : "shadow-sm")}>
                        <Checkbox checked={s.done} onCheckedChange={() => toggleSubtask(goal.id, s.id)} className="rounded-lg h-5 w-5 border-2" />
                        <div className="flex-1">
                          {editingSubId === s.id ? (
                            <Input value={editValue} autoFocus className="h-8 text-sm rounded-lg" onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveSubEdit(goal.id, s.id)} />
                          ) : (
                            <span className={cn("text-sm font-medium block", s.done && "line-through text-muted-foreground")}>{s.title}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg flex items-center gap-1.5"><Clock className="h-3 w-3" />{s.duration}</span>
                          {editingSubId !== s.id && (
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover/sub:opacity-100 rounded-lg" onClick={() => startEditSubtask(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover/sub:opacity-100 rounded-lg" onClick={() => deleteSubtask(goal.id, s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-primary/5 border border-primary/20 border-dashed mt-2">
                      <Input placeholder={t("add_new_stage")} value={editValue} className="h-8 text-sm rounded-lg flex-1 bg-background/50" onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubtaskManually(goal.id)} />
                      <Button size="sm" className="h-8 px-3 rounded-lg bg-primary/80" onClick={() => addSubtaskManually(goal.id)}>{t("add_btn")}</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
