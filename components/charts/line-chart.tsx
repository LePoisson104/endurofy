"use client";
import { useMemo, useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { format, parseISO, addDays, startOfWeek, endOfWeek } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeightLogItem {
  date: string;
  weight: number;
  calories_intake: number;
  isPlaceholder?: boolean;
  [key: string]: any;
}

const chartConfig = {
  weight: {
    label: "Weight",
    color: "hsl(var(--chart-1))",
  },
  caloriesIntake: {
    label: "Calories",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const CustomLegend = () => {
  return (
    <div className="flex items-center justify-center gap-4 pt-3">
      <div className="flex items-center gap-1.5">
        <div
          className="h-2 w-2 shrink-0 rounded-[2px]"
          style={{ backgroundColor: "hsl(var(--chart-1))" }}
        />
        <span>Weight</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="h-2 w-2 shrink-0 rounded-[2px]"
          style={{ backgroundColor: "hsl(var(--chart-2))" }}
        />
        <span>Calories</span>
      </div>
    </div>
  );
};

export default function Component({
  weightLogData,
  view,
}: {
  weightLogData: any;
  view: string;
}) {
  const isMobile = useIsMobile();
  const [weightActive, setWeightActive] = useState(true);
  const [caloriesActive, setCaloriesActive] = useState(true);

  useEffect(() => {
    if (view === "weight") {
      setWeightActive(true);
      setCaloriesActive(false);
    } else if (view === "calories") {
      setWeightActive(false);
      setCaloriesActive(true);
    } else {
      setWeightActive(true);
      setCaloriesActive(true);
    }
  }, [view]);

  const formattedData = useMemo(() => {
    if (!weightLogData) return [];

    const formatted = weightLogData.map((item: any) => ({
      ...item,
      date: item.log_date
        ? format(parseISO(item.log_date), "yyyy-MM-dd")
        : item.date,
      weight: Number(item.weight) || 0,
      calories_intake: Number(item.calories_intake) || 0,
    }));

    return formatted.sort((a: { date: string }, b: { date: string }) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [weightLogData]);

  const dataWithPlaceholders = useMemo(() => {
    if (formattedData.length > 0) return formattedData;

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const placeholderData: WeightLogItem[] = [];
    let currentDate = weekStart;

    while (currentDate <= weekEnd) {
      placeholderData.push({
        date: format(currentDate, "yyyy-MM-dd"),
        weight: 0,
        calories_intake: 0,
        isPlaceholder: true,
      });
      currentDate = addDays(currentDate, 1);
    }

    return placeholderData;
  }, [formattedData]);

  const weightRange = useMemo(() => {
    const realData = dataWithPlaceholders.filter((d: any) => !d.isPlaceholder);
    if (realData.length === 0) return { min: 0, max: 100 };

    const weights = realData.map((d: any) => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);

    return {
      min: Math.floor(min - (max - min) * 0.1),
      max: Math.ceil(max + (max - min) * 0.1),
    };
  }, [dataWithPlaceholders]);

  const caloriesRange = useMemo(() => {
    const realData = dataWithPlaceholders.filter((d: any) => !d.isPlaceholder);
    if (realData.length === 0) return { min: 0, max: 2000 };

    const calories = realData.map((d: any) => d.calories_intake);
    const min = Math.min(...calories);
    const max = Math.max(...calories);

    return {
      min: Math.floor(min - (max - min) * 0.1),
      max: Math.ceil(max + (max - min) * 0.1),
    };
  }, [dataWithPlaceholders]);

  const tickCount = useMemo(() => {
    if (!dataWithPlaceholders.length) return 5;
    if (dataWithPlaceholders.length <= 5) return dataWithPlaceholders.length;
    if (dataWithPlaceholders.length <= 10) return 5;
    return Math.min(10, Math.floor(dataWithPlaceholders.length / 5));
  }, [dataWithPlaceholders]);

  // ✅ FIX: Safe and unique calories ticks
  const caloriesTicks = useMemo(() => {
    const range = caloriesRange.max - caloriesRange.min;
    const safeStep = Math.max(1, Math.round(range / 5));
    const ticks = Array.from(
      { length: 6 },
      (_, i) => caloriesRange.min + i * safeStep
    );
    return [...new Set(ticks)]; // Ensure unique ticks
  }, [caloriesRange]);

  const xAxisTicks = useMemo(() => {
    if (!dataWithPlaceholders || dataWithPlaceholders.length === 0) return [];

    // For small datasets, show all points
    if (dataWithPlaceholders.length <= 3) {
      return dataWithPlaceholders.map((item: WeightLogItem) => item.date);
    }

    // Always include first and last dates
    const firstDate = dataWithPlaceholders[0].date;
    const lastDate = dataWithPlaceholders[dataWithPlaceholders.length - 1].date;

    // Find the middle date
    const middleIndex = Math.floor(dataWithPlaceholders.length / 2);
    const middleDate = dataWithPlaceholders[middleIndex].date;

    // Return exactly 3 ticks: first, middle, last
    return [firstDate, middleDate, lastDate];
  }, [dataWithPlaceholders]);

  return (
    <Card className="h-full w-full p-0 border-none">
      <CardContent className="h-full w-full px-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            data={dataWithPlaceholders}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-weight)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-weight)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillCaloriesIntake"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-caloriesIntake)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-caloriesIntake)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={isMobile ? "10px" : "12px"}
              ticks={xAxisTicks}
              tickFormatter={(value) => {
                try {
                  return format(parseISO(value), "MMM d");
                } catch {
                  return value;
                }
              }}
            />
            {weightActive && (
              <YAxis
                yAxisId="left"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickMargin={2}
                domain={[weightRange.min, weightRange.max]}
                tickCount={5}
                tickFormatter={(value) => `${value}`}
                style={{ fontSize: isMobile ? "10px" : "12px" }}
                width={40}
              />
            )}
            {caloriesActive && (
              <YAxis
                yAxisId="right"
                orientation={!weightActive && caloriesActive ? "left" : "right"}
                tickLine={false}
                axisLine={false}
                tickMargin={2}
                domain={[caloriesRange.min, caloriesRange.max]}
                ticks={caloriesTicks}
                tickFormatter={(value) => `${value}`}
                style={{ fontSize: isMobile ? "10px" : "12px" }}
                width={40}
              />
            )}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    try {
                      return format(parseISO(value), "MMM d, yyyy");
                    } catch {
                      return value;
                    }
                  }}
                  indicator="dot"
                />
              }
            />
            {weightActive && (
              <Area
                yAxisId="left"
                dataKey="weight"
                type="monotone"
                fill="url(#fillWeight)"
                stroke="var(--color-weight)"
                strokeWidth={2}
                name="weight"
                fillOpacity={0.8}
                isAnimationActive={
                  !dataWithPlaceholders.some((item: any) => item.isPlaceholder)
                }
              />
            )}
            {caloriesActive && (
              <Area
                yAxisId="right"
                dataKey="calories_intake"
                type="monotone"
                fill="url(#fillCaloriesIntake)"
                stroke="var(--color-caloriesIntake)"
                strokeWidth={2}
                name="caloriesIntake"
                fillOpacity={0.8}
                isAnimationActive={
                  !dataWithPlaceholders.some((item: any) => item.isPlaceholder)
                }
              />
            )}
            <Legend content={<CustomLegend />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
