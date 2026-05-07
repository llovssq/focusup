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
import { ru } from "date-fns/locale";

export const Route = createFileRoute("/_app/tasks")({
  component: TasksPage,
});

type FilterType = "all" | "active" | "completed";
type ViewMode = "daily" | "global";

const parseDurationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  const parts = duration.split(" ");
  const value = parseFloat(parts[0]) || 0;
  const unit = parts[1] || "мин";
  if (unit === "ч") return Math.round(value * 60);
  return Math.round(value);
};

const formatMinutes = (totalMinutes: number): string => {
  if (totalMinutes < 60) return `${totalMinutes} мин`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}ч ${minutes}мин` : `${hours}ч`;
};

function TasksPage() {
  const { goals, addGoal, deleteGoal: removeGoal, updateGoal, completeDay } = useFocusStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState("");
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDurationValue, setEditDurationValue] = useState("");
  const [editDurationUnit, setEditDurationUnit] = useState("мин");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  const yesterday = subDays(new Date(), 1);
  const today = new Date();
  const tomorrow = addDays(new Date(), 1);

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      if (viewMode === "global") {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return goal.progress < 100;
        if (statusFilter === "completed") return goal.progress === 100;
        return true;
      } else {
        // Daily view
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
    // When switching to daily, we usually want to see all tasks for that day
    if (viewMode === "global") setStatusFilter("all");
  };

  const handleStatusSelect = (filter: FilterType) => {
    setStatusFilter(filter);
    setViewMode("global");
  };

  const breakdownWithAI = async () => {
    if (!newGoal.trim() || isBreakingDown) return;

    setIsBreakingDown(true);
    const toastId = toast.loading("AI анализирует цель и разбивает её на этапы...");

    try {
      const prompt = `Ты — эксперт по продуктивности и когнитивной психологии. 
      Твоя задача — разбить цель "${newGoal}" на 4-6 максимально эффективных и РАЗНООБРАЗНЫХ этапов.
      
      ПРАВИЛА:
      1. НИКОГДА не создавай однотипные шаги (например, "Часть 1", "Часть 2" или "Первые 25 слов", "Следующие 25 слов"). Это неэффективно.
      2. Используй разные форматы деятельности для глубокого погружения:
         - Анализ и фильтрация (выделение 20% самого важного по принципу Парето).
         - Активное изучение и ассоциации (создание связей, карточек, ментальных карт).
         - Практическое применение (написание текста, решение реального кейса, симуляция).
         - Проверка и закрепление (тестирование, объяснение другому, интервальное повторение).
      3. Каждый этап должен быть четким, измеримым действием.
      
      Верни ответ СТРОГО в формате JSON массива объектов, где каждый объект имеет поля: title (название задачи на русском) и duration (длительность, например "30 мин", "1 ч").
      Не пиши ничего кроме JSON.`;

      const response = await chatWithGemini(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Не удалось распознать формат ответа ИИ");
      
      const subtasksData = JSON.parse(jsonMatch[0]);
      
      const newGoalObj: Goal = {
        id: Math.random().toString(36).substring(2, 11),
        title: newGoal,
        progress: 0,
        createdAt: selectedDate.toISOString(), // Save with selected date
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
      toast.success("Задачу успешно создана и разбита на этапы!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Не удалось разбить цель. Попробуй ещё раз.", { id: toastId });
    } finally {
      setIsBreakingDown(false);
    }
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
    if (confirm("Удалить эту задачу?")) {
      removeGoal(goalId);
      toast.success("Задача удалена");
    }
  };

  const deleteSubtask = (goalId: string, subId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const subs = goal.subtasks.filter((s) => s.id !== subId);
    const progress = subs.length > 0 ? Math.round((subs.filter((s) => s.done).length / subs.length) * 100) : 0;
    
    updateGoal({ ...goal, subtasks: subs, progress });
    toast.success("Этап удален");
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
        toast.success("Задача обновлена");
      }
    }
    setEditingGoalId(null);
  };

  const startEditSubtask = (sub: Subtask) => {
    setEditingSubId(sub.id);
    setEditValue(sub.title);
    const parts = sub.duration.split(" ");
    setEditDurationValue(parts[0] || "");
    setEditDurationUnit(parts[1] || "мин");
  };

  const saveSubEdit = (goalId: string, subId: string) => {
    if (editValue.trim()) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const finalDuration = `${editDurationValue} ${editDurationUnit}`;
        const subs = goal.subtasks.map(s => s.id === subId ? { ...s, title: editValue.trim(), duration: finalDuration } : s);
        updateGoal({ ...goal, subtasks: subs });
        toast.success("Этап обновлен");
      }
    }
    setEditingSubId(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Задачи</h1>
          <p className="text-muted-foreground mt-1">
            Управляйте своими делами и разбивайте их на этапы с помощью AI
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-elegant h-11 px-6 rounded-2xl">
              <Plus className="h-5 w-5 mr-1" /> Новая задача
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/60 rounded-[32px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Создать новую задачу</DialogTitle>
              <DialogDescription>
                Опишите вашу задачу, и наш AI помощник разобьет её на конкретные шаги.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/40 focus-within:border-primary/40 transition-colors">
                <Sparkles className={cn("h-5 w-5 text-accent shrink-0", isBreakingDown && "animate-spin")} />
                <Input 
                  placeholder="Например: Выучить основы React..." 
                  className="bg-transparent border-none focus-visible:ring-0 text-base p-0" 
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  disabled={isBreakingDown}
                  onKeyDown={(e) => e.key === "Enter" && breakdownWithAI()}
                />
              </div>
              <Button 
                className="w-full bg-gradient-primary h-12 rounded-2xl text-base font-semibold shadow-elegant" 
                onClick={breakdownWithAI}
                disabled={isBreakingDown || !newGoal.trim()}
              >
                {isBreakingDown ? "AI анализирует..." : "Разбить на этапы с AI"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date and Filter Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className={cn(
            "flex items-center gap-2 p-1 bg-muted/40 rounded-2xl border border-border/40 w-fit transition-all",
            viewMode === "global" && "bg-muted/10 opacity-70"
          )}>
            <Button
              variant={viewMode === "daily" && isSameDay(selectedDate, yesterday) ? "secondary" : "ghost"}
              className={cn("rounded-xl h-9 px-4 text-sm font-medium", viewMode === "daily" && isSameDay(selectedDate, yesterday) && "bg-background shadow-sm")}
              onClick={() => handleDateSelect(yesterday)}
            >
              Вчера
            </Button>
            <Button
              variant={viewMode === "daily" && isSameDay(selectedDate, today) ? "secondary" : "ghost"}
              className={cn("rounded-xl h-9 px-4 text-sm font-medium", viewMode === "daily" && isSameDay(selectedDate, today) && "bg-background shadow-sm")}
              onClick={() => handleDateSelect(today)}
            >
              Сегодня
            </Button>
            <Button
              variant={viewMode === "daily" && isSameDay(selectedDate, tomorrow) ? "secondary" : "ghost"}
              className={cn("rounded-xl h-9 px-4 text-sm font-medium", viewMode === "daily" && isSameDay(selectedDate, tomorrow) && "bg-background shadow-sm")}
              onClick={() => handleDateSelect(tomorrow)}
            >
              Завтра
            </Button>
            <div className="w-[1px] h-4 bg-border/60 mx-1" />
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={viewMode === "daily" && !isSameDay(selectedDate, yesterday) && !isSameDay(selectedDate, today) && !isSameDay(selectedDate, tomorrow) ? "secondary" : "ghost"} 
                  size="icon" 
                  className={cn("rounded-xl h-9 w-9 text-muted-foreground hover:text-primary", viewMode === "daily" && !isSameDay(selectedDate, yesterday) && !isSameDay(selectedDate, today) && !isSameDay(selectedDate, tomorrow) && "bg-background shadow-sm text-primary")}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && handleDateSelect(date)}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-2xl border border-border/40">
            <Button
              variant={viewMode === "global" && statusFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              className={cn("rounded-xl h-8 px-3 text-xs font-medium", viewMode === "global" && statusFilter === "all" && "bg-background shadow-sm")}
              onClick={() => handleStatusSelect("all")}
            >
              Все
            </Button>
            <Button
              variant={viewMode === "global" && statusFilter === "active" ? "secondary" : "ghost"}
              size="sm"
              className={cn("rounded-xl h-8 px-3 text-xs font-medium", viewMode === "global" && statusFilter === "active" && "bg-background shadow-sm")}
              onClick={() => handleStatusSelect("active")}
            >
              Активные
            </Button>
            <Button
              variant={viewMode === "global" && statusFilter === "completed" ? "secondary" : "ghost"}
              size="sm"
              className={cn("rounded-xl h-8 px-3 text-xs font-medium", viewMode === "global" && statusFilter === "completed" && "bg-background shadow-sm")}
              onClick={() => handleStatusSelect("completed")}
            >
              Выполнено
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium px-1 transition-all">
          {viewMode === "global" ? (
            <>
              {statusFilter === "all" && (
                <>
                  <Filter className="h-4 w-4 text-primary" />
                  <span>Все задачи за всё время</span>
                </>
              )}
              {statusFilter === "active" && (
                <>
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Все активные задачи на данный момент</span>
                </>
              )}
              {statusFilter === "completed" && (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  <span>Все выполненные задачи за всё время</span>
                </>
              )}
            </>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>
                {format(selectedDate, "d MMMM yyyy", { locale: ru })}
                {statusFilter !== "all" && (
                  <span className="ml-1 text-primary">
                    ({statusFilter === "active" ? "только активные" : "только выполненные"})
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-[32px] bg-muted/10">
            <div className="h-16 w-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">Задач не найдено</h3>
            <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-1">
              На этот день задач пока нет. Самое время создать что-нибудь новое!
            </p>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const isOpen = expanded === goal.id;
            const isEditing = editingGoalId === goal.id;

            return (
              <Card key={goal.id} className="bg-card border-border/60 shadow-card overflow-hidden rounded-3xl transition-all hover:shadow-elegant">
                <div className="flex items-center gap-2 pr-4">
                  <div
                    onClick={() => !isEditing && setExpanded(isOpen ? null : goal.id)}
                    className={cn(
                      "flex-1 p-5 flex items-center gap-4 text-left transition-colors",
                      !isEditing && "hover:bg-muted/20 cursor-pointer"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform shrink-0", isOpen && "rotate-90")} />
                          {isEditing ? (
                            <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                              <Input 
                                value={editValue}
                                autoFocus
                                className="h-9 rounded-xl"
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && saveGoalEdit(goal.id)}
                                onBlur={() => saveGoalEdit(goal.id)}
                              />
                              <Button size="icon" className="h-9 w-9 shrink-0 rounded-xl" onClick={() => saveGoalEdit(goal.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <h3 className="font-bold text-lg truncate leading-none">{goal.title}</h3>
                          )}
                        </div>
                        <span className="text-sm font-bold text-primary ml-2 shrink-0 bg-primary/10 px-3 py-1 rounded-full">{goal.progress}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary transition-all duration-500 ease-out"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <p className="text-xs text-muted-foreground font-medium">
                          {goal.subtasks.filter((s) => s.done).length} из {goal.subtasks.length} этапов выполнено
                        </p>
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatMinutes(goal.subtasks.reduce((acc, s) => acc + parseDurationToMinutes(s.duration), 0))} всего
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-primary/10"
                        onClick={(e) => startEditGoal(goal, e)}
                      >
                        <Pencil className="h-4.5 w-4.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/10"
                        onClick={(e) => deleteGoalAction(goal.id, e)}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {isOpen && (
                  <div className="border-t border-border/40 p-4 space-y-2 bg-muted/10">
                    {goal.subtasks.map((s) => {
                      const isSubEditing = editingSubId === s.id;
                      return (
                        <div
                          key={s.id}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/30 group transition-all",
                            s.done ? "opacity-60 grayscale-[0.5]" : "shadow-sm hover:border-primary/30"
                          )}
                        >
                          <Checkbox 
                            checked={s.done} 
                            onCheckedChange={() => toggleSubtask(goal.id, s.id)} 
                            className="rounded-lg h-5 w-5 border-2"
                          />
                          
                          <div className="flex-1">
                            {isSubEditing ? (
                              <div className="flex flex-col gap-2 w-full">
                                <div className="flex items-center gap-2">
                                  <Input 
                                    value={editValue}
                                    autoFocus
                                    className="h-8 text-sm rounded-lg flex-1"
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && saveSubEdit(goal.id, s.id)}
                                  />
                                  <Button size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={() => saveSubEdit(goal.id, s.id)}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-1.5 ml-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <div className="flex items-center bg-muted/20 border border-border/40 rounded-md overflow-hidden h-6">
                                    <input 
                                      type="number"
                                      className="w-10 px-1 text-[10px] focus:outline-none bg-transparent"
                                      value={editDurationValue}
                                      onChange={(e) => setEditDurationValue(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && saveSubEdit(goal.id, s.id)}
                                    />
                                    <select 
                                      className="bg-muted/40 border-l border-border/40 text-[9px] px-1 h-full focus:outline-none cursor-pointer"
                                      value={editDurationUnit}
                                      onChange={(e) => setEditDurationUnit(e.target.value)}
                                    >
                                      <option value="мин">мин</option>
                                      <option value="ч">ч</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className={cn("text-sm font-medium block", s.done && "line-through text-muted-foreground")}>{s.title}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {s.duration}
                            </span>
                            
                            {!isSubEditing && (
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-primary/10"
                                  onClick={() => startEditSubtask(s)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-destructive/10"
                                  onClick={() => deleteSubtask(goal.id, s.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
