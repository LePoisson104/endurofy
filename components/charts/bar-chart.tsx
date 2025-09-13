"use client";

import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const chartConfig = {
  totalSets: {
    label: "Sets",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface BarChartProps {
  height?: number | string;
  className?: string;
  chartData?: Array<{ bodyPart: string; totalSets: number }>;
}

export default function Component({
  height,
  className,
  chartData = [],
}: BarChartProps = {}) {
  const isMobile = useIsMobile();
  const containerStyle = height
    ? { height: typeof height === "number" ? `${height}px` : height }
    : {};

  return (
    <Card className="border-none p-0 w-full">
      <CardContent className="w-full">
        <div style={containerStyle} className={cn("w-full", className)}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="bodyPart"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={({ x, y, payload }) => {
                  const text =
                    payload.value.length > (isMobile ? 7 : 15)
                      ? payload.value.substring(0, 7) + "…"
                      : payload.value;
                  return (
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#666"
                    >
                      {text}
                    </text>
                  );
                }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="totalSets" fill="var(--color-totalSets)" radius={8}>
                <LabelList position="top" offset={12} fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
