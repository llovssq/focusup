import { useFocusStore } from "@/hooks/use-focus-store";
import { Card } from "./ui/card";
import { User } from "lucide-react";

export function UsersCard() {
  const { allUsers } = useFocusStore();

  if (allUsers.length === 0) return null;

  return (
    <Card className="p-4 bg-card border-border/60 shadow-elegant">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        Зарегистрированные пользователи
      </h3>
      <div className="space-y-3">
        {allUsers.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {u.first_name?.[0] || u.last_name?.[0] || "?"}
            </div>
            <div className="text-sm">
              <p className="font-medium">{u.first_name} {u.last_name}</p>
              <p className="text-xs text-muted-foreground">{u.plan || "Free"} Plan</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
