"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SET_COLORS } from "@/helper/constants/set-colors";

export function VolumeChart({ chartData }: { chartData: any[] }) {
  // Dynamically detect set keys from data
  const setKeys = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    const allKeys = new Set<string>();
    chartData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key.startsWith("set")) {
          allKeys.add(key);
        }
      });
    });

    // Sort by set number (set1, set2, set3, etc.)
    return Array.from(allKeys).sort((a, b) => {
      const numA = parseInt(a.replace("set", ""), 10);
      const numB = parseInt(b.replace("set", ""), 10);
      return numA - numB;
    });
  }, [chartData]);

  // Generate dynamic chart config
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    setKeys.forEach((key, index) => {
      const setNumber = key.replace("set", "");
      config[key] = {
        label: `Set ${setNumber}`,
        color: SET_COLORS[index % SET_COLORS.length],
      };
    });
    return config;
  }, [setKeys]);

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch !p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
          <CardTitle>Volume Progression</CardTitle>
          <CardDescription className="border-b mt-1" />
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full pb-6"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const [year, month, day] = String(value).split("-");
                const date = new Date(
                  Number(year),
                  Number(month) - 1,
                  Number(day)
                );
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    const [year, month, day] = String(value).split("-");
                    const date = new Date(
                      Number(year),
                      Number(month) - 1,
                      Number(day)
                    );
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            {setKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={SET_COLORS[index % SET_COLORS.length]}
                radius={8}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
