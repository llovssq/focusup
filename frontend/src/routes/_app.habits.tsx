import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Activity, Plus, Check, Flame, Calendar, Trophy, Target, TrendingUp, Edit2, Trash2, MoreVertical } from "lucide-react";
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
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/_app/habits")({
  component: HabitsPage,
});

const MOTIVATIONS = {
  ru: [
    {
      title: "Секрет успеха — в регулярности",
      description: "Вы выполняете свои привычки в 85% случаев за последнюю неделю. Это отличный показатель!",
      details: "Ваша стабильность в утренних ритуалах выросла на 12%. Исследования показывают, что вечерняя медитация улучшает качество сна на 20%."
    },
    {
      title: "Маленькие шаги ведут к большим целям",
      description: "Ваша серия из 5 дней чтения — это уже 150 страниц знаний.",
      details: "Постоянство важнее интенсивности. Продолжая читать по 30 минут в день, вы прочтете около 12 книг за год."
    }
  ],
  en: [
    {
      title: "Consistency is key",
      description: "You've completed your habits 85% of the time this week. Excellent job!",
      details: "Your morning ritual stability increased by 12%. Research shows evening meditation improves sleep quality by 20%."
    },
    {
      title: "Small steps, big goals",
      description: "Your 5-day reading streak equals 150 pages of knowledge.",
      details: "Consistency matters more than intensity. Reading 30 minutes a day adds up to about 12 books a year."
    }
  ]
};

function HabitsPage() {
  const { habits, addHabit, updateHabit, deleteHabit } = useFocusStore();
  const { t, language } = useLanguage();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [activeStatModal, setActiveStatModal] = useState<"streak" | "success" | "implemented" | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  const motivations = language === "ru" ? MOTIVATIONS.ru : MOTIVATIONS.en;
  const randomMotivation = useMemo(() => motivations[Math.floor(Math.random() * motivations.length)], [language]);

  const toggleHabit = (habit: Habit) => {
    const isNowDone = !habit.completedToday;
    if (isNowDone) toast.success(language === "ru" ? `Отлично! Привычка "${habit.name}" выполнена!` : `Great! Habit "${habit.name}" completed!`);
    
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
    toast.success(language === "ru" ? "Привычка добавлена!" : "Habit added!");
  };

  const handleUpdateHabit = () => {
    if (editingHabit && editingHabit.name.trim()) {
      updateHabit(editingHabit);
      setEditingHabit(null);
      toast.success(language === "ru" ? "Обновлено" : "Updated");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("habits_title")}</h1>
          <p className="text-muted-foreground mt-1">{t("habits_subtitle")}</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-elegant rounded-xl h-9 px-4 text-sm font-bold">
              <Plus className="h-4 w-4 mr-1" /> {t("new_habit")}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/60 rounded-[32px] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">{t("new_habit")}</DialogTitle>
              <DialogDescription>{language === "ru" ? "Какую привычку внедрим?" : "Which habit to build?"}</DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <Input 
                placeholder={language === "ru" ? "Например: Читать 20 мин" : "Example: Read 20 min"} 
                className="h-12 rounded-2xl bg-muted/30"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
              />
              <Button className="w-full bg-gradient-primary h-12 rounded-2xl font-bold" onClick={handleAddHabit} disabled={!newHabitName.trim()}>
                {t("add_btn")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card onClick={() => setActiveStatModal("streak")} className="p-6 bg-orange-50/50 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-900/20 rounded-[32px] flex items-center gap-4 cursor-pointer hover:shadow-glow transition-all group">
          <Flame className="h-12 w-12 text-orange-500 group-hover:scale-110 transition-transform" />
          <div><div className="text-2xl font-bold">25</div><div className="text-xs text-muted-foreground font-medium">{language === "ru" ? "Лучшая серия" : "Best streak"}</div></div>
        </Card>
        <Card onClick={() => setActiveStatModal("success")} className="p-6 bg-blue-50/50 dark:bg-blue-950/10 border-blue-200/50 dark:border-blue-900/20 rounded-[32px] flex items-center gap-4 cursor-pointer hover:shadow-glow transition-all group">
          <Calendar className="h-12 w-12 text-blue-500 group-hover:scale-110 transition-transform" />
          <div><div className="text-2xl font-bold">88%</div><div className="text-xs text-muted-foreground font-medium">{language === "ru" ? "Успешность" : "Success rate"}</div></div>
        </Card>
        <Card onClick={() => setActiveStatModal("implemented")} className="p-6 bg-purple-50/50 dark:bg-purple-950/10 border-purple-200/50 dark:border-purple-900/20 rounded-[32px] flex items-center gap-4 cursor-pointer hover:shadow-glow transition-all group">
          <Trophy className="h-12 w-12 text-purple-500 group-hover:scale-110 transition-transform" />
          <div><div className="text-2xl font-bold">{habits.length}</div><div className="text-xs text-muted-foreground font-medium">{language === "ru" ? "Привычек" : "Habits"}</div></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {habits.map((habit) => (
          <Card key={habit.id} className="p-6 bg-card border-border/60 rounded-[32px] hover:shadow-glow group">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div onClick={() => toggleHabit(habit)} className={cn("h-14 w-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all border-2", habit.completedToday ? `${habit.color} text-white` : "border-border/40 hover:border-primary/40")}>
                  {habit.completedToday ? <Check className="h-7 w-7" /> : <Activity className="h-7 w-7" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{habit.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-orange-500 flex items-center gap-1"><Flame className="h-3 w-3 fill-orange-500" />{habit.streak} {language === "ru" ? "дней" : "days"}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{language === "ru" ? "Ежедневно" : "Daily"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl">
                    <DropdownMenuItem onClick={() => setEditingHabit(habit)}><Edit2 className="h-4 w-4 mr-2" /> {t("edit_btn")}</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteHabit(habit.id)}><Trash2 className="h-4 w-4 mr-2" /> {t("delete_btn")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant={habit.completedToday ? "secondary" : "default"} className="rounded-2xl h-12 px-6 font-bold" onClick={() => toggleHabit(habit)}>
                  {habit.completedToday ? t("completed") : (language === "ru" ? "Выполнить" : "Complete")}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card onClick={() => setIsLearnMoreOpen(true)} className="p-6 bg-gradient-primary text-primary-foreground rounded-[32px] shadow-glow cursor-pointer hover:scale-[1.01] transition-all">
        <h2 className="text-xl font-bold font-serif italic">{randomMotivation.title}</h2>
        <p className="text-white/80 text-sm mt-1">{randomMotivation.description}</p>
      </Card>

      <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <DialogContent className="bg-card border-border/60 rounded-[32px]">
          <DialogHeader><DialogTitle className="text-xl font-serif italic">{randomMotivation.title}</DialogTitle></DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm leading-relaxed">{randomMotivation.details}</p>
            <Button className="w-full bg-gradient-primary h-12 rounded-2xl font-bold" onClick={() => setIsLearnMoreOpen(false)}>{language === "ru" ? "Понятно" : "Got it"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
