import { useState } from "react";
import { useFocusStore } from "@/hooks/use-focus-store";
import { Check, Sparkles, Clock, Edit2, Trash2, X, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  parent?: string;
  duration: string;
  aiSuggested?: boolean;
  done?: boolean;
}

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

const initialTasks: Task[] = [
  { id: "1", title: "Отобрать 100 частотных слов", parent: "Выучить 100 слов", duration: "10 мин" },
  { id: "2", title: "Создать карточки для запоминания", parent: "Выучить 100 слов", duration: "15 мин" },
  { id: "3", title: "Изучить первые 25 слов (Существительные)", parent: "Выучить 100 слов", duration: "20 мин", aiSuggested: true },
  { id: "4", title: "Закрепить 25 слов через ассоциации", parent: "Выучить 100 слов", duration: "15 мин", aiSuggested: true },
  { id: "5", title: "Повторить вчерашний материал", parent: "Выучить 100 слов", duration: "5 мин", done: true },
  { id: "6", title: "Выучить 25 глаголов", parent: "Выучить 100 слов", duration: "25 мин", aiSuggested: true },
];

export function TaskList() {
  const { completeDay } = useFocusStore();
  const [tasks, setTasks] = useState(initialTasks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDurationValue, setEditDurationValue] = useState("");
  const [editDurationUnit, setEditDurationUnit] = useState("мин");

  const toggle = (id: string) => {
    setTasks((t) => t.map((x) => {
      if (x.id === id) {
        const isNowDone = !x.done;
        if (isNowDone) completeDay();
        return { ...x, done: isNowDone };
      }
      return x;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.title);
    const parts = task.duration.split(" ");
    setEditDurationValue(parts[0] || "");
    setEditDurationUnit(parts[1] || "мин");
  };

  const saveEdit = () => {
    const finalDuration = `${editDurationValue} ${editDurationUnit}`;
    setTasks(prev => prev.map(t => t.id === editingId ? { ...t, title: editValue, duration: finalDuration } : t));
    setEditingId(null);
  };

  return (
    <Card className="p-5 bg-card border-border/60 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Задачи на сегодня</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span>{tasks.filter((t) => t.done).length} из {tasks.length} выполнено</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatMinutes(tasks.reduce((acc, t) => acc + parseDurationToMinutes(t.duration), 0))}
            </span>
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI-план
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors group/item",
              task.done && "opacity-60"
            )}
          >
            <Checkbox
              checked={task.done}
              onCheckedChange={() => toggle(task.id)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              {task.parent && (
                <div className="text-xs text-muted-foreground mb-0.5">{task.parent}</div>
              )}
              {editingId === task.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <input 
                      className="flex-1 bg-background border border-primary/20 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:border-primary font-medium"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      autoFocus
                    />
                    <button onClick={saveEdit} className="text-success hover:scale-110 transition-transform">
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
                        className="w-12 px-1.5 py-0.5 text-xs focus:outline-none bg-transparent"
                        value={editDurationValue}
                        placeholder="0"
                        onChange={(e) => setEditDurationValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      />
                      <select 
                        className="bg-muted/50 border-l border-primary/10 text-[10px] px-1 h-full focus:outline-none cursor-pointer font-medium"
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
                        onClick={() => deleteTask(task.id)}
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
        ))}
      </div>
    </Card>
  );
}
