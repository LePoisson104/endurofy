"use client";

import { StatsCard } from "./stats-card";
import {
  Dumbbell,
  Target,
  Activity,
  Calendar,
  type LucideIcon,
} from "lucide-react";

interface StatData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

const STATS_DATA: StatData[] = [
  {
    title: "Total Volume",
    value: "45,280 kg",
    change: "+12.5%",
    trend: "up",
    icon: Dumbbell,
  },
  {
    title: "Workouts Completed",
    value: "24",
    change: "+8.3%",
    trend: "up",
    icon: Activity,
  },
  {
    title: "Max Weight",
    value: "120 kg",
    change: "+5.0%",
    trend: "up",
    icon: Target,
  },
  {
    title: "Avg. Session Time",
    value: "62 min",
    change: "-3.2%",
    trend: "down",
    icon: Calendar,
  },
];

export function ProgressionStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS_DATA.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          trend={stat.trend}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}

