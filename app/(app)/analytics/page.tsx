"use client";

import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Area, AreaChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

// Dummy data for workout programs
const dummyPrograms = [
  {
    programId: "1",
    programName: "Push Pull Legs",
    exercises: [
      "Bench Press",
      "Squat",
      "Deadlift",
      "Overhead Press",
      "Barbell Row",
    ],
  },
  {
    programId: "2",
    programName: "Upper Lower Split",
    exercises: [
      "Incline Bench Press",
      "Pull-ups",
      "Leg Press",
      "Romanian Deadlift",
      "Dumbbell Press",
    ],
  },
  {
    programId: "3",
    programName: "Full Body Workout",
    exercises: [
      "Squat",
      "Bench Press",
      "Bent-over Row",
      "Overhead Press",
      "Hip Thrust",
    ],
  },
];

// Dummy data for exercise progression (last 8 weeks)
const generateProgressionData = (exerciseName: string) => {
  const baseWeight = exerciseName.includes("Bench")
    ? 135
    : exerciseName.includes("Squat")
    ? 185
    : exerciseName.includes("Deadlift")
    ? 225
    : 95;

  return Array.from({ length: 8 }, (_, i) => ({
    week: `Week ${i + 1}`,
    weight: baseWeight + i * 5 + Math.random() * 10,
    volume: Math.floor((baseWeight + i * 5) * (8 + Math.random() * 4)),
    oneRepMax: Math.floor((baseWeight + i * 5) * 1.2 + Math.random() * 15),
  }));
};

// Dummy data for calorie intake (last 30 days)
const generateCalorieData = () => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      calories: 2000 + Math.random() * 800 - 400,
      target: 2200,
      protein: 120 + Math.random() * 60,
      carbs: 200 + Math.random() * 100,
      fats: 60 + Math.random() * 40,
    };
  });
};

const chartConfig = {
  weight: {
    label: "Weight (lbs)",
    color: "hsl(var(--chart-1))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--chart-2))",
  },
  oneRepMax: {
    label: "1RM Est.",
    color: "hsl(var(--chart-3))",
  },
  calories: {
    label: "Calories",
    color: "hsl(var(--chart-1))",
  },
  target: {
    label: "Target",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const isMobile = useIsMobile();
  const [selectedProgram, setSelectedProgram] = useState(
    dummyPrograms[0].programId
  );
  const [selectedExercise, setSelectedExercise] = useState(
    dummyPrograms[0].exercises[0]
  );
  const [timeRange, setTimeRange] = useState("8weeks");

  const currentProgram = dummyPrograms.find(
    (p) => p.programId === selectedProgram
  );
  const progressionData = useMemo(
    () => generateProgressionData(selectedExercise),
    [selectedExercise]
  );
  const calorieData = useMemo(() => generateCalorieData(), []);

  // Calculate stats
  const latestProgress = progressionData[progressionData.length - 1];
  const previousProgress = progressionData[progressionData.length - 2];
  const weightChange = latestProgress.weight - previousProgress.weight;
  const volumeChange = latestProgress.volume - previousProgress.volume;

  const avgCalories = Math.round(
    calorieData.reduce((sum, day) => sum + day.calories, 0) / calorieData.length
  );
  const targetCalories = calorieData[0].target;
  const calorieVariance = avgCalories - targetCalories;

  return (
    <div className="flex min-h-screen flex-col p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your lifting progress and nutrition over time
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select program" />
          </SelectTrigger>
          <SelectContent>
            {dummyPrograms.map((program) => (
              <SelectItem key={program.programId} value={program.programId}>
                {program.programName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select exercise" />
          </SelectTrigger>
          <SelectContent>
            {currentProgram?.exercises.map((exercise) => (
              <SelectItem key={exercise} value={exercise}>
                {exercise}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4weeks">4 Weeks</SelectItem>
            <SelectItem value="8weeks">8 Weeks</SelectItem>
            <SelectItem value="12weeks">12 Weeks</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="lifts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lifts">Lift Progression</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="lifts" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Weight
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(latestProgress.weight)} lbs
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {weightChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  {weightChange > 0 ? "+" : ""}
                  {Math.round(weightChange)} lbs from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Training Volume
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(latestProgress.volume)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {volumeChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  {volumeChange > 0 ? "+" : ""}
                  {Math.round(volumeChange)} from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estimated 1RM
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(latestProgress.oneRepMax)} lbs
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on recent performance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progression Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedExercise} Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <LineChart
                  data={progressionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="weight" orientation="left" />
                  <YAxis yAxisId="volume" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-weight)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 4 }}
                    name="Weight (lbs)"
                  />
                  <Line
                    yAxisId="volume"
                    type="monotone"
                    dataKey="volume"
                    stroke="var(--color-volume)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "var(--color-volume)", strokeWidth: 2, r: 3 }}
                    name="Volume"
                  />
                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="oneRepMax"
                    stroke="var(--color-oneRepMax)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-oneRepMax)",
                      strokeWidth: 2,
                      r: 3,
                    }}
                    name="1RM Est."
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6">
          {/* Nutrition Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Daily Calories
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgCalories}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {calorieVariance > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  {calorieVariance > 0 ? "+" : ""}
                  {Math.round(calorieVariance)} from target
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Target Calories
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{targetCalories}</div>
                <p className="text-xs text-muted-foreground">
                  Daily calorie goal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Adherence Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    (calorieData.filter(
                      (d) => Math.abs(d.calories - d.target) <= 200
                    ).length /
                      calorieData.length) *
                      100
                  )}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Within ±200 calories of target
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Calorie Intake Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Calorie Intake (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <LineChart
                  data={calorieData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="fillCalories"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-calories)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-calories)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="var(--color-calories)"
                    fillOpacity={1}
                    fill="url(#fillCalories)"
                    strokeWidth={2}
                    name="Calories"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-target)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Macronutrient Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>
                Average Macronutrient Breakdown (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Protein</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        calorieData.reduce((sum, day) => sum + day.protein, 0) /
                          calorieData.length
                      )}
                      g
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-chart-1 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (calorieData.reduce(
                            (sum, day) => sum + day.protein,
                            0
                          ) /
                            calorieData.length /
                            150) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Target: 150g
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carbohydrates</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        calorieData.reduce((sum, day) => sum + day.carbs, 0) /
                          calorieData.length
                      )}
                      g
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-chart-2 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (calorieData.reduce(
                            (sum, day) => sum + day.carbs,
                            0
                          ) /
                            calorieData.length /
                            250) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Target: 250g
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fats</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(
                        calorieData.reduce((sum, day) => sum + day.fats, 0) /
                          calorieData.length
                      )}
                      g
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-chart-3 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (calorieData.reduce((sum, day) => sum + day.fats, 0) /
                            calorieData.length /
                            80) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Target: 80g
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
