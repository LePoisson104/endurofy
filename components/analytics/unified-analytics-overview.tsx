"use client";

import { useState, useMemo } from "react";
import { AnalyticsStatCard } from "./analytics-stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PersonalRecordsDialog from "@/components/dialog/personal-records-dialog";
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
import { format, isValid, parseISO } from "date-fns";
import LineChart from "@/components/charts/line-chart";
import { useSelector } from "react-redux";
import { selectUserInfo } from "@/api/user/user-slice";
import handleRateChangeColor from "@/helper/handle-rate-change";

// Analytics Response Interfaces
interface WorkoutSummary {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  averageTime: number;
  personalRecords: {
    improved: number;
    maintained: number;
    regressed: number;
    total: number;
  };
}

interface WorkoutVolumeHistory {
  date: string;
  volume: number;
}

export interface WorkoutsAnalyticsData {
  workoutSummary: WorkoutSummary;
  workoutVolumeHistory: WorkoutVolumeHistory[];
}

interface NutritionSummary {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
}

interface NutritionHistory {
  date: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacrosNutrientsAnalyticsData {
  nutritionSummary: NutritionSummary;
  nutritionHistory: NutritionHistory[];
}

interface ConsistencyHistory {
  completedLogs: number;
  totalLogs: number;
  consistencyPercentage: number;
}

export interface ConsistencyAnalyticsData {
  consistencyHistory: ConsistencyHistory;
}

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

interface UnifiedAnalyticsOverviewProps {
  startDate: Date;
  endDate: Date;
  weightAndCaloriesData: any;
  workoutAnalytics?: WorkoutsAnalyticsData;
  nutritionAnalytics?: MacrosNutrientsAnalyticsData;
  consistencyData?: ConsistencyAnalyticsData;
}

export function UnifiedAnalyticsOverview({
  startDate,
  endDate,
  weightAndCaloriesData,
  workoutAnalytics,
  nutritionAnalytics,
  consistencyData,
}: UnifiedAnalyticsOverviewProps) {
  const isMobile = useIsMobile();
  const [overviewView, setOverviewView] = useState<"weight" | "calories">(
    "weight"
  );
  const [caloriesView, setCaloriesView] = useState<"daily" | "weekly">("daily");
  const userInfo = useSelector(selectUserInfo);

  const startWeight = Number(userInfo?.starting_weight || 0);
  const currentWeight = Number(userInfo?.current_weight || 0);
  const goalWeight = Number(userInfo?.weight_goal || 0);

  // Helper function to safely parse and format dates
  const safeFormatDate = (
    dateValue: string | Date | undefined | null,
    formatStr: string
  ): string | null => {
    if (!dateValue) return null;

    try {
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return isValid(dateValue) ? format(dateValue, formatStr) : null;
      }

      // Try parsing as ISO string first
      const parsedDate = parseISO(dateValue);
      if (isValid(parsedDate)) {
        return format(parsedDate, formatStr);
      }

      // Fallback to Date constructor
      const fallbackDate = new Date(dateValue);
      if (isValid(fallbackDate)) {
        return format(fallbackDate, formatStr);
      }

      return null;
    } catch {
      return null;
    }
  };

