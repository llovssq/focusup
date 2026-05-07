import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { chatWithGemini } from "@/lib/gemini";
import { Bot, Send, Sparkles, User, Maximize2, Minimize2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_app/coach")({
  component: CoachPage,
});

interface Msg { role: "user" | "ai"; content: string }

const initialMsgs: Msg[] = [
  { role: "ai", content: "Привет! 👋 Я твой AI-коуч. Я здесь, чтобы помочь тебе с продуктивностью и фокусом. О чем хочешь поговорить?" },
];

function CoachPage() {
  const [msgs, setMsgs] = useState(initialMsgs);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Преобразуем историю сообщений для Gemini
      const history = msgs.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const response = await chatWithGemini(userMsg, history);
      
      setMsgs((m) => [
        ...m,
        { role: "ai", content: response },
      ]);
    } catch (error) {
      setMsgs((m) => [
        ...m,
        { role: "ai", content: "Извини, произошла ошибка при подключении к ИИ. Проверь свой API ключ в .env" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            AI-коуч <Sparkles className="h-6 w-6 text-accent" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Персональный наставник, который помогает сохранять фокус и достигать целей
          </p>
        </div>
      </div>

      <Card 
        className={`flex-1 flex flex-col bg-card border-border/60 shadow-card overflow-hidden transition-all duration-300 ${
          isExpanded 
            ? "fixed top-0 right-0 bottom-0 left-[var(--sidebar-width)] z-40 rounded-none border-l border-y-0 border-r-0" 
            : ""
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40 bg-gradient-subtle">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold">FocusAI Coach</div>
              <div className="text-xs text-success flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" /> Онлайн
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleExpanded}
            className="hover:bg-muted/50 rounded-full"
            title={isExpanded ? "Свернуть" : "Развернуть на всю область"}
          >
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4" ref={scrollRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                m.role === "ai" ? "bg-gradient-primary" : "bg-muted"
              }`}>
                {m.role === "ai" ? <Bot className="h-4 w-4 text-primary-foreground" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "ai"
                  ? "bg-muted/40 border border-border/40"
                  : "bg-gradient-primary text-primary-foreground shadow-elegant"
              }`}>
                {m.role === "ai" ? (
                  <div className="prose prose-sm prose-invert max-w-none break-words
                      prose-p:leading-relaxed prose-p:my-1
                      prose-ul:my-1 prose-li:my-0
                      prose-strong:text-primary-foreground/90 prose-strong:font-bold
                      prose-code:bg-muted/50 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center animate-pulse">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted/40 border border-border/40 rounded-2xl px-4 py-2.5 flex gap-1 items-center">
                <span className="w-1 h-1 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 bg-foreground/50 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/40 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={loading ? "ИИ думает..." : "Напиши своему коучу..."}
            className="bg-muted/40"
            disabled={loading}
          />
          <Button onClick={send} className="bg-gradient-primary shadow-elegant" disabled={loading}>
            {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
