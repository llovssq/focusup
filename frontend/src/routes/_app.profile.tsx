import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { 
  User, 
  Mail, 
  Shield, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Award,
  Flame,
  Snowflake,
  Activity,
  Camera,
  Edit2,
  Check as CheckIcon,
  X as XIcon
} from "lucide-react";
import { useFocusStore } from "@/hooks/use-focus-store";
import { useLanguage } from "@/components/language-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, streak, habits, goals, setUser } = useFocusStore();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  useEffect(() => {
    setMounted(true);
    const getEmail = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email) {
        setEmail(data.session.user.email);
      }
    };
    getEmail();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(language === "ru" ? "Вы вышли из системы" : "Logged out successfully");
      navigate({ to: "/login" });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "ru" ? "en" : "ru");
    toast.success(language === "ru" ? "Language changed to English" : "Язык изменен на русский");
  };

  const handleSaveName = () => {
    if (!tempName.trim()) {
      toast.error(language === "ru" ? "Имя не может быть пустым" : "Name cannot be empty");
      return;
    }
    setUser({ ...user, name: tempName });
    setIsEditingName(false);
    toast.success(language === "ru" ? "Имя обновлено" : "Name updated");
  };

  const handleAvatarClick = () => {
    toast.info(language === "ru" ? "Смена аватарки будет доступна скоро!" : "Avatar change coming soon!");
  };

  if (!mounted) return null;

  const completedHabits = habits.length;
  const completedGoals = goals.filter(g => g.completed).length;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header / Hero */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-border/60">
        <div 
          onClick={handleAvatarClick}
          className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-gradient-primary flex items-center justify-center text-4xl sm:text-5xl font-bold text-primary-foreground shadow-glow shrink-0 cursor-pointer group"
        >
          {user.name.charAt(0)}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-background border border-border shadow-lg rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <Camera className="w-4 h-4 text-primary" />
          </div>
        </div>
        
        <div className="text-center md:text-left space-y-3 flex-1">
          {isEditingName ? (
            <div className="flex items-center justify-center md:justify-start gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                className="text-2xl sm:text-3xl font-bold bg-muted/50 border border-primary/30 rounded-xl px-3 py-1 outline-none focus:ring-2 ring-primary/20 w-full max-w-[250px]"
              />
              <button 
                onClick={handleSaveName}
                className="p-2 bg-success/20 text-success rounded-xl hover:bg-success/30 transition-colors"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setIsEditingName(false); setTempName(user.name); }}
                className="p-2 bg-destructive/20 text-destructive rounded-xl hover:bg-destructive/30 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center md:justify-start gap-3 group">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{user.name}</h1>
              <button 
                onClick={() => { setIsEditingName(true); setTempName(""); }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              <Award className="w-4 h-4 mr-1.5" />
              {user.plan} {language === "ru" ? "план" : "Plan"}
            </span>
            {email && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm border border-border/40">
                <Mail className="w-4 h-4 mr-1.5" />
                {email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem 
          icon={<Flame className="text-warning" />} 
          label={language === "ru" ? "Стрик" : "Streak"} 
          value={streak.count.toString()} 
        />
        <StatItem 
          icon={<Snowflake className="text-blue-400" />} 
          label={language === "ru" ? "Заморозки" : "Freezes"} 
          value={streak.freezes.toString()} 
        />
        <StatItem 
          icon={<Activity className="text-success" />} 
          label={language === "ru" ? "Привычки" : "Habits"} 
          value={completedHabits.toString()} 
        />
        <StatItem 
          icon={<ChevronRight className="text-primary" />} 
          label={language === "ru" ? "Задачи" : "Tasks"} 
          value={completedGoals.toString()} 
        />
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t("account")}
          </h2>
          <div className="space-y-2">
            <MenuButton 
              label={t("profile")} 
              icon={<User className="w-4 h-4" />} 
              onClick={() => {}} 
            />
            <MenuButton 
              label={language === "ru" ? "Безопасность" : "Security"} 
              icon={<Shield className="w-4 h-4" />} 
              onClick={() => {}} 
            />
          </div>
        </div>

        {/* App Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            {t("settings")}
          </h2>
          <div className="space-y-2">
            <MenuButton 
              label={t("language")} 
              value={language === "ru" ? "Русский" : "English"}
              icon={<Activity className="w-4 h-4" />} 
              onClick={toggleLanguage} 
            />
            <MenuButton 
              label={t("logout")} 
              icon={<LogOut className="w-4 h-4 text-destructive" />} 
              onClick={handleLogout}
              variant="destructive"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/40 flex flex-col items-center text-center space-y-1 hover:border-primary/20 transition-colors">
      <div className="p-2 rounded-xl bg-muted/50 mb-1">{icon}</div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
    </div>
  );
}

function MenuButton({ 
  label, 
  icon, 
  onClick, 
  value, 
  variant = "default" 
}: { 
  label: string, 
  icon: React.ReactNode, 
  onClick: () => void, 
  value?: string,
  variant?: "default" | "destructive"
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/20 hover:bg-muted/50 hover:border-primary/30 transition-all group`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-background border border-border/40 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className={`font-medium ${variant === "destructive" ? "text-destructive" : ""}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}
