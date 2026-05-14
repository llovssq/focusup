import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "success" | "warning" | "accent";
  onClick?: () => void;
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  accent: "bg-accent/10 text-accent",
};

export function StatCard({ title, value, change, icon: Icon, accent = "primary", onClick }: Props) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "p-4 sm:p-5 bg-card border-border/60 shadow-card hover:shadow-elegant transition-all h-full flex flex-col justify-between",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-muted-foreground truncate leading-tight font-medium">{title}</p>
          <p className="text-2xl sm:text-2xl font-bold mt-2 sm:mt-1 tracking-tight truncate">{value}</p>
        </div>
        <div className={cn("h-10 w-10 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0", accentMap[accent])}>
          <Icon className="h-5 w-5 sm:h-5 sm:w-5" />
        </div>
      </div>
      {change && (
        <p className="text-[11px] sm:text-xs text-success mt-2 sm:mt-1 truncate leading-tight font-medium bg-success/5 px-2 py-0.5 rounded-full w-fit">
          {change}
        </p>
      )}
    </Card>
  );
}
