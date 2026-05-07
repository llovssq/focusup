import { 
  User, 
  Settings, 
  Bell, 
  Globe, 
  HelpCircle, 
  LogOut, 
  Trash2, 
  Sun, 
  Moon,
  Menu,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";
import { useLanguage } from "./language-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function UserMenu() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/40 border border-border/40 hover:bg-muted/60 transition-all shadow-sm">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2 rounded-2xl bg-card border-border/60 shadow-elegant" align="end">
        <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground px-3 py-2 uppercase tracking-wider">
          {t("account")}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer">
            <User className="h-4 w-4 text-primary" />
            <span>{t("profile")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer">
            <Settings className="h-4 w-4 text-primary" />
            <span>{t("settings")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-border/40 mx-1" />
        
        <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground px-3 py-2 uppercase tracking-wider">
          {t("preferences")}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <>
                <Moon className="h-4 w-4 text-primary" />
                <span>{t("dark_mode")}</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-primary" />
                <span>{t("light_mode")}</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer">
              <Globe className="h-4 w-4 text-primary" />
              <span>{t("language")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="rounded-xl bg-card border-border/60 shadow-elegant p-1 min-w-[120px]">
                <DropdownMenuItem 
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer",
                    language === "ru" && "bg-primary/10 text-primary font-bold"
                  )}
                  onClick={() => {
                    setLanguage("ru");
                    toast.success("Язык изменен на Русский");
                  }}
                >
                  <span>Русский</span>
                  {language === "ru" && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer",
                    language === "en" && "bg-primary/10 text-primary font-bold"
                  )}
                  onClick={() => {
                    setLanguage("en");
                    toast.success("Language changed to English");
                  }}
                >
                  <span>English</span>
                  {language === "en" && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-border/40 mx-1" />
        
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>{t("support")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-border/40 mx-1" />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => toast.success(t("logout"))}
        >
          <LogOut className="h-4 w-4" />
          <span>{t("logout")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => toast.error(language === "ru" ? "Аккаунт будет удален через 30 дней" : "Account will be deleted in 30 days")}
        >
          <Trash2 className="h-4 w-4" />
          <span>{t("delete_account")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
