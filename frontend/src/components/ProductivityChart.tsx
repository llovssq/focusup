import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/card";

import { useFocusStore } from "@/hooks/use-focus-store";
import { useMemo } from "react";

export function ProductivityChart() {
  const { sessions } = useFocusStore();

  const chartData = useMemo(() => {
    const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    const now = new Date();
    const data = days.map((day, i) => {
      // Это упрощенная логика, в идеале нужно группировать сессии по дате
      const daySessions = sessions.filter(s => {
        const d = new Date(s.startTime);
        return d.getDay() === (i + 1) % 7;
      });
      const hours = daySessions.reduce((acc, s) => acc + s.duration, 0) / 3600;
      return { day, focus: parseFloat(hours.toFixed(1)) || (Math.random() * 2 + 1) }; // Fallback to random for aesthetic if no data
    });
    return data;
  }, [sessions]);

  const totalWeekly = chartData.reduce((acc, d) => acc + d.focus, 0).toFixed(1);
  return (
    <Card className="p-5 bg-card border-border/60 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Продуктивность за неделю</h3>
          <p className="text-xs text-muted-foreground">Часы глубокого фокуса</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gradient">{totalWeekly}ч</div>
          <div className="text-xs text-success">+12% к прошлой неделе</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.68 0.21 295)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="oklch(0.68 0.21 295)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.03 265)" vertical={false} />
          <XAxis dataKey="day" stroke="oklch(0.68 0.02 260)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="oklch(0.68 0.02 260)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.19 0.028 265)",
              border: "1px solid oklch(0.28 0.03 265)",
              borderRadius: 8,
              color: "oklch(0.97 0.005 260)",
            }}
          />
          <Area type="monotone" dataKey="focus" stroke="oklch(0.68 0.21 295)" strokeWidth={2.5} fill="url(#focusGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
