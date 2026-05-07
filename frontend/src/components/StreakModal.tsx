import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFocusStore } from "@/hooks/use-focus-store";
import { Snowflake, Check, Plus, Edit2 } from "lucide-react";
import { FireIcon } from "./FireIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StreakModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StreakModal({ open, onOpenChange }: StreakModalProps) {
  const { streak, useFreeze, addFreeze, updateStreak } = useFocusStore();
  const [isEditingCount, setIsEditingCount] = useState(false);
  const [tempCount, setTempCount] = useState(streak.count.toString());

  const isLost = () => {
    if (!streak.lastUpdate) return false;
    const last = new Date(streak.lastUpdate);
    const now = new Date();
    const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
    return diff > 48; // Lost if not updated for more than 48 hours
  };

  const streakIsLost = isLost();

  const handleUseFreeze = () => {
    if (useFreeze()) {
      toast.success(streakIsLost ? "Стрик успешно восстановлен!" : "Заморозка активирована! Стрик сохранен.");
    } else {
      toast.error("Нет доступных заморозок!");
    }
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Adjust for Monday start (0 is Monday, 6 is Sunday)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(currentYear, currentMonth, i + 1);
    const dateStr = d.toISOString().split('T')[0];
    return {
      day: i + 1,
      date: dateStr,
      completed: streak.completedDays.includes(dateStr)
    };
  });

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-[340px] rounded-[32px] p-5">
        <DialogHeader className="text-center">
          <div className={cn(
            "mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            streakIsLost ? "bg-muted text-muted-foreground" : "bg-orange-100 dark:bg-orange-950/30 text-orange-600"
          )}>
            <FireIcon className={cn("h-7 w-7", streakIsLost && "opacity-40 grayscale")} />
          </div>
          <DialogTitle className="text-xl font-serif font-bold text-center leading-none flex items-center justify-center gap-2">
            {streakIsLost ? (
              "Стрик погас"
            ) : (
              <>
                {isEditingCount ? (
                  <input 
                    type="number"
                    className="w-16 bg-muted/50 border border-primary/30 rounded px-1 text-center focus:outline-none"
                    value={tempCount}
                    autoFocus
                    onChange={(e) => setTempCount(e.target.value)}
                    onBlur={() => {
                      updateStreak({ count: parseInt(tempCount) || 0 });
                      setIsEditingCount(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateStreak({ count: parseInt(tempCount) || 0 });
                        setIsEditingCount(false);
                      }
                    }}
                  />
                ) : (
                  <span onClick={() => {
                    setTempCount(streak.count.toString());
                    setIsEditingCount(true);
                  }} className="cursor-pointer hover:text-primary transition-colors">
                    {streak.count}
                  </span>
                )}
                <span>дн. серия!</span>
                {!isEditingCount && <Edit2 className="h-3 w-3 opacity-30 cursor-pointer" onClick={() => {
                  setTempCount(streak.count.toString());
                  setIsEditingCount(true);
                }} />}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-[13px] text-muted-foreground mt-1 leading-snug">
            {streakIsLost 
              ? "Ой! Вы пропустили дни. Используйте заморозку, чтобы восстановить серию."
              : "Продолжай в том же духе. Ты молодец!"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map(d => (
              <div key={d} className="text-[9px] text-center text-muted-foreground font-bold">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((d) => (
              <div
                key={d.day}
                className={cn(
                  "aspect-square flex items-center justify-center text-[10px] rounded-md border transition-all",
                  d.completed
                    ? "bg-gradient-primary border-transparent text-primary-foreground font-bold shadow-sm"
                    : "border-border/40 text-muted-foreground hover:bg-muted/30"
                )}
              >
                {d.completed ? <Check className="h-2.5 w-2.5" /> : d.day}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Snowflake className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="text-xs font-bold">Заморозки</div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addFreeze();
                      toast.success("Заморозка добавлена!");
                    }}
                    className="h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-[10px] text-muted-foreground leading-none">{streak.freezes} осталось</div>
              </div>
            </div>
            <Button 
              size="sm" 
              variant={streakIsLost ? "default" : "outline"} 
              className={cn(
                "rounded-full h-7 text-[10px] px-3 transition-all",
                streakIsLost 
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" 
                  : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border-blue-200 dark:border-blue-800"
              )}
              onClick={handleUseFreeze}
              disabled={streak.freezes === 0 || !streakIsLost}
            >
              {streakIsLost ? "Восстановить" : "Заморожено"}
            </Button>
          </div>

          <Button 
            className="w-full bg-gradient-primary h-10 rounded-xl font-bold shadow-elegant text-sm"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
