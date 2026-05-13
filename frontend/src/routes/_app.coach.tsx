import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { chatWithGemini } from "@/lib/gemini";
import { Bot, Send, Sparkles, User, Maximize2, Minimize2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/components/language-provider";

export const Route = createFileRoute("/_app/coach")({
  component: CoachPage,
});

interface Msg { role: "user" | "ai"; content: string }

function CoachPage() {
  const { t, language } = useLanguage();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs([
      { role: "ai", content: language === "ru" ? "Привет! 👋 Я твой коуч. Я здесь, чтобы помочь тебе с продуктивностью и фокусом. О чем хочешь поговорить?" : "Hello! 👋 I'm your coach. I'm here to help you with productivity and focus. What's on your mind?" }
    ]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = msgs.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));
      const response = await chatWithGemini(userMsg, history);
      setMsgs((m) => [...m, { role: "ai", content: response }]);
    } catch (error) {
      setMsgs((m) => [...m, { role: "ai", content: language === "ru" ? "Ошибка подключения к ИИ." : "Error connecting to AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          {t("coach_title")} <Sparkles className="h-6 w-6 text-accent" />
        </h1>
        <p className="text-muted-foreground mt-1">{t("coach_subtitle")}</p>
      </div>

      <Card className={cn("flex-1 flex flex-col bg-card border-border/60 shadow-card overflow-hidden", isExpanded && "fixed inset-0 z-40 rounded-none")}>
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold">Vela Coach</div>
              <div className="text-xs text-success flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" /> {language === "ru" ? "Онлайн" : "Online"}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4" ref={scrollRef}>
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", m.role === "ai" ? "bg-gradient-primary" : "bg-muted")}>
                {m.role === "ai" ? <Bot className="h-4 w-4 text-primary-foreground" /> : <User className="h-4 w-4" />}
              </div>
              <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm", m.role === "ai" ? "bg-muted/40 border" : "bg-gradient-primary text-primary-foreground shadow-elegant")}>
                {m.role === "ai" ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown> : <div className="whitespace-pre-wrap">{m.content}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border/40 flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={loading ? (language === "ru" ? "ИИ думает..." : "AI thinking...") : t("type_message")} disabled={loading} />
          <Button onClick={send} className="bg-gradient-primary" disabled={loading}>
            {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
