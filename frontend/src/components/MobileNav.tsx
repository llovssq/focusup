import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ListTodo, Activity, Bot, BarChart3, User } from "lucide-react";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";

const navItems: { titleKey: keyof typeof translations.ru, url: string, icon: any }[] = [
  { titleKey: "dashboard", url: "/dashboard", icon: LayoutDashboard },
  { titleKey: "tasks", url: "/tasks", icon: ListTodo },
  { titleKey: "habits", url: "/habits", icon: Activity },
  { titleKey: "coach", url: "/coach", icon: Bot },
  { titleKey: "stats", url: "/stats", icon: BarChart3 },
  { titleKey: "profile", url: "/profile", icon: User },
];

export function MobileNav() {
  const { t } = useLanguage();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => currentPath === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/60 pb-safe">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
              isActive(item.url) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className={`h-5 w-5 transition-transform ${isActive(item.url) ? "scale-110" : ""}`} />
            <span className="text-[10px] font-medium leading-none">{t(item.titleKey)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
