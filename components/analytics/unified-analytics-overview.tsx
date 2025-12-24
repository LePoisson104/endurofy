"use client";

import { useState } from "react";
import { AnalyticsStatCard } from "./analytics-stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  ComposedChart,
} from "recharts";
import { Dumbbell, Scale, ArrowRightLeft, Flame, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Unified data showing correlation between all features by workout day
const unifiedProgressData = [
  {
    workoutDay: "Day 1",
    weight: 180,
    calories: 2100,
    workoutVolume: 12500,
    workouts: 3,
  },
  {
    workoutDay: "Day 2",
    weight: 179.5,
    calories: 2150,
    workoutVolume: 14200,
    workouts: 3,
  },
  {
    workoutDay: "Day 3",
    weight: 179.2,
    calories: 2080,
    workoutVolume: 15800,
    workouts: 3,
  },
  {
    workoutDay: "Day 4",
    weight: 178.8,
    calories: 2200,
    workoutVolume: 16500,
    workouts: 3,
  },
  {
    workoutDay: "Day 5",
    weight: 178.2,
    calories: 2120,
    workoutVolume: 18200,
    workouts: 3,
  },
  {
    workoutDay: "Day 6",
    weight: 177.5,
    calories: 2180,
    workoutVolume: 19100,
    workouts: 3,
  },
  {
    workoutDay: "Rest",
    weight: 177.2,
    calories: 1900,
    workoutVolume: 0,
    workouts: 0,
  },
];

// Average calories history with macronutrients breakdown
// Converting macros to calories: Protein = 4 cal/g, Carbs = 4 cal/g, Fat = 9 cal/g
const macronutrientsData = [
  {
    period: "Dec 1",
    protein: 165,
    carbs: 220,
    fat: 65,
    proteinCal: 660,
    carbsCal: 880,
    fatCal: 585,
  },
  {
    period: "Dec 2",
    protein: 170,
    carbs: 225,
    fat: 68,
    proteinCal: 680,
    carbsCal: 900,
    fatCal: 612,
  },
  {
    period: "Dec 3",
    protein: 160,
    carbs: 215,
    fat: 63,
    proteinCal: 640,
    carbsCal: 860,
    fatCal: 567,
  },
  {
    period: "Dec 4",
    protein: 175,
    carbs: 230,
    fat: 70,
    proteinCal: 700,
    carbsCal: 920,
    fatCal: 630,
  },
  {
    period: "Dec 5",
    protein: 168,
    carbs: 222,
    fat: 66,
    proteinCal: 672,
    carbsCal: 888,
    fatCal: 594,
  },
  {
    period: "Dec 6",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
  {
    period: "Dec 7",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
  {
    period: "Dec 8",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
  {
    period: "Dec 9",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
  {
    period: "Dec 10",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
  {
    period: "Dec 11",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
  {
    period: "Dec 12",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
  {
    period: "Dec 13",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
];

// Weekly aggregated macronutrients data (averages per week)
const weeklyMacronutrientsData = [
  {
    period: "Week 1",
    protein: 167,
    carbs: 223,
    fat: 67,
    proteinCal: 668,
    carbsCal: 892,
    fatCal: 603,
  },
  {
    period: "Week 2",
    protein: 172,
    carbs: 228,
    fat: 69,
    proteinCal: 688,
    carbsCal: 912,
    fatCal: 621,
  },
];

// Weight vs Calories comparison data
const weightCaloriesData = [
  { day: "Mon", weight: 180, calories: 2100 },
  { day: "Tue", weight: 179.8, calories: 2150 },
  { day: "Wed", weight: 180.1, calories: 2080 },
  { day: "Thu", weight: 180.2, calories: 2200 },
  { day: "Fri", weight: 178.8, calories: 2120 },
  { day: "Sat", weight: 178.5, calories: 2180 },
  { day: "Sun", weight: 178.2, calories: 1900 },
];

const chartConfig = {
  weight: {
    label: "Weight (lbs)",
    color: "hsl(var(--chart-1))",
  },
  calories: {
    label: "Calories",
    color: "hsl(var(--chart-2))",
  },
  workoutVolume: {
    label: "Volume (lbs)",
    color: "hsl(var(--primary))",
  },
  workouts: {
    label: "Workouts",
    color: "hsl(var(--primary))",
  },
  meals: {
    label: "Meals Logged",
    color: "hsl(var(--chart-2))",
  },
  weightLogs: {
    label: "Weight Logs",
    color: "hsl(var(--chart-1))",
  },
  protein: {
    label: "Protein (g)",
    color: "oklch(76.5% 0.177 163.223)",
  },
  carbs: {
    label: "Carbs (g)",
    color: "oklch(70.7% 0.165 254.624)",
  },
  fat: {
    label: "Fat (g)",
    color: "oklch(70.4% 0.191 22.216)",
  },
  proteinCal: {
    label: "Protein",
    color: "oklch(76.5% 0.177 163.223)",
  },
  carbsCal: {
    label: "Carbs",
    color: "oklch(70.7% 0.165 254.624)",
  },
  fatCal: {
    label: "Fat",
    color: "oklch(70.4% 0.191 22.216)",
  },
} satisfies ChartConfig;

export function UnifiedAnalyticsOverview() {
  const isMobile = useIsMobile();
  const [overviewView, setOverviewView] = useState<"weight" | "calories">(
    "weight"
  );
  const [caloriesView, setCaloriesView] = useState<"daily" | "weekly">("daily");

  // Custom tooltip formatter for macronutrients chart
  const CustomMacroTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "oklch(76.5% 0.177 163.223)" }}
                />
                <span className="text-xs text-muted-foreground">Protein</span>
              </div>
              <span className="text-sm font-semibold">{data.protein}g</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "oklch(70.7% 0.165 254.624)" }}
                />
                <span className="text-xs text-muted-foreground">Carbs</span>
              </div>
              <span className="text-sm font-semibold">{data.carbs}g</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: "oklch(70.4% 0.191 22.216)" }}
                />
                <span className="text-xs text-muted-foreground">Fat</span>
              </div>
              <span className="text-sm font-semibold">{data.fat}g</span>
            </div>
            <div className="pt-1 mt-1 border-t">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground">
                  Total Calories
                </span>
                <span className="text-sm font-bold">
                  {data.proteinCal + data.carbsCal + data.fatCal} kcal
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsStatCard
            title="Overall Consistency"
            value="87%"
            icon={Target}
            iconColor="text-blue-500 dark:text-blue-400"
            iconBackground="bg-blue-500/10 dark:bg-blue-500/20"
          />
          <AnalyticsStatCard
            title="Weight Progress"
            value="-4.5 lbs"
            icon={Scale}
            iconColor="text-cyan-500 dark:text-cyan-400"
            iconBackground="bg-cyan-500/10 dark:bg-cyan-500/20"
          />
          <AnalyticsStatCard
            title="Total Workouts"
            value="24"
            icon={Dumbbell}
            iconColor="text-emerald-500 dark:text-emerald-400"
            iconBackground="bg-emerald-500/10 dark:bg-emerald-500/20"
          />

          <AnalyticsStatCard
            title="Average Weekly Calories"
            value="2,145"
            icon={Flame}
            iconColor="text-red-500 dark:text-red-400"
            iconBackground="bg-red-500/10 dark:bg-red-500/20"
          />
        </div>
      </div>

      {/* Unified Progress Chart - Shows correlation by workout day */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">
                Progress Overview{" "}
                <span className="text-sm text-muted-foreground">
                  (Workout vs Weight)
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setOverviewView(
                    overviewView === "weight" ? "calories" : "weight"
                  )
                }
                className="text-xs h-8 w-30"
              >
                <ArrowRightLeft className="h-3 w-3 mr-1.5" />
                {overviewView === "weight" ? "Weight" : "Calories"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={unifiedProgressData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="workoutDay"
                  fontSize={isMobile ? "10px" : "12px"}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  fontSize={isMobile ? "10px" : "12px"}
                  tickLine={false}
                  axisLine={false}
                  domain={[
                    (dataMin: number) => dataMin - 5,
                    (dataMax: number) => dataMax + 5,
                  ]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  fontSize={isMobile ? "10px" : "12px"}
                  domain={[
                    (dataMin: number) => dataMin - 1000,
                    (dataMax: number) => dataMax + 1000,
                  ]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="workoutVolume"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(160, 84%, 39%)" }}
                />
                {overviewView === "weight" ? (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(189, 94%, 43%)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(189, 94%, 43%)" }}
                  />
                ) : (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="calories"
                    stroke="hsl(0, 73.80%, 62.50%)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(0, 73.80%, 62.50%)" }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Consistency Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    Calories Consumed (Kcal)
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    December 1, 2025 - December 31, 2025
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCaloriesView(
                      caloriesView === "daily" ? "weekly" : "daily"
                    )
                  }
                  className="text-xs h-8 w-30"
                >
                  <ArrowRightLeft className="h-3 w-3 mr-1.5" />
                  {caloriesView === "daily" ? "Daily" : "Weekly"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-0 pr-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    caloriesView === "daily"
                      ? macronutrientsData
                      : weeklyMacronutrientsData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    fontSize={isMobile ? "10px" : "12px"}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={isMobile ? "10px" : "12px"}
                  />
                  <ChartTooltip content={<CustomMacroTooltip />} />
                  <Bar
                    dataKey="proteinCal"
                    stackId="a"
                    fill="var(--color-protein)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="carbsCal"
                    stackId="a"
                    fill="var(--color-carbs)"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="fatCal"
                    stackId="a"
                    fill="var(--color-fat)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Weight vs Calories Consumed
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              December 1, 2025 - December 31, 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weightCaloriesData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    fontSize={isMobile ? "10px" : "12px"}
                  />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    domain={[
                      (dataMin: number) => dataMin - 5,
                      (dataMax: number) => dataMax + 5,
                    ]}
                    fontSize={isMobile ? "10px" : "12px"}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    domain={[
                      (dataMin: number) => dataMin - 100,
                      (dataMax: number) => dataMax + 100,
                    ]}
                    fontSize={isMobile ? "10px" : "12px"}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(189, 94%, 43%)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(189, 94%, 43%)" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="calories"
                    stroke="hsl(0, 73.80%, 62.50%)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(0, 73.80%, 62.50%)" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weight Summary */}
        <Card className="overflow-hidden border-l-4 border-l-chart-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                  <h3 className="font-semibold text-lg">Weight Summary</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Track your progress
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Weight Change
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                    -4.5{" "}
                    <span className="text-base text-muted-foreground">lbs</span>
                  </span>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Starting
                  </div>
                  <div className="text-lg font-bold">180</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Current
                  </div>
                  <div className="text-lg font-bold">175.5</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Goal</div>
                  <div className="text-lg font-bold">175</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Weekly Rate
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                  -0.65 lbs/wk
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Workout Summary */}
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  <h3 className="font-semibold text-lg">Workout Summary</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your training performance
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Volume
                  </span>
                  <span className="text-2xl font-bold">
                    124.8{" "}
                    <span className="text-base text-muted-foreground">lbs</span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">lbs lifted</div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Sets</div>
                  <div className="text-lg font-bold">456</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Avg Time
                  </div>
                  <div className="text-lg font-bold">65m</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">PRs</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-500">
                    12
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Summary */}
        <Card className="overflow-hidden border-l-4 border-l-chart-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <h3 className="font-semibold text-lg">Nutrition Summary</h3>
                </div>
                <p className="text-xs text-muted-foreground">Daily averages</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="group">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Avg Calories
                  </span>
                  <span className="text-2xl font-bold">
                    2,145{" "}
                    <span className="text-base text-muted-foreground">
                      kcal
                    </span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                    <span className="text-sm text-muted-foreground">
                      Protein
                    </span>
                  </div>
                  <span className="text-base font-semibold">165g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                    <span className="text-sm text-muted-foreground">Carbs</span>
                  </div>
                  <span className="text-base font-semibold">225g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" />
                    <span className="text-sm text-muted-foreground">Fat</span>
                  </div>
                  <span className="text-base font-semibold">67g</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
