import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Plus, Check, Flame, Calendar, Trophy, Sparkles, X, Target, TrendingUp, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useFocusStore } from "@/hooks/use-focus-store";
import { Habit } from "@/lib/types";

export const Route = createFileRoute("/_app/habits")({
  component: HabitsPage,
});

const MOTIVATIONS = [
  {
    title: "Секрет успеха — в регулярности",
    description: "Вы выполняете свои привычки в 85% случаев за последнюю неделю. Это отличный показатель! AI рекомендует добавить медитацию в вечернее время для лучшего сна.",
    details: "Ваша стабильность в утренних ритуалах выросла на 12%. Исследования показывают, что вечерняя медитация перед сном улучшает качество глубокой фазы сна на 20%, что напрямую влияет на вашу продуктивность на следующий день."
  },
  {
    title: "Маленькие шаги ведут к большим целям",
    description: "Ваша серия из 5 дней чтения — это уже 150 страниц знаний. Представьте, сколько вы узнаете через месяц!",
    details: "Постоянство важнее интенсивности. Продолжая читать по 30 минут в день, вы прочтете около 12 книг за год. AI заметил, что вы лучше всего концентрируетесь на чтении между 19:00 и 20:00."
  },
  {
    title: "Дисциплина сильнее мотивации",
    description: "Вы выполнили все привычки даже в выходные. Это признак настоящего мастера своей жизни.",
    details: "Ваша способность придерживаться графика в свободное время — редкий навык. Это снижает когнитивную нагрузку в понедельник, так как мозг не тратит энергию на 'вход' в рабочий режим."
  },
  {
    title: "Фокус — это мышца, которую вы тренируете",
    description: "За последние 3 дня ваше среднее время концентрации увеличилось на 15 минут. Вы на верном пути!",
    details: "Ваш мозг адаптируется к глубокой работе. Чтобы закрепить результат, попробуйте технику 'Помодоро' 50/10 — это поможет избежать переутомления к концу дня."
  }
];

