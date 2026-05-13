import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { useFocusStore } from "@/hooks/use-focus-store";
import { Check, Clock, Target, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./language-provider";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  description 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onConfirm: () => void;
  title?: string;
  description?: string;
}) {
  const { t, language } = useLanguage();
  const defaultTitle = language === "ru" ? "Вы уверены?" : "Are you sure?";
  const defaultDesc = language === "ru" ? "Это действие нельзя отменить." : "This action cannot be undone.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-[320px] rounded-[32px] p-8 text-center">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 className="h-8 w-8" />
        </div>
        <DialogHeader className="p-0">
          <DialogTitle className="text-xl font-bold text-center">{title || defaultTitle}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
            {description || defaultDesc}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-8">
          <Button variant="destructive" className="rounded-2xl h-11 font-bold" onClick={() => { onConfirm(); onOpenChange(false); }}>
            {t("delete_btn")}
          </Button>
          <Button variant="ghost" className="rounded-2xl h-11 font-medium" onClick={() => onOpenChange(false)}>
            {t("cancel_btn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TasksCompletedModal({ open, onOpenChange }: ModalProps) {
  const { goals } = useFocusStore();
  const { t, language } = useLanguage();
  const completedTasks = goals.filter(g => g.progress === 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-md rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            {t("tasks_completed")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {completedTasks.length > 0 ? (
            completedTasks.map(task => (
              <div key={task.id} className="p-4 bg-muted/30 rounded-2xl border border-border/40 flex items-center gap-3">
                <Check className="h-4 w-4 text-success" />
                <div className="font-medium truncate">{task.title}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ru" ? "Вы пока не выполнили ни одной задачи." : "You haven't completed any tasks yet."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FocusHoursModal({ open, onOpenChange }: ModalProps) {
  const { sessions, deleteSession } = useFocusStore();
  const { t, language } = useLanguage();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  
  const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
  const h = Math.floor(totalFocusSeconds / 3600);
  const m = Math.floor((totalFocusSeconds % 3600) / 60);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-md rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-accent" />
            {t("focus_hours")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center p-8 bg-accent/5 rounded-[32px] border border-accent/10">
            <div className="text-5xl font-bold text-accent tracking-tight">{h}{t("hour")} {m}{t("min")}</div>
            <div className="text-sm font-medium text-muted-foreground mt-2">{t("total")}</div>
          </div>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
            {sessions.length > 0 ? (
              sessions.slice().reverse().map(session => (
                <div key={session.id} className="p-4 bg-muted/30 rounded-2xl border border-border/40 flex items-center justify-between group">
                  <div className="text-sm font-medium">
                    {new Date(session.startTime).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US")}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold">{Math.floor(session.duration/60)} {t("min")}</div>
                    <button onClick={() => setDeleteTarget(session.id)} className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {language === "ru" ? "История пуста." : "History is empty."}
              </div>
            )}
          </div>
        </div>
        <DeleteConfirmModal 
          open={!!deleteTarget} 
          onOpenChange={(open) => !open && setDeleteTarget(null)} 
          onConfirm={() => deleteTarget && deleteSession(deleteTarget)}
          title={language === "ru" ? "Удалить сессию?" : "Delete session?"}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ConcentrationModal({ open, onOpenChange }: ModalProps) {
  const { t, language } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/60 max-w-md rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-success" />
            {t("concentration_level")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="p-6 bg-success/5 rounded-3xl border border-success/10 text-center">
            <div className="text-5xl font-bold text-success">87%</div>
            <div className="text-sm text-muted-foreground mt-2">{t("vs_average")}</div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{t("ai_plan")}:</h4>
            <p className="text-sm text-muted-foreground">
              {language === "ru" 
                ? "Ваша продуктивность наиболее высока в первой половине дня. Планируйте сложные задачи на утро." 
                : "Your productivity is highest in the first half of the day. Plan complex tasks for the morning."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