  // Transform workout volume history and weight data for Progress Overview chart
  const progressOverviewData = useMemo(() => {
    if (!workoutAnalytics?.workoutVolumeHistory) {
      return [];
    }

    // Create a map of weight data by date from weightLog
    const weightByDate = new Map<string, number>();
    weightAndCaloriesData?.forEach((item: any) => {
      // Weight log uses log_date field
      const dateValue = item.log_date || item.date;
      const dateStr = safeFormatDate(dateValue, "yyyy-MM-dd");
      if (dateStr) {
        weightByDate.set(dateStr, Number(item.weight) || 0);
      }
    });

    // Create a map of calories by date from nutritionAnalytics
    const caloriesByDate = new Map<string, number>();
    nutritionAnalytics?.nutritionHistory?.forEach((item) => {
      const dateStr = safeFormatDate(item.date, "yyyy-MM-dd");
      if (dateStr) {
        caloriesByDate.set(dateStr, item.totalCalories || 0);
      }
    });

    // Merge workout volume with weight and calories data
    return workoutAnalytics.workoutVolumeHistory
      .map((item) => {
        const dateKey = safeFormatDate(item.date, "yyyy-MM-dd");
        const displayDate = safeFormatDate(item.date, "MMM d");
        if (!dateKey || !displayDate) return null;
        return {
          workoutDay: displayDate,
          volume: item.volume,
          weight: weightByDate.get(dateKey) || 0,
          calories: caloriesByDate.get(dateKey) || 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [
    workoutAnalytics?.workoutVolumeHistory,
    weightAndCaloriesData,
    nutritionAnalytics?.nutritionHistory,
  ]);

  // Transform nutrition history for Calories Consumed chart (daily)
  const dailyMacronutrientsData = useMemo(() => {
    if (!nutritionAnalytics?.nutritionHistory) {
      return [];
    }

    return nutritionAnalytics.nutritionHistory
      .map((item) => {
        const dateStr = safeFormatDate(item.date, "MMM d");
        if (!dateStr) return null;

        // Calculate macro calories for stacked bar visualization
        const proteinCal = Math.round(item.protein * 4);
        const carbsCal = Math.round(item.carbs * 4);
        const fatCal = Math.round(item.fat * 9);

        return {
          period: dateStr,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          proteinCal,
          carbsCal,
          fatCal,
          totalCalories: item.totalCalories, // Use totalCalories from backend
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [nutritionAnalytics?.nutritionHistory]);

  // Calculate weekly aggregated macronutrients data
  const weeklyMacronutrientsData = useMemo(() => {
    if (
      !nutritionAnalytics?.nutritionHistory ||
      nutritionAnalytics.nutritionHistory.length === 0
    ) {
      return [];
    }

    const weeks: {
      [key: string]: {
        protein: number[];
        carbs: number[];
        fat: number[];
        totalCalories: number[];
      };
    } = {};

    nutritionAnalytics.nutritionHistory.forEach((item, index) => {
      const weekNum = Math.floor(index / 7) + 1;
      const weekKey = `Week ${weekNum}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = { protein: [], carbs: [], fat: [], totalCalories: [] };
      }

      weeks[weekKey].protein.push(item.protein);
      weeks[weekKey].carbs.push(item.carbs);
      weeks[weekKey].fat.push(item.fat);
      weeks[weekKey].totalCalories.push(item.totalCalories);
    });

    return Object.entries(weeks).map(([weekKey, data]) => {
      const avgProtein = Math.round(
        data.protein.reduce((a, b) => a + b, 0) / data.protein.length
      );
      const avgCarbs = Math.round(
        data.carbs.reduce((a, b) => a + b, 0) / data.carbs.length
      );
      const avgFat = Math.round(
        data.fat.reduce((a, b) => a + b, 0) / data.fat.length
      );
      const avgTotalCalories = Math.round(
        data.totalCalories.reduce((a, b) => a + b, 0) /
          data.totalCalories.length
      );

      return {
        period: weekKey,
        protein: avgProtein,
        carbs: avgCarbs,
        fat: avgFat,
        proteinCal: Math.round(avgProtein * 4),
        carbsCal: Math.round(avgCarbs * 4),
        fatCal: Math.round(avgFat * 9),
        totalCalories: avgTotalCalories,
      };
    });
  }, [nutritionAnalytics?.nutritionHistory]);

  // Format volume for display
  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k`;
    }
    return volume.toString();
  };

  // Format time from minutes to readable format
  // Convert seconds to readable time format
  const formatTime = (seconds: number): string => {
    const totalMinutes = Math.round(seconds / 60);
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${totalMinutes}m`;
  };

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
                  {data.totalCalories?.toLocaleString() || 0} kcal
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
            value={`${Math.round(
              consistencyData?.consistencyHistory.consistencyPercentage || 0
            )}%`}
            icon={Target}
            iconColor="text-blue-500 dark:text-blue-400"
            iconBackground="bg-blue-500/10 dark:bg-blue-500/20"
            description={`${consistencyData?.consistencyHistory.completedLogs} / ${consistencyData?.consistencyHistory.totalLogs}`}
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
            title="Total Workouts"
            value={
              workoutAnalytics?.workoutSummary.totalWorkouts?.toLocaleString() ||
              "0"
            }
            icon={Dumbbell}
            iconColor="text-emerald-500 dark:text-emerald-400"
            iconBackground="bg-emerald-500/10 dark:bg-emerald-500/20"
          />

          <AnalyticsStatCard
            title="Average Weekly Calories"
            value={
              nutritionAnalytics?.nutritionSummary.averageCalories?.toLocaleString() ||
              "0"
            }
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
                  (Volume vs {overviewView === "weight" ? "Weight" : "Calories"}
                  )
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
          {progressOverviewData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[350px] w-full"
            >
              <ComposedChart
                data={progressOverviewData}
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
                    (dataMin: number) => Math.max(0, dataMin - 5),
                    (dataMax: number) => dataMax + 5,
                  ]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatVolume(value)}
                  fontSize={isMobile ? "10px" : "12px"}
                  domain={[
                    (dataMin: number) => Math.max(0, dataMin - 1000),
                    (dataMax: number) => dataMax + 1000,
                  ]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  name="Volume (lbs)"
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
                    name="Weight (lbs)"
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
                    name="Calories"
                    stroke="hsl(0, 73.80%, 62.50%)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(0, 73.80%, 62.50%)" }}
                  />
                )}
              </ComposedChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              No workout data available for the selected period
            </div>
          )}
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
                    {format(startDate, "MMMM d, yyyy")} -{" "}
                    {format(endDate, "MMMM d, yyyy")}
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
            {(caloriesView === "daily"
              ? dailyMacronutrientsData
              : weeklyMacronutrientsData
            ).length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <BarChart
                  data={
                    caloriesView === "daily"
                      ? dailyMacronutrientsData
                      : weeklyMacronutrientsData
                  }
                  margin={{ left: 12, right: 12 }}
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
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No nutrition data available for the selected period
              </div>
            )}
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
                    {workoutAnalytics?.workoutSummary.totalVolume
                      ? formatVolume(
                          workoutAnalytics.workoutSummary.totalVolume
                        )
                      : "0"}{" "}
                    <span className="text-base text-muted-foreground">lbs</span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">lbs lifted</div>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Sets</div>
                  <div className="text-lg font-bold">
                    {workoutAnalytics?.workoutSummary.totalSets?.toLocaleString() ||
                      "0"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Avg Time
                  </div>
                  <div className="text-lg font-bold">
                    {workoutAnalytics?.workoutSummary.averageTime
                      ? formatTime(workoutAnalytics.workoutSummary.averageTime)
                      : "0m"}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-1 mb-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    Personal Records
                  </span>
                  <PersonalRecordsDialog />
                </div>
                <div className="flex justify-evenly items-center w-full">
                  <div className="flex flex-col gap-1 items-center text-lg font-bold text-emerald-600 dark:text-emerald-500">
                    <p className="text-xs text-muted-foreground">Improved</p>
                    {workoutAnalytics?.workoutSummary.personalRecords.improved?.toLocaleString() ||
                      0}
                  </div>
                  <div className="flex flex-col gap-1 items-center text-lg font-bold text-cyan-600 dark:text-cyan-500">
                    <p className="text-xs text-muted-foreground">Maintained</p>
                    {workoutAnalytics?.workoutSummary.personalRecords.maintained?.toLocaleString() ||
                      0}
                  </div>
                  <div className="flex flex-col gap-1 items-center text-lg font-bold text-red-400">
                    <p className="text-xs text-muted-foreground">Regressed</p>
                    {workoutAnalytics?.workoutSummary.personalRecords.regressed?.toLocaleString() ||
                      0}
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
                    {nutritionAnalytics?.nutritionSummary.averageCalories?.toLocaleString() ||
                      "0"}{" "}
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
                  <span className="text-base font-semibold">
                    {nutritionAnalytics?.nutritionSummary.averageProtein?.toLocaleString() ||
                      "0"}
                    g
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                    <span className="text-sm text-muted-foreground">Carbs</span>
                  </div>
                  <span className="text-base font-semibold">
                    {nutritionAnalytics?.nutritionSummary.averageCarbs?.toLocaleString() ||
                      "0"}
                    g
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" />
                    <span className="text-sm text-muted-foreground">Fat</span>
                  </div>
                  <span className="text-base font-semibold">
                    {nutritionAnalytics?.nutritionSummary.averageFat?.toLocaleString() ||
                      "0"}
                    g
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