function HabitsPage() {
  const { habits, addHabit, updateHabit, deleteHabit } = useFocusStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [activeStatModal, setActiveStatModal] = useState<"streak" | "success" | "implemented" | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [randomMotivation, setRandomMotivation] = useState(MOTIVATIONS[0]);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  useState(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONS.length);
    setRandomMotivation(MOTIVATIONS[randomIndex]);
  });

  const toggleHabit = (habit: Habit) => {
    const isNowDone = !habit.completedToday;
    if (isNowDone) toast.success(`Отлично! Привычка "${habit.name}" выполнена!`);
    
    updateHabit({
      ...habit,
      completedToday: isNowDone,
      streak: isNowDone ? habit.streak + 1 : Math.max(0, habit.streak - 1)
    });
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const colors = ["bg-blue-500", "bg-orange-500", "bg-green-500", "bg-purple-500", "bg-pink-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const habit: Habit = {
      id: Math.random().toString(36).substring(2, 11),
      name: newHabitName,
      streak: 0,
      completedToday: false,
      color: randomColor,
      history: [false, false, false, false, false, false, false]
    };
    
    addHabit(habit);
    setNewHabitName("");
    setIsAddOpen(false);
    toast.success("Новая привычка добавлена!");
  };

  const handleUpdateHabit = () => {
    if (editingHabit && editingHabit.name.trim()) {
      updateHabit(editingHabit);
      setEditingHabit(null);
      toast.success("Привычка обновлена");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Привычки</h1>
          <p className="text-muted-foreground mt-1">
            Серия дней — ваш главный якорь прогресса
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-elegant rounded-xl h-9 px-4 text-sm font-bold">
              <Plus className="h-4 w-4 mr-1" /> Новая привычка
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/60 rounded-[32px] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Новая привычка</DialogTitle>
              <DialogDescription>
                Какую полезную привычку вы хотите внедрить сегодня?
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Название</label>
                <Input 
                  placeholder="Например: Планка 2 минуты..." 
                  className="h-12 rounded-2xl bg-muted/30 border-border/40 focus:border-primary/40 transition-all px-4"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                />
              </div>
              <Button 
                className="w-full bg-gradient-primary h-12 rounded-2xl font-bold shadow-elegant"
                onClick={handleAddHabit}
                disabled={!newHabitName.trim()}
              >
                Создать привычку
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          onClick={() => setActiveStatModal("streak")}
          className="p-6 bg-orange-50/50 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-900/20 rounded-[32px] flex items-center gap-4 cursor-pointer hover:shadow-glow transition-all group overflow-hidden"
        >
          <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">25</div>
            <div className="text-xs text-muted-foreground font-medium">Лучшая серия</div>
          </div>
        </Card>

        <Card 
          onClick={() => setActiveStatModal("success")}
          className="p-6 bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/50 dark:border-blue-900/20 rounded-[32px] flex items-center gap-4 cursor-pointer hover:shadow-glow transition-all group overflow-hidden"
        >
          <div className="h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {(() => {
                const totalDays = habits.length * 7;
                const completedDays = habits.reduce((acc, h) => acc + h.history.filter(d => d).length, 0);
                return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
              })()}%
            </div>
            <div className="text-xs text-muted-foreground font-medium">Успешность за месяц</div>
          </div>
        </Card>

        <Card 
          onClick={() => setActiveStatModal("implemented")}
          className="p-6 bg-purple-50/50 dark:bg-purple-950/10 border-purple-200/50 dark:border-purple-900/20 rounded-[32px] flex items-center gap-4 cursor-pointer hover:shadow-glow transition-all group overflow-hidden"
        >
          <div className="h-12 w-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{habits.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Привычек внедрено</div>
          </div>
        </Card>
      </div>

      {/* Habits List */}
      <div className="grid grid-cols-1 gap-4">
        {habits.map((habit) => (
          <Card key={habit.id} className="p-6 bg-card border-border/60 rounded-[32px] transition-all hover:shadow-glow hover:border-primary/20 group relative overflow-hidden">
            <div className="flex items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div 
                  onClick={() => toggleHabit(habit)}
                  className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all shrink-0 border-2",
                    habit.completedToday 
                      ? `${habit.color} border-transparent text-white shadow-lg scale-95` 
                      : "border-border/40 hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  {habit.completedToday ? <Check className="h-7 w-7" /> : <Activity className="h-7 w-7" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate leading-tight group-hover:text-primary transition-colors">{habit.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                      <Flame className="h-3 w-3 fill-orange-500" />
                      {habit.streak} дней
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Ежедневно</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* History dots */}
                <div className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-muted/30 rounded-2xl border border-border/40 transition-colors group-hover:border-primary/20">
                  {habit.history.map((done, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-3 w-3 rounded-full transition-all",
                        done ? habit.color : "bg-muted-foreground/20"
                      )}
                      title={done ? "Выполнено" : "Пропущено"}
                    />
                  ))}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:bg-muted/50">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-border/60 p-1">
                    <DropdownMenuItem 
                      className="rounded-xl flex items-center gap-2 font-medium focus:bg-muted/50 cursor-pointer"
                      onClick={() => setEditingHabit(habit)}
                    >
                      <Edit2 className="h-4 w-4" /> Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="rounded-xl flex items-center gap-2 font-medium text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      onClick={() => {
                        deleteHabit(habit.id);
                        toast.success("Привычка удалена");
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant={habit.completedToday ? "secondary" : "default"}
                  className={cn(
                    "rounded-2xl h-12 px-6 font-bold shadow-sm transition-all",
                    habit.completedToday && "bg-muted/50 text-muted-foreground border-transparent"
                  )}
                  onClick={() => toggleHabit(habit)}
                >
                  {habit.completedToday ? "Готово" : "Выполнить"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Habit Dialog */}
      <Dialog open={!!editingHabit} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <DialogContent className="bg-card border-border/60 rounded-[32px] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Редактировать привычку</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Название</label>
              <Input 
                placeholder="Название привычки..." 
                className="h-12 rounded-2xl bg-muted/30 border-border/40 focus:border-primary/40 transition-all px-4"
                value={editingHabit?.name || ""}
                onChange={(e) => editingHabit && setEditingHabit({ ...editingHabit, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateHabit()}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start gap-2">
            <Button className="flex-1 bg-gradient-primary rounded-2xl h-11 font-bold" onClick={handleUpdateHabit}>
              Сохранить
            </Button>
            <Button variant="ghost" className="rounded-2xl h-11 font-bold" onClick={() => setEditingHabit(null)}>
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card 
        onClick={() => setIsLearnMoreOpen(true)}
        className="p-6 bg-gradient-primary text-primary-foreground rounded-[32px] shadow-glow relative overflow-hidden group border-none cursor-pointer hover:scale-[1.01] transition-all duration-300"
      >
        <div className="relative z-10 flex flex-col items-center gap-2 text-center">
          <div className="space-y-1.5 flex-1">
            <h2 className="text-xl font-bold font-serif italic tracking-tight">{randomMotivation.title}</h2>
            <p className="text-white/80 max-w-xl text-sm leading-relaxed font-medium">
              {randomMotivation.description}
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-white/20 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </Card>

      {/* Learn More Modal */}
      <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <DialogContent className="bg-card border-border/60 rounded-[32px] sm:max-w-[440px] overflow-hidden p-0">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary" />
          <DialogHeader className="pt-8 px-6 flex flex-col items-center text-center">
            <DialogTitle className="text-xl font-serif italic leading-tight">{randomMotivation.title}</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2 space-y-4 flex flex-col items-center">
            <div className="p-5 bg-muted/30 rounded-[20px] border border-border/40 relative overflow-hidden group w-full text-center">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
               <p className="text-sm leading-relaxed text-foreground/90 font-medium relative z-10">
                 {randomMotivation.details}
               </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-success/10 rounded-2xl border border-success/20">
                <div className="text-xs font-bold text-success uppercase tracking-wider mb-1">Прогноз</div>
                <div className="text-lg font-bold">+15% к энергии</div>
              </div>
              <div className="p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Срок</div>
                <div className="text-lg font-bold">~14 дней</div>
              </div>
            </div>

            <Button 
              className="bg-gradient-primary h-7 px-5 rounded-lg font-bold shadow-elegant group text-[10px] self-center" 
              onClick={() => setIsLearnMoreOpen(false)}
            >
              Применить совет 
              <Target className="ml-1.5 h-3 w-3 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals for Stats */}
      <Dialog open={activeStatModal === "streak"} onOpenChange={(open) => !open && setActiveStatModal(null)}>
        <DialogContent className="bg-card border-border/60 rounded-[32px] sm:max-w-[450px]">
          <DialogHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center mb-4">
              <Flame className="h-10 w-10 fill-orange-500" />
            </div>
            <DialogTitle className="text-3xl font-bold text-center">Лучшая серия: 25 дней</DialogTitle>
            <DialogDescription className="text-center text-lg mt-2 italic font-serif">
              "Дисциплина — это решение делать то, что ты не хочешь делать, чтобы достичь того, что ты очень хочешь достичь."
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4 text-center">
            <div className="p-4 bg-muted/30 rounded-2xl border border-border/40">
              <p className="text-sm text-muted-foreground">Вы держите ритм уже почти месяц. Это невероятный результат, который формирует вашу новую личность.</p>
            </div>
            <Button className="w-full bg-gradient-primary h-12 rounded-2xl font-bold" onClick={() => setActiveStatModal(null)}>
              Так держать!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeStatModal === "success"} onOpenChange={(open) => !open && setActiveStatModal(null)}>
        <DialogContent className="bg-card border-border/60 rounded-[32px] sm:max-w-[450px]">
          <DialogHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center mb-4">
              <TrendingUp className="h-10 w-10" />
            </div>
            <DialogTitle className="text-3xl font-bold text-center">Успешность: {(() => {
              const totalDays = habits.length * 7;
              const completedDays = habits.reduce((acc, h) => acc + h.history.filter(d => d).length, 0);
              return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
            })()}%</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Ваш прогресс за последние 30 дней (2026 год)
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Май 2026</span>
                <span className="text-primary">{(() => {
                  const totalDays = habits.length * 7;
                  const completedDays = habits.reduce((acc, h) => acc + h.history.filter(d => d).length, 0);
                  return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
                })()}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${(() => {
                    const totalDays = habits.length * 7;
                    const completedDays = habits.reduce((acc, h) => acc + h.history.filter(d => d).length, 0);
                    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
                  })()}%` }} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Апрель 2026</span>
                <span className="text-muted-foreground">78%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-muted-foreground/30 transition-all duration-1000" style={{ width: "78%" }} />
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground font-medium">
              На основе вашей активности за последнюю неделю в 2026 году. 
              Продолжайте в том же духе!
            </p>
            <Button className="w-full bg-gradient-primary h-12 rounded-2xl font-bold" onClick={() => setActiveStatModal(null)}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeStatModal === "implemented"} onOpenChange={(open) => !open && setActiveStatModal(null)}>
        <DialogContent className="bg-card border-border/60 rounded-[32px] sm:max-w-[450px]">
          <DialogHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-500 flex items-center justify-center mb-4">
              <Trophy className="h-10 w-10" />
            </div>
            <DialogTitle className="text-3xl font-bold text-center">{habits.length} внедренных привычки</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Привычки, ставшие частью вашей жизни
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/40 group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-success/20 text-success flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="font-bold">{habit.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setActiveStatModal(null);
                    setEditingHabit(habit);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button className="w-full bg-gradient-primary h-12 rounded-2xl font-bold mt-4" onClick={() => setActiveStatModal(null)}>
              Вперед к новым вершинам
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
