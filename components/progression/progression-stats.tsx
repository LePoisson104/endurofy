"use client";

import { StatsCard } from "./stats-card";
import { StatData } from "@/interfaces/progression-interfaces";

export function ProgressionStats({ statsData }: { statsData: StatData[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
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
