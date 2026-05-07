import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FocusAI — Дэшборд" },
      { name: "description", content: "AI-платформа для борьбы с прокрастинацией" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
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

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="focusup-theme">
      <LanguageProvider>
        <Outlet />
        <Analytics />
        <SpeedInsights />
      </LanguageProvider>
    </ThemeProvider>
  );
}
