"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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

export const description = "A simple area chart";

const chartConfig = {
  set1: {
    label: "Set1",
    color: "hsl(var(--chart-1))",
  },
  set2: {
    label: "Set2",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function WeightChart({ chartData }: { chartData: any }) {
  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch !p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
          <CardTitle>Weight Progression</CardTitle>
          <CardDescription className="border-b mt-1" />
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full pb-6"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="fillSet1" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-set1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-set1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSet2" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-set2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-set2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
            <Area
              dataKey="set1"
              type="monotone"
              fill="url(#fillSet1)"
              stroke="var(--color-set1)"
              strokeWidth={2}
              fillOpacity={0.8}
            />
            <Area
              dataKey="set2"
              type="monotone"
              fill="url(#fillSet2)"
              stroke="var(--color-set2)"
              strokeWidth={2}
              fillOpacity={0.8}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
