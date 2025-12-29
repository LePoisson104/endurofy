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
  XAxis,
  YAxis,
  Bar,
  BarChart,
  ComposedChart,
} from "recharts";
import { Dumbbell, Scale, ArrowRightLeft, Flame, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import LineChart from "@/components/charts/line-chart";
import { useSelector } from "react-redux";
import { selectUserInfo } from "@/api/user/user-slice";
import handleRateChangeColor from "@/helper/handle-rate-change";

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

export function UnifiedAnalyticsOverview({
  startDate,
  endDate,
  weightAndCaloriesData,
}: {
  startDate: Date;
  endDate: Date;
  weightAndCaloriesData: any;
}) {
  const isMobile = useIsMobile();
  const [overviewView, setOverviewView] = useState<"weight" | "calories">(
    "weight"
  );
  const [caloriesView, setCaloriesView] = useState<"daily" | "weekly">("daily");
  const userInfo = useSelector(selectUserInfo);

  const startWeight = Number(userInfo?.starting_weight || 0);
  const currentWeight = Number(userInfo?.current_weight || 0);
  const goalWeight = Number(userInfo?.weight_goal || 0);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsStatCard
            title="Overall Consistency"
            value="87%"
            icon={Target}
            iconColor="text-blue-500 dark:text-blue-400"
            iconBackground="bg-blue-500/10 dark:bg-blue-500/20"
          />
          <AnalyticsStatCard
            title="Weight Progress"
            value={`${(
              (weightAndCaloriesData?.[0]?.weight || 0) -
              (weightAndCaloriesData?.[weightAndCaloriesData?.length - 1]
                ?.weight || 0)
            ).toFixed(1)} lbs`}
            icon={Scale}
            iconColor="text-cyan-500 dark:text-cyan-400"
            iconBackground="bg-cyan-500/10 dark:bg-cyan-500/20"
          />
          <AnalyticsStatCard
            title="Total Completed Workouts"
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
        <CardContent className="px-2">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[350px] w-full"
          >
            <ComposedChart
              data={unifiedProgressData}
              margin={{ left: 12, right: 12 }}
            >
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
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Consistency Tracking */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
          <CardContent className="px-2">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[300px] w-full"
            >
              <BarChart
                data={
                  caloriesView === "daily"
                    ? macronutrientsData
                    : weeklyMacronutrientsData
                }
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Weight vs Calories Consumed
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {format(startDate, "MMMM d, yyyy")} -{" "}
              {format(endDate, "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent
            className={`${isMobile ? "h-[280px]" : "h-[400px]"} px-0 w-full`}
          >
            <LineChart weightLogData={weightAndCaloriesData} view="both" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <div
                  className={`${
                    isMobile ? "flex-col" : "flex"
                  } justify-between items-center mb-1`}
                >
                  <span className="text-sm">
                    Weight Change
                    <span className="text-xs text-muted-foreground block">
                      {format(startDate, "MMMM d, yyyy")} -{" "}
                      {format(endDate, "MMMM d, yyyy")}
                    </span>
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {Number(
                      (
                        weightAndCaloriesData?.[0]?.weight -
                          weightAndCaloriesData?.[
                            weightAndCaloriesData?.length - 1
                          ]?.weight || 0
                      ).toFixed(1)
                    )}{" "}
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
                  <div className="text-lg font-bold">{startWeight}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Current
                  </div>
                  <div className="text-lg font-bold">{currentWeight}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Goal</div>
                  <div className="text-lg font-bold">{goalWeight}</div>
                </div>
              </div>
              <div
                className={`${
                  isMobile
                    ? "flex flex-col gap-3"
                    : "flex justify-between items-center"
                }`}
              >
                <span className="text-xs flex flex-col">
                  Weight Progress
                  <span className="text-xs text-muted-foreground block">
                    as of {format(new Date(), "MMMM d, yyyy")}
                  </span>
                </span>
                <span className="text-sm">
                  {handleRateChangeColor(
                    Number((currentWeight - startWeight).toFixed(1)),
                    userInfo?.goal || "",
                    userInfo?.starting_weight_unit || "",
                    " as of today"
                  )}
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
