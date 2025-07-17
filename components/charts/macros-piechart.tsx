"use client";

import * as React from "react";
import { Label, Pie, PieChart, Cell } from "recharts";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface MacroData {
  name: string;
  value: number;
  calories: number;
  color: string;
}

interface MacrosPieChartProps {
  data: MacroData[];
  calories: number;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
}

const chartConfig = {
  protein: {
    label: "Protein",
    color: "#34d399",
  },
  carbs: {
    label: "Carbs",
    color: "#60a5fa",
  },
  fat: {
    label: "Fat",
    color: "#f87171",
  },
} satisfies ChartConfig;

export function MacrosPieChart({
  data,
  calories,
  size = 130,
  innerRadius = 40,
  outerRadius = 60,
}: MacrosPieChartProps) {
  const hasData = data.some((item) => item.value > 0);

  const chartData = hasData
    ? data.filter((item) => item.value > 0)
    : [{ name: "No Data", value: 100, calories: 0, color: "#e5e7eb" }];

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square"
      style={{ width: size, height: size }}
    >
      <PieChart width={size} height={size}>
        <Pie
          data={chartData}
          cx={size / 2}
          cy={size / 2}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={90}
          endAngle={450}
          dataKey="value"
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 6}
                      className="fill-foreground text-xl font-bold"
                    >
                      {calories}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 16}
                      className="fill-muted-foreground font-bold text-sm"
                    >
                      kcal
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
