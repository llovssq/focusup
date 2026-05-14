import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LayoutDashboard, ListTodo, Activity, Bot, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "./language-provider";
import { translations } from "@/lib/translations";
import { useFocusStore } from "@/hooks/use-focus-store";

const mainItems: { titleKey: keyof typeof translations.ru, url: string, icon: any }[] = [
  { titleKey: "dashboard", url: "/dashboard", icon: LayoutDashboard },
  { titleKey: "tasks", url: "/tasks", icon: ListTodo },
  { titleKey: "habits", url: "/habits", icon: Activity },
  { titleKey: "coach", url: "/coach", icon: Bot },
  { titleKey: "stats", url: "/stats", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { t, language } = useLanguage();
  const { user } = useFocusStore();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => currentPath === path;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Don't render until mounted to avoid hydration mismatch
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          {!collapsed ? (
            <div className="flex items-center">
              <img src="/logo.png" alt="Vela logo" className="h-14 w-14 object-contain -ml-2 logo-main" />
              <div className="flex flex-col -ml-1">
                <span className="font-semibold tracking-tight text-xl text-primary uppercase leading-none">Vela</span>
                <span className="text-[10px] text-muted-foreground leading-tight mt-1">Stop scrolling. Start becoming.</span>
              </div>
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center">
              <img src="/logo.png" alt="Vela logo" className="h-11 w-11 object-contain logo-main" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{language === "ru" ? "Рабочее пространство" : "Workspace"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div 
          onClick={() => navigate({ to: "/profile" })}
          className={`flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-sidebar-accent group cursor-pointer ${isActive('/profile') ? 'bg-sidebar-accent' : ''}`}
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground group-hover:scale-105 transition-transform">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.plan} {language === "ru" ? "план" : "Plan"}</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
