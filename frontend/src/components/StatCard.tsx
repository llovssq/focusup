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
        "p-5 bg-card border-border/60 shadow-card hover:shadow-elegant transition-all h-full",
        onClick && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
          {change && <p className="text-xs text-success mt-1">{change}</p>}
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
