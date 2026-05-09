import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search } from "lucide-react";
import { FireIcon } from "@/components/FireIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { useState, useEffect } from "react";
import { useFocusStore } from "@/hooks/use-focus-store";
import { StreakModal } from "@/components/StreakModal";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const { streak } = useFocusStore();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate({ to: "/login" });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate({ to: "/login" });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border/60 flex items-center gap-3 px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1 max-w-md relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Найти задачу или цель..." className="pl-9 bg-muted/40 border-border/40" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button 
                onClick={() => setIsStreakOpen(true)}
                className="group flex items-center gap-2 h-9 px-3 rounded-full bg-muted/40 border border-border/40 hover:bg-muted/60 hover:border-border/60 transition-all mr-1 shadow-sm"
              >
                <FireIcon className="h-4 w-4 text-warning fill-warning/10 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold tabular-nums text-foreground/90">{streak.count}</span>
              </button>
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <StreakModal open={isStreakOpen} onOpenChange={setIsStreakOpen} />
    </SidebarProvider>
  );
}
