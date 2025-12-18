"use client";

import { useState } from "react";
import { AnalyticsStatCard } from "./analytics-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Area,
  Bar,
  BarChart,
  ComposedChart,
} from "recharts";
import { Dumbbell, Scale, Apple, Flame, Target } from "lucide-react";

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
const macronutrientsData = [
  { period: "Week 1", protein: 165, carbs: 220, fat: 65 },
  { period: "Week 2", protein: 170, carbs: 225, fat: 68 },
  { period: "Week 3", protein: 160, carbs: 215, fat: 63 },
  { period: "Week 4", protein: 175, carbs: 230, fat: 70 },
  { period: "Week 5", protein: 168, carbs: 222, fat: 66 },
  { period: "Week 6", protein: 172, carbs: 228, fat: 69 },
];

// Activity heatmap data
const activityData = [
  { day: "Mon", workouts: 4, meals: 12, weight: 6 },
  { day: "Tue", workouts: 3, meals: 11, weight: 5 },
  { day: "Wed", workouts: 5, meals: 13, weight: 7 },
  { day: "Thu", workouts: 4, meals: 12, weight: 6 },
  { day: "Fri", workouts: 3, meals: 10, weight: 5 },
  { day: "Sat", workouts: 2, meals: 9, weight: 4 },
  { day: "Sun", workouts: 3, meals: 11, weight: 5 },
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
    color: "hsl(210, 100%, 65%)",
  },
  carbs: {
    label: "Carbs (g)",
    color: "hsl(210, 90%, 50%)",
  },
  fat: {
    label: "Fat (g)",
    color: "hsl(215, 85%, 35%)",
  },
} satisfies ChartConfig;

export function UnifiedAnalyticsOverview() {
  const [overviewView, setOverviewView] = useState<"weight" | "calories">(
    "weight"
  );

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsStatCard
            title="Overall Consistency"
            value="87%"
            change="+5%"
            trend="up"
            icon={Target}
          />
          <AnalyticsStatCard
            title="Total Workouts"
            value="24"
            change="+12%"
            trend="up"
            icon={Dumbbell}
          />
          <AnalyticsStatCard
            title="Weight Progress"
            value="-4.5 lbs"
            change="-2.5%"
            trend="down"
            icon={Scale}
          />
          <AnalyticsStatCard
            title="Avg Daily Calories"
            value="2,145"
            change="+5%"
            trend="up"
            icon={Flame}
            iconColor="text-red-400"
          />
        </div>
      </div>

      {/* Unified Progress Chart - Shows correlation by workout day */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">
                Progress Overview by Workout Day
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Compare:</span>
              <Button
                variant={overviewView === "weight" ? "default" : "outline"}
                size="sm"
                onClick={() => setOverviewView("weight")}
                className="text-xs h-8"
              >
                <Scale className="h-3 w-3 mr-1.5" />
                Weight & Volume
              </Button>
              <Button
                variant={overviewView === "calories" ? "default" : "outline"}
                size="sm"
                onClick={() => setOverviewView("calories")}
                className="text-xs h-8"
              >
                <Flame className="h-3 w-3 mr-1.5" />
                Calories & Volume
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={unifiedProgressData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="workoutDay"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="workoutVolume"
                  fill="hsl(210, 100%, 65%)"
                  fillOpacity={0.3}
                  stroke="hsl(210, 90%, 50%)"
                  strokeWidth={2}
                />
                {overviewView === "weight" ? (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                ) : (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="calories"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Consistency Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Avg Calories History - Macronutrients
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your average protein, carbs, and fat intake by week
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macronutrientsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: "Grams",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12 },
                    }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="protein"
                    fill="var(--color-protein)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="carbs"
                    fill="var(--color-carbs)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="fat"
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
            <CardTitle className="text-base">Activity by Day of Week</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your most active days across all tracking
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="workouts"
                    stackId="a"
                    fill="hsl(var(--primary))"
                  />
                  <Bar dataKey="meals" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar
                    dataKey="weight"
                    stackId="a"
                    fill="hsl(var(--chart-1))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Workout Summary */}
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="h-5 w-5 text-primary" />
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
                  <span className="text-2xl font-bold">124.8k</span>
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

        {/* Weight Summary */}
        <Card className="overflow-hidden border-l-4 border-l-chart-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-5 w-5 text-chart-1" />
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
                    -4.5
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">lbs lost</div>
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

        {/* Nutrition Summary */}
        <Card className="overflow-hidden border-l-4 border-l-chart-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Apple className="h-5 w-5 text-chart-2" />
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
                  <span className="text-2xl font-bold">2,145</span>
                </div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-chart-3" />
                    <span className="text-sm text-muted-foreground">
                      Protein
                    </span>
                  </div>
                  <span className="text-lg font-bold">165g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-chart-4" />
                    <span className="text-sm text-muted-foreground">Carbs</span>
                  </div>
                  <span className="text-lg font-bold">225g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-chart-5" />
                    <span className="text-sm text-muted-foreground">Fat</span>
                  </div>
                  <span className="text-lg font-bold">67g</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
