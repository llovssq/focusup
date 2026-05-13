import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Settings, Music, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFocusStore } from "@/hooks/use-focus-store";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

const SOUND_OPTIONS = [
  { id: "bell", name: "Колокольчик", nameEn: "Bell", url: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" },
  { id: "chime", name: "Приятный звон", nameEn: "Pleasant chime", url: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" },
  { id: "digital", name: "Цифровой", nameEn: "Digital", url: "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3" },
  { id: "success", name: "Успех", nameEn: "Success", url: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3" },
];

export function FocusTimer() {
  const { addSession } = useFocusStore();
  const { t, language } = useLanguage();
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState(() => {
    return localStorage.getItem("focus-timer-sound") || SOUND_OPTIONS[0].url;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          addSession({
            id: Math.random().toString(36).substring(2, 11),
            startTime: new Date().toISOString(),
            duration: initialMinutes * 60,
          });
          
          // Sound and Notification
          const audio = new Audio(selectedSound);
          audio.play().catch(e => console.log("Audio play failed:", e));
          toast.success(language === "ru" ? "Фокус-сессия завершена! Время отдохнуть ☕" : "Focus session complete! Time to rest ☕", {
            duration: 5000,
          });

          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, addSession, initialMinutes, selectedSound, language]);

  const changeTime = (delta: number) => {
    if (running) return;
    const newMins = Math.max(1, Math.min(120, initialMinutes + delta));
    setInitialMinutes(newMins);
    setSeconds(newMins * 60);
  };

  const handleSoundChange = (url: string) => {
    setSelectedSound(url);
    localStorage.setItem("focus-timer-sound", url);
    const audio = new Audio(url);
    audio.play().catch(e => console.log("Audio preview failed:", e));
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const progress = 1 - seconds / (initialMinutes * 60);
  const circumference = 2 * Math.PI * 70;

  return (
    <Card className="relative overflow-hidden bg-card border-border/60 p-6 shadow-card h-full flex flex-col justify-between group">
      <div className="absolute inset-0 bg-gradient-glow opacity-60 pointer-events-none" />
      
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 hover:bg-background shadow-sm border border-border/40">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 rounded-2xl" align="end">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Music className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">{t("notifications")}</span>
              </div>
              <div className="space-y-1">
                {SOUND_OPTIONS.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundChange(sound.url)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-2 rounded-xl text-sm transition-colors",
                      selectedSound === sound.url 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {language === "ru" ? sound.name : sound.nameEn}
                    {selectedSound === sound.url && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative flex flex-col items-center h-full">
        <div className="flex items-center justify-between w-full mb-4">
          <div>
            <h3 className="font-semibold">{t("focus_session")}</h3>
            <p className="text-xs text-muted-foreground">
              {running ? t("session_active") : t("set_time_and_start")}
            </p>
          </div>
        </div>

        <div className="relative my-2">
          <svg width="180" height="180" className="-rotate-90">
            <circle cx="90" cy="90" r="70" stroke="hsl(var(--muted))" strokeOpacity="0.2" strokeWidth="8" fill="none" />
            <circle
              cx="90"
              cy="90"
              r="70"
              stroke="url(#grad-timer)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
            <defs>
              <linearGradient id="grad-timer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.68 0.21 295)" />
                <stop offset="100%" stopColor="oklch(0.72 0.18 200)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {!running && (
              <button 
                onClick={() => changeTime(1)}
                className="p-1 text-muted-foreground hover:text-primary transition-colors animate-in fade-in slide-in-from-bottom-1"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            )}
            <span className="text-4xl font-bold tabular-nums tracking-tight leading-none">{mm}:{ss}</span>
            {!running && (
              <button 
                onClick={() => changeTime(-1)}
                className="p-1 text-muted-foreground hover:text-primary transition-colors animate-in fade-in slide-in-from-top-1"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            )}
            <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-medium">{t("remaining")}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => setRunning((r) => !r)}
            className="bg-gradient-primary hover:opacity-90 shadow-elegant min-w-[100px]"
          >
            {running ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {running ? t("pause") : t("start")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setRunning(false);
              setSeconds(initialMinutes * 60);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
