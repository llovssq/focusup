import { Bot, Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CoachWidget() {
  return (
    <Card className="relative overflow-hidden p-5 bg-gradient-subtle border-border/60 shadow-card">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-glow opacity-50 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-1">
              AI-коуч <Sparkles className="h-3 w-3 text-accent" />
            </h3>
            <p className="text-xs text-muted-foreground">Онлайн • помогает фокусироваться</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 mb-3 border border-border/40">
          <p className="text-sm leading-relaxed">
            👋 Привет, Анна! Я заметил, что ты чаще всего отвлекаешься между{" "}
            <span className="text-primary font-medium">14:00 и 16:00</span>. Давай сегодня
            попробуем сделать сложные задачи <span className="text-accent font-medium">утром</span>,
            а рутину — после обеда. Готова начать с матана?
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          <Button size="sm" variant="outline" className="text-xs h-8">Давай начнём 🚀</Button>
          <Button size="sm" variant="outline" className="text-xs h-8">Позже</Button>
          <Button size="sm" variant="outline" className="text-xs h-8">Показать план</Button>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Спросить у коуча..." className="bg-background/50" />
          <Button size="icon" className="bg-gradient-primary shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
