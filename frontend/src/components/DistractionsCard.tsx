import { Card } from "@/components/ui/card";
import { AlertCircle, Plus, Trash2, Check, X } from "lucide-react";
import { useFocusStore } from "@/hooks/use-focus-store";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

export function DistractionsCard() {
  const { distractions, addDistraction, deleteDistraction, updateDistraction } = useFocusStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMinutes, setNewMinutes] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState("");

  const totalMinutes = distractions.reduce((acc, d) => acc + d.minutes, 0);
  const maxMinutes = Math.max(...distractions.map(d => d.minutes), 60);

  const handleAdd = () => {
    if (!newName || !newMinutes) return;
    const mins = parseInt(newMinutes);
    if (isNaN(mins)) return;

    addDistraction({
      id: Math.random().toString(36).substring(2, 11),
      name: newName,
      minutes: mins,
      color: `oklch(${0.6 + Math.random() * 0.2} ${0.15 + Math.random() * 0.1} ${Math.random() * 360})`,
    });
    setNewName("");
    setNewMinutes("");
    setIsAdding(false);
    toast.success("Отвлечение добавлено");
  };

  const saveEdit = (id: string) => {
    const mins = parseInt(editMinutes);
    if (isNaN(mins)) return;
    
    const d = distractions.find(d => d.id === id);
    if (d) {
      updateDistraction({ ...d, minutes: mins });
    }
    setEditingId(null);
  };

  return (
    <Card className="p-5 bg-card border-border/60 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Главные отвлечения</h3>
            <p className="text-xs text-muted-foreground">Сегодня • {totalMinutes} минут потрачено</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full" 
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {isAdding && (
        <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
          <Input 
            placeholder="Название" 
            className="h-8 text-xs" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
          />
          <Input 
            placeholder="Мин" 
            type="number" 
            className="h-8 text-xs w-20" 
            value={newMinutes} 
            onChange={(e) => setNewMinutes(e.target.value)} 
          />
          <Button size="sm" className="h-8 px-2" onClick={handleAdd}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {distractions.map((d) => {
          const isEditing = editingId === d.id;
          const percent = (d.minutes / maxMinutes) * 100;

          return (
            <div key={d.id} className="group relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{d.name}</span>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Input 
                      type="number" 
                      autoFocus
                      className="h-6 w-16 text-xs px-1" 
                      value={editMinutes} 
                      onChange={(e) => setEditMinutes(e.target.value)}
                      onBlur={() => saveEdit(d.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(d.id)}
                    />
                  ) : (
                    <span 
                      className="text-xs text-muted-foreground cursor-pointer hover:text-primary"
                      onClick={() => {
                        setEditingId(d.id);
                        setEditMinutes(d.minutes.toString());
                      }}
                    >
                      {d.minutes} мин
                    </span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => deleteDistraction(d.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, background: d.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
