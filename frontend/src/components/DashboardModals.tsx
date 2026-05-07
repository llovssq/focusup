import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { useFocusStore } from "@/hooks/use-focus-store";
import { Check, Clock, Target, TrendingUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const formatMinutes = (totalMinutes: number): string => {
  if (totalMinutes === 0) return "0 мин";
  if (totalMinutes < 60) return `${Math.round(totalMinutes)} мин`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return minutes > 0 ? `${hours}ч ${minutes}мин` : `${hours}ч`;
};

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title = "Вы уверены?", 
  description = "Это действие нельзя отменить." 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onConfirm: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-[320px] rounded-[32px] p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="h-8 w-8" />
        </div>
        <DialogHeader className="p-0">
          <DialogTitle className="text-xl font-bold text-center">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-8">
          <Button 
            variant="destructive" 
            className="rounded-2xl h-11 font-bold shadow-elegant text-sm bg-destructive hover:bg-destructive/90" 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Удалить запись
          </Button>
          <Button 
            variant="ghost" 
            className="rounded-2xl h-11 font-medium text-sm hover:bg-muted/50" 
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TasksCompletedModal({ open, onOpenChange }: ModalProps) {
  const { goals } = useFocusStore();
  const completedTasks = goals.filter(g => g.completed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-md rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Выполненные задачи
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {completedTasks.length > 0 ? (
            completedTasks.map(task => (
              <div key={task.id} className="p-4 bg-muted/30 rounded-2xl border border-border/40 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-success/10 text-success flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{task.title}</div>
                  <div className="text-xs text-muted-foreground">{task.category}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Вы пока не выполнили ни одной задачи. Самое время начать!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FocusHoursModal({ open, onOpenChange }: ModalProps) {
  const { sessions, deleteSession } = useFocusStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration / 60, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-md rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-accent" />
            Время в фокусе
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center p-8 bg-accent/5 rounded-[32px] border border-accent/10 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5">
              <Clock className="h-24 w-24 text-accent" />
            </div>
            <div className="text-5xl font-bold text-accent tracking-tight">{formatMinutes(totalMinutes)}</div>
            <div className="text-sm font-medium text-muted-foreground mt-2">Всего за все время</div>
          </div>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {sessions.length > 0 ? (
              sessions.slice().reverse().map(session => (
                <div key={session.id} className="p-4 bg-muted/30 rounded-2xl border border-border/40 flex items-center justify-between group hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-medium">
                      {new Date(session.startTime).toLocaleDateString("ru-RU", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-foreground">
                      {formatMinutes(session.duration / 60)}
                    </div>
                    <button 
                      onClick={() => setDeleteTarget(session.id)}
                      className="p-2 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                История сессий пока пуста.
              </div>
            )}
          </div>
        </div>
        <DeleteConfirmModal 
          open={!!deleteTarget} 
          onOpenChange={(open) => !open && setDeleteTarget(null)} 
          onConfirm={() => deleteTarget && deleteSession(deleteTarget)}
          title="Удалить сессию?"
          description="Эта запись исчезнет из статистики времени в фокусе."
        />
      </DialogContent>
    </Dialog>
  );
}

export function ConcentrationModal({ open, onOpenChange }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-md rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-success" />
            Концентрация
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="p-6 bg-success/5 rounded-3xl border border-success/10 text-center">
            <div className="text-5xl font-bold text-success">87%</div>
            <div className="text-sm text-muted-foreground mt-2">Средний показатель за неделю</div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Анализ ИИ:</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ваша продуктивность наиболее высока в промежутке с 10:00 до 13:00. 
              Меньше всего отвлечений зафиксировано при работе над категорий "Учеба". 
              Рекомендуем планировать сложные задачи на утро.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
