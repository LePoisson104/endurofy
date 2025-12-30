"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SET_COLORS } from "@/helper/constants/set-colors";

export const description = "A dynamic line chart";

export function WeightChart({ chartData }: { chartData: any[] }) {
  const [selectedSet, setSelectedSet] = useState<string>("all");

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

  // Filter set keys based on selection
  const displayedSetKeys = useMemo(() => {
    if (selectedSet === "all") return setKeys;
    return setKeys.filter((key) => key === selectedSet);
  }, [setKeys, selectedSet]);

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
        <div className="flex flex-1 items-center justify-between gap-2 px-6 pt-4 pb-3 sm:py-6 border-b">
          <CardTitle>Weight Progression</CardTitle>
          <Select value={selectedSet} onValueChange={setSelectedSet}>
            <SelectTrigger size="sm" className="w-[100px]">
              <SelectValue placeholder="Select set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sets</SelectItem>
              {setKeys.map((key) => {
                const setNumber = key.replace("set", "");
                return (
                  <SelectItem key={key} value={key}>
                    Set {setNumber}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full pb-6"
        >
          <LineChart
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
                // Parse the date string directly without timezone issues
                const [year, month, day] = value.split("-");
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
              interval="preserveStartEnd"
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {displayedSetKeys.map((key) => {
              const originalIndex = setKeys.indexOf(key);
              return (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={SET_COLORS[originalIndex % SET_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
