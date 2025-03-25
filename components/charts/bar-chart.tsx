"use client";

import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";

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
import { cn } from "@/lib/utils";

const chartData = [
  { month: "Chest", desktop: 10 },
  { month: "Shoulder", desktop: 5 },
  { month: "Back", desktop: 9 },
  { month: "Quads", desktop: 6 },
  { month: "Hamstrings", desktop: 4 },
  { month: "Arms", desktop: 6 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface BarChartProps {
  height?: number | string;
  className?: string;
}

export default function Component({ height, className }: BarChartProps = {}) {
  const containerStyle = height
    ? { height: typeof height === "number" ? `${height}px` : height }
    : {};

  return (
    <Card className="border-none p-0 w-full">
      <CardContent className="w-full">
        <div style={containerStyle} className={cn("w-full", className)}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  // className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
