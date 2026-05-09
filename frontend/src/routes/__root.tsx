import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Упс! Страница не найдена</h1>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Похоже, эта страница была удалена или переехала по новому адресу.
        </p>
        <Button 
          className="bg-gradient-primary rounded-xl px-6 h-11" 
          onClick={() => window.location.href = '/dashboard'}
        >
          Вернуться в дэшборд
        </Button>
      </div>
    );
  },
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vela-theme">
      <LanguageProvider>
        <Outlet />
        <Toaster position="top-center" expand={true} richColors />
        <Analytics />
        <SpeedInsights />
      </LanguageProvider>
    </ThemeProvider>
  );
}
