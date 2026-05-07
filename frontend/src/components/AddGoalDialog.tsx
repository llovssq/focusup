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

export function AddGoalDialog({ children }: { children?: React.ReactNode }) {
  const { addGoal } = useFocusStore();
  const [newGoal, setNewGoal] = useState("");
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const breakdownWithAI = async () => {
    if (!newGoal.trim() || isBreakingDown) return;

    setIsBreakingDown(true);
    const toastId = toast.loading("AI анализирует цель и разбивает её на этапы...");

    try {
      const prompt = `Разбей следующую большую цель на 4-6 конкретных подзадач с указанием примерного времени выполнения для каждой. 
      Цель: "${newGoal}"
      Верни ответ СТРОГО в формате JSON массива объектов, где каждый объект имеет поля: title (название задачи на русском) и duration (длительность, например "30 мин", "1 ч").
      Пример: [{"title": "Изучить основы", "duration": "45 мин"}]
      Не пиши ничего кроме JSON.`;

      const response = await chatWithGemini(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Не удалось распознать формат ответа ИИ");
      
      const subtasksData = JSON.parse(jsonMatch[0]);
      
      const newGoalObj: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        title: newGoal,
        progress: 0,
        createdAt: new Date().toISOString(),
        category: "Общее",
        deadline: "Скоро",
        subtasks: subtasksData.map((s: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: s.title,
          duration: s.duration,
          done: false,
        })),
      };

      addGoal(newGoalObj);
      setNewGoal("");
      setIsDialogOpen(false);
      toast.success("Цель успешно создана и разбита на этапы!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Не удалось создать цель. Попробуй ещё раз.", { id: toastId });
    } finally {
      setIsBreakingDown(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-primary shadow-elegant">
            <Plus className="h-4 w-4 mr-1" /> Новая цель
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader>
          <DialogTitle>Создать новую цель</DialogTitle>
          <DialogDescription>
            Опишите вашу цель, и наш AI помощник разобьет её на конкретные шаги.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40">
            <Sparkles className={cn("h-5 w-5 text-accent shrink-0", isBreakingDown && "animate-spin")} />
            <Input 
              placeholder="Например: Выучить React за 2 недели..." 
              className="bg-background/50" 
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              disabled={isBreakingDown}
              onKeyDown={(e) => e.key === "Enter" && breakdownWithAI()}
            />
          </div>
          <Button 
            className="w-full bg-gradient-primary" 
            onClick={breakdownWithAI}
            disabled={isBreakingDown || !newGoal.trim()}
          >
            {isBreakingDown ? "AI анализирует..." : "Разбить на этапы с AI"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
