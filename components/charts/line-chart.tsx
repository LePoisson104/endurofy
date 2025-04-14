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

// Define types for our data
interface WeightLogItem {
  date: string;
  weight: number;
  calories_intake: number;
  isPlaceholder?: boolean;
  [key: string]: any; // For other properties
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

// Custom legend component to ensure both items are displayed
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

  // Format the data to ensure dates are properly formatted
  const formattedData = useMemo(() => {
    if (!weightLogData) return [];

    // First format the data
    const formatted = weightLogData.map((item: any) => ({
      ...item,
      // Ensure date is in a consistent format
      date: item.log_date
        ? format(parseISO(item.log_date), "yyyy-MM-dd")
        : item.date,
      // Ensure numeric values
      weight: Number(item.weight) || 0,
      calories_intake: Number(item.calories_intake) || 0,
    }));

    // Then sort by date in ascending order (oldest to newest)
    return formatted.sort((a: { date: string }, b: { date: string }) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [weightLogData]);

  // Generate placeholder data for empty weeks
  const dataWithPlaceholders = useMemo(() => {
    if (formattedData.length > 0) return formattedData;

    // Create placeholder data for the current week
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

    const placeholderData: WeightLogItem[] = [];
    let currentDate = weekStart;

    // Generate 7 days of placeholder data
    while (currentDate <= weekEnd) {
      placeholderData.push({
        date: format(currentDate, "yyyy-MM-dd"),
        weight: 0,
        calories_intake: 0,
        isPlaceholder: true, // Flag to identify placeholder data
      });
      currentDate = addDays(currentDate, 1);
    }

    return placeholderData;
  }, [formattedData]);

  // Find min and max values for better axis scaling
  const weightRange = useMemo(() => {
    if (!dataWithPlaceholders.length) return { min: 0, max: 100 };

    // Filter out placeholder data for range calculation
    const realData = dataWithPlaceholders.filter(
      (item: WeightLogItem) => !item.isPlaceholder
    );

    if (realData.length === 0) {
      // Default range for placeholder data
      return { min: 0, max: 100 };
    }

    const weights = realData.map((item: WeightLogItem) => item.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);

    // Add some padding to the range
    return {
      min: Math.floor(min - (max - min) * 0.1),
      max: Math.ceil(max + (max - min) * 0.1),
    };
  }, [dataWithPlaceholders]);

  const caloriesRange = useMemo(() => {
    if (!dataWithPlaceholders.length) return { min: 0, max: 2000 };

    // Filter out placeholder data for range calculation
    const realData = dataWithPlaceholders.filter(
      (item: WeightLogItem) => !item.isPlaceholder
    );

    if (realData.length === 0) {
      // Default range for placeholder data
      return { min: 0, max: 2000 };
    }

    const calories = realData.map(
      (item: WeightLogItem) => item.calories_intake
    );
    const min = Math.min(...calories);
    const max = Math.max(...calories);

    // Add some padding to the range
    return {
      min: Math.floor(min - (max - min) * 0.1),
      max: Math.ceil(max + (max - min) * 0.1),
    };
  }, [dataWithPlaceholders]);

  // Calculate dynamic tick count based on data length
  const tickCount = useMemo(() => {
    if (!dataWithPlaceholders.length) return 5;

    // For small datasets, show all ticks
    if (dataWithPlaceholders.length <= 5) return dataWithPlaceholders.length;

    // For medium datasets, show a reasonable number of ticks
    if (dataWithPlaceholders.length <= 10) return 5;

    // For large datasets, scale the number of ticks
    return Math.min(10, Math.floor(dataWithPlaceholders.length / 5));
  }, [dataWithPlaceholders]);

  // Generate unique ticks for calories axis
  const caloriesTicks = useMemo(() => {
    // If we have only one data point, create a custom range with unique values
    if (dataWithPlaceholders.length === 1) {
      const value = dataWithPlaceholders[0].calories_intake;
      // Create a range around the single value
      const min = Math.max(0, Math.floor(value * 0.8));
      const max = Math.ceil(value * 1.2);
      const step = Math.ceil((max - min) / 5);

      // Generate ticks with unique values
      return Array.from({ length: 6 }, (_, i) => {
        const tickValue = min + i * step;
        // Ensure we don't have duplicate values
        return i === 0 ? min : i === 5 ? max : tickValue;
      });
    }

    // For multiple data points, use the standard approach
    const step = Math.round((caloriesRange.max - caloriesRange.min) / 5);
    return Array.from({ length: 6 }, (_, i) => caloriesRange.min + i * step);
  }, [caloriesRange, dataWithPlaceholders]);

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
              tickMargin={8}
              minTickGap={20}
              fontSize={isMobile ? "10px" : "12px"}
              interval="preserveStartEnd"
              tickCount={tickCount}
              tickFormatter={(value) => {
                try {
                  return format(parseISO(value), "MMM d");
                } catch (e) {
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
                orientation={
                  weightActive === false && caloriesActive === true
                    ? "left"
                    : "right"
                }
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
                    } catch (e) {
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
                  !dataWithPlaceholders.some(
                    (item: WeightLogItem) => item.isPlaceholder
                  )
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
                  !dataWithPlaceholders.some(
                    (item: WeightLogItem) => item.isPlaceholder
                  )
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
