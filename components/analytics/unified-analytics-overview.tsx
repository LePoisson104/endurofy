"use client";

import { AnalyticsStatCard } from "./analytics-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Bar,
  BarChart,
  ComposedChart,
} from "recharts";
import {
  Dumbbell,
  Scale,
  Apple,
  Flame,
  TrendingUp,
  Target,
  Calendar,
  Award,
} from "lucide-react";

// Unified data showing correlation between all three features
const unifiedProgressData = [
  {
    date: "Jan 1",
    weight: 180,
    calories: 2100,
    workoutVolume: 12500,
    workouts: 3,
  },
  {
    date: "Jan 8",
    weight: 179.2,
    calories: 2150,
    workoutVolume: 14200,
    workouts: 4,
  },
  {
    date: "Jan 15",
    weight: 178.5,
    calories: 2080,
    workoutVolume: 15800,
    workouts: 3,
  },
  {
    date: "Jan 22",
    weight: 177.8,
    calories: 2200,
    workoutVolume: 16500,
    workouts: 4,
  },
  {
    date: "Jan 29",
    weight: 177.0,
    calories: 2120,
    workoutVolume: 18200,
    workouts: 3,
  },
  {
    date: "Feb 5",
    weight: 176.2,
    calories: 2180,
    workoutVolume: 19100,
    workouts: 4,
  },
  {
    date: "Feb 12",
    weight: 175.5,
    calories: 2145,
    workoutVolume: 20500,
    workouts: 4,
  },
];

// Weekly consistency across all features
const consistencyData = [
  { week: "Week 1", workouts: 3, meals: 18, weightLogs: 5 },
  { week: "Week 2", workouts: 4, meals: 20, weightLogs: 6 },
  { week: "Week 3", workouts: 3, meals: 19, weightLogs: 5 },
  { week: "Week 4", workouts: 4, meals: 21, weightLogs: 7 },
  { week: "Week 5", workouts: 3, meals: 18, weightLogs: 5 },
  { week: "Week 6", workouts: 4, meals: 20, weightLogs: 6 },
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
} satisfies ChartConfig;

export function UnifiedAnalyticsOverview() {
  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsStatCard
            title="Overall Consistency"
            value="87%"
            change="+5%"
            trend="up"
            icon={Target}
            description="across all features"
          />
          <AnalyticsStatCard
            title="Total Workouts"
            value="24"
            change="+12%"
            trend="up"
            icon={Dumbbell}
            description="vs previous period"
          />
          <AnalyticsStatCard
            title="Weight Progress"
            value="-4.5 lbs"
            change="-2.5%"
            trend="down"
            icon={Scale}
            description="on track with goal"
          />
          <AnalyticsStatCard
            title="Avg Daily Calories"
            value="2,145"
            change="+5%"
            trend="up"
            icon={Flame}
            description="vs previous period"
          />
        </div>
      </div>

      {/* Unified Progress Chart - Shows correlation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Progress Overview - Weight & Workout Volume
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See how your workout intensity correlates with weight changes
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={unifiedProgressData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Weight (lbs)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12 },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  label={{
                    value: "Volume (lbs)",
                    angle: 90,
                    position: "insideRight",
                    style: { fontSize: 12 },
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="workoutVolume"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
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
              Weekly Activity Consistency
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your logging consistency across all features
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consistencyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="week"
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
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="meals"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="weightLogs"
                    fill="hsl(var(--chart-1))"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Workout Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Volume
                </span>
                <span className="font-semibold">124,800 lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Sets
                </span>
                <span className="font-semibold">456</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg Session
                </span>
                <span className="font-semibold">65 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">PRs Hit</span>
                <span className="font-semibold text-green-600 dark:text-green-500">
                  12
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Weight Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Starting Weight
                </span>
                <span className="font-semibold">180.0 lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Weight
                </span>
                <span className="font-semibold">175.5 lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Goal Weight
                </span>
                <span className="font-semibold">175.0 lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Weekly Rate
                </span>
                <span className="font-semibold text-green-600 dark:text-green-500">
                  -0.65 lbs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Apple className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Nutrition Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg Calories
                </span>
                <span className="font-semibold">2,145</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg Protein
                </span>
                <span className="font-semibold">165g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Carbs</span>
                <span className="font-semibold">225g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Fat</span>
                <span className="font-semibold">67g</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
