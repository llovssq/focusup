import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useFocusStore } from "@/hooks/use-focus-store";
import { chatWithGemini } from "@/lib/gemini";
import { toast } from "sonner";
import { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "./language-provider";

export function AddGoalDialog({ children }: { children?: React.ReactNode }) {
  const { addGoal } = useFocusStore();
  const { t, language } = useLanguage();
  const [newGoal, setNewGoal] = useState("");
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const breakdownWithAI = async () => {
    if (!newGoal.trim() || isBreakingDown) return;

    setIsBreakingDown(true);
    const toastId = toast.loading(language === "ru" ? "AI анализирует цель..." : "AI analyzing goal...");

    try {
      const prompt = language === "ru" 
        ? `Разбей следующую большую цель на 4-6 конкретных подзадач. Цель: "${newGoal}". Верни ответ СТРОГО в формате JSON массива объектов: [{"title": "...", "duration": "30 мин"}]`
        : `Break down this goal into 4-6 specific subtasks. Goal: "${newGoal}". Return ONLY JSON array of objects: [{"title": "...", "duration": "30 min"}]`;

      const response = await chatWithGemini(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid AI response");
      
      const subtasksData = JSON.parse(jsonMatch[0]);
      
      const newGoalObj: Goal = {
        id: Math.random().toString(36).substring(2, 11),
        title: newGoal,
        progress: 0,
        createdAt: new Date().toISOString(),
        category: language === "ru" ? "Общее" : "General",
        deadline: language === "ru" ? "Скоро" : "Soon",
        subtasks: subtasksData.map((s: any) => ({
          id: Math.random().toString(36).substring(2, 11),
          title: s.title,
          duration: s.duration,
          done: false,
        })),
      };

      addGoal(newGoalObj);
      setNewGoal("");
      setIsDialogOpen(false);
      toast.success(language === "ru" ? "Цель создана!" : "Goal created!", { id: toastId });
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
      createdAt: new Date().toISOString(),
      category: language === "ru" ? "Общее" : "General",
      deadline: language === "ru" ? "Скоро" : "Soon",
      subtasks: [],
    };

    addGoal(newGoalObj);
    setNewGoal("");
    setIsDialogOpen(false);
    toast.success(language === "ru" ? "Создано!" : "Created!");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-primary shadow-elegant">
            <Plus className="h-4 w-4 mr-1" /> {t("new_goal")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader>
          <DialogTitle>{t("create_new_task")}</DialogTitle>
          <DialogDescription>
            {language === "ru" ? "Опишите вашу задачу" : "Describe your task"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40">
            <Sparkles className={cn("h-5 w-5 text-accent shrink-0", isBreakingDown && "animate-spin")} />
            <Input 
              placeholder={t("task_description_placeholder")} 
              className="bg-background/50" 
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              disabled={isBreakingDown}
              onKeyDown={(e) => e.key === "Enter" && (isBreakingDown ? null : breakdownWithAI())}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="border-border/60 rounded-xl h-11" onClick={createManually} disabled={isBreakingDown || !newGoal.trim()}>
              {t("split_manually")}
            </Button>
            <Button className="bg-gradient-primary rounded-xl h-11" onClick={breakdownWithAI} disabled={isBreakingDown || !newGoal.trim()}>
              {isBreakingDown ? "..." : t("split_with_ai")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
