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
        "p-3 sm:p-5 bg-card border-border/60 shadow-card hover:shadow-elegant transition-all h-full",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 tracking-tight truncate">{value}</p>
          {change && <p className="text-[10px] text-success mt-0.5 sm:mt-1 truncate">{change}</p>}
        </div>
        <div className={cn("h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0 ml-2", accentMap[accent])}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </Card>
  );
}
