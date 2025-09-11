"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell, Activity, Flame, CalendarDays } from "lucide-react";
import BarChart from "@/components/charts/bar-chart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LineChart from "@/components/charts/line-chart";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageTitle from "@/components/global/page-title";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUserInfo } from "@/api/user/user-slice";
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton";
import { selectWeeklyRate } from "@/api/weight-log/weight-log-slice";
import handleRateChangeColor from "@/helper/handle-rate-change";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { useDispatch } from "react-redux";
import { calculateAndSetBMR } from "@/api/user/user-slice";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useGetCompletedWorkoutLogsQuery } from "@/api/workout-log/workout-log-api-slice";
import { useGetFoodLogQuery } from "@/api/food/food-log-api-slice";
import { isInCurrentRotation } from "@/helper/get-current-rotation";
import { WorkoutProgram } from "@/interfaces/workout-program-interfaces";
import { startOfWeek, endOfWeek, format, parseISO, addDays } from "date-fns";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const isDark = useGetCurrentTheme();
  const dispatch = useDispatch();
  const router = useRouter();

  const [timeRange, setTimeRange] = useState("90d");
  const userInfo = useSelector(selectUserInfo);
  const weeklyRate = useSelector(selectWeeklyRate);
  const workoutPrograms = useSelector(selectWorkoutProgram);
  const currentUser = useSelector(selectCurrentUser);
  const [activeProgram, setActiveProgram] = useState<WorkoutProgram | null>(
    null
  );

  const [currentStartingDate, setCurrentStartingDate] = useState<string | null>(
    null
  );
  const [currentEndingDate, setCurrentEndingDate] = useState<string | null>(
    null
  );

  // Generate workout sessions based on program type
  const generateWorkoutSessions = () => {
    if (!activeProgram || activeProgram.programType === "manual") return [];

    if (activeProgram.programType === "dayOfWeek") {
      // For dayOfWeek programs, show current week's workouts
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      const sessions = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = addDays(weekStart, i);
        const dayOfWeek = currentDay.getDay() || 7; // Convert Sunday (0) to 7

        const workoutDay = activeProgram.workoutDays.find(
          (day) => day.dayNumber === dayOfWeek
        );

        if (workoutDay) {
          sessions.push({
            id: `${activeProgram.programId}-${dayOfWeek}`,
            title: workoutDay.dayName,
            date: currentDay,
            dayId: workoutDay.dayId,
          });
        }
      }
      return sessions;
    }

    if (activeProgram.programType === "custom") {
      // For custom programs, show current rotation's workouts
      const { currentRotationStart, currentRotationEnd } =
        isInCurrentRotation(activeProgram);
      if (!currentRotationStart || !currentRotationEnd) return [];

      const rotationStart = parseISO(currentRotationStart);
      const sessions = [];

      // Calculate cycle length
      const maxDayNumber = Math.max(
        ...activeProgram.workoutDays.map((workoutDay) => workoutDay.dayNumber)
      );

      for (let i = 0; i < maxDayNumber; i++) {
        const currentDay = addDays(rotationStart, i);
        const cycleDay = i + 1;

        const workoutDay = activeProgram.workoutDays.find(
          (day) => day.dayNumber === cycleDay
        );

        if (workoutDay) {
          sessions.push({
            id: `${activeProgram.programId}-${cycleDay}`,
            title: workoutDay.dayName,
            date: currentDay,
            dayId: workoutDay.dayId,
          });
        }
      }
      return sessions;
    }

    return [];
  };

  const workoutSessions = generateWorkoutSessions();

  const { data: completedWorkoutLogs } = useGetCompletedWorkoutLogsQuery(
    {
      userId: currentUser?.user_id,
      programId: activeProgram?.programId,
      startDate: currentStartingDate,
      endDate: currentEndingDate,
    },
    {
      skip:
        !currentStartingDate ||
        !currentEndingDate ||
        !currentUser?.user_id ||
        !activeProgram?.programId,
    }
  );

  // Get today's food log for calorie calculation
  const { data: todaysFoodLog } = useGetFoodLogQuery({
    userId: currentUser?.user_id,
    date: new Date().toLocaleDateString("en-CA"), // Today's date in YYYY-MM-DD format
  });

  const currentWeight = Number(userInfo?.current_weight || 0);
  const startWeight = Number(userInfo?.starting_weight || 0);
  const goalWeight = Number(userInfo?.weight_goal || 0);
  const progress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100
      )
    ) || 0
  );

  // Calculate consumed calories from today's food log
  const getConsumedCalories = () => {
    if (!todaysFoodLog?.data?.foodLog) return 0;

    const allFoods = [
      ...(todaysFoodLog.data.foodLog.foods.uncategorized || []),
      ...(todaysFoodLog.data.foodLog.foods.breakfast || []),
      ...(todaysFoodLog.data.foodLog.foods.lunch || []),
      ...(todaysFoodLog.data.foodLog.foods.dinner || []),
      ...(todaysFoodLog.data.foodLog.foods.snacks || []),
    ];

    return allFoods.reduce((total, food) => {
      return total + parseFloat(food.calories);
    }, 0);
  };

  const consumedCalories = getConsumedCalories();
  const remainingCalories = Math.max(0, userInfo?.calories - consumedCalories);

  // Handle navigation to workout log with specific date
  const handleViewWorkout = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    router.push(`/workout-log?date=${formattedDate}&tab=log`);
  };

  useEffect(() => {
    if (userInfo) {
      dispatch(calculateAndSetBMR());
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    const active = workoutPrograms?.filter((program) => program.isActive === 1);
    setActiveProgram(active?.[0] || null);
  }, [workoutPrograms]);

  useEffect(() => {
    if (activeProgram?.programType === "custom") {
      const { currentRotationStart, currentRotationEnd } =
        isInCurrentRotation(activeProgram);
      setCurrentStartingDate(currentRotationStart);
      setCurrentEndingDate(currentRotationEnd);
    } else {
      setCurrentStartingDate(
        startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString().split("T")[0]
      );
      setCurrentEndingDate(
        endOfWeek(new Date(), { weekStartsOn: 0 }).toISOString().split("T")[0]
      );
    }
  }, [activeProgram]);

  if (activeProgram === null) {
    return (
      <div className="flex min-h-screen flex-col p-[1rem]">
        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col space-y-6">
            {/* Dashboard Header */}
            <PageTitle title="Dashboard" />
            {/* Metrics Cards */}
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      {/* Main Content */}
      <main className="flex-1">
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header */}
          <PageTitle title="Dashboard" />

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xs:grid-cols-4">
            <div className="grid gap-4 md:grid-cols-2 sm:grid-cols-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {activeProgram?.programType === "dayOfWeek"
                      ? "Weekly Progress"
                      : activeProgram?.programType === "custom"
                      ? "Rotation Progress"
                      : "Completed Workouts"}
                  </CardTitle>
                  <Dumbbell className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  {workoutPrograms && activeProgram ? (
                    <>
                      <p className="text-2xl font-bold mb-2">
                        {completedWorkoutLogs?.data || 0} /{" "}
                        {activeProgram?.programType === "manual"
                          ? completedWorkoutLogs?.data || 0
                          : activeProgram?.workoutDays.length || 0}{" "}
                        Sessions
                      </p>
                      <Progress
                        value={
                          completedWorkoutLogs?.data
                            ? Math.round(
                                (completedWorkoutLogs?.data /
                                  (activeProgram?.programType === "manual"
                                    ? completedWorkoutLogs?.data || 1
                                    : activeProgram?.workoutDays.length || 1)) *
                                  100
                              )
                            : 0
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Progress:{" "}
                        {completedWorkoutLogs?.data
                          ? Math.round(
                              (completedWorkoutLogs?.data /
                                (activeProgram?.programType === "manual"
                                  ? completedWorkoutLogs?.data || 1
                                  : activeProgram?.workoutDays.length || 1)) *
                                100
                            )
                          : 0}
                        % of your goal
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold mb-2">
                        No Active Program
                      </p>
                      <Progress value={0} />
                      <p className="text-xs text-muted-foreground mt-2">
                        Create a workout program to track progress
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Remaining Calories
                  </CardTitle>
                  <Flame className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-2">
                    {Math.round(remainingCalories)}{" "}
                    <span className="text-sm text-red-400">Kcal</span>
                  </p>
                  <p className="text-xs">
                    Consumed Today:{" "}
                    <span className="text-sm text-muted-foreground">
                      {Math.round(consumedCalories)} Kcal
                    </span>
                  </p>
                  <p className="text-xs ">
                    Daily Target (TDEE):{" "}
                    <span className="text-sm text-muted-foreground">
                      {Number(userInfo?.calories).toFixed(0)} Kcal
                    </span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Weight Progression
                  </CardTitle>
                  <Activity className="h-4 w-4 text-teal-400" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1 mb-2">
                    <p className="text-2xl font-bold">
                      Goal: {goalWeight}{" "}
                      {userInfo?.weight_goal_unit === "lb" ? "lbs" : "kg"}
                    </p>
                    <p className="text-xs text-green-500 flex mb-2">
                      {handleRateChangeColor(
                        weeklyRate,
                        userInfo?.goal || "",
                        userInfo?.starting_weight_unit || "",
                        " since last week",
                        isDark
                      )}
                    </p>
                  </div>
                  <Progress value={progress} />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {startWeight}{" "}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: {currentWeight}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {goalWeight}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Progress: {progress}% of your goal
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Events
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent className="flex gap-4">
                  <div className="flex flex-col w-1/2">
                    <p className="text-xl font-bold">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Today's Events
                    </p>
                    <Button
                      className="w-fit arrow-button"
                      onClick={() => handleViewWorkout(new Date())}
                    >
                      View
                      <svg
                        className="arrow-icon"
                        viewBox="0 -3.5 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        width="7"
                        height="7"
                      >
                        <path
                          className="arrow-icon__tip"
                          d="M8 15L14 8.5L8 2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          className="arrow-icon__line"
                          x1="13"
                          y1="8.5"
                          y2="8.5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <div className="flex gap-2">
                      <div className="w-[1px] h-5 bg-red-400" />
                      <p className="text-sm">Fasted Cardio</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-[1px] h-5 bg-orange-400" />
                      <p className="text-sm">Chest A</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-[1px] h-5 bg-teal-400" />
                      <p className="text-sm">2 miles run</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* workout sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Sessions</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  <p>
                    {activeProgram?.programType === "dayOfWeek"
                      ? `${format(
                          startOfWeek(new Date()),
                          "MMM dd, yyyy"
                        )} - ${format(endOfWeek(new Date()), "MMM dd, yyyy")}`
                      : activeProgram?.programType === "custom" &&
                        currentStartingDate &&
                        currentEndingDate
                      ? `${format(
                          new Date(currentStartingDate + "T00:00:00"),
                          "MMM dd, yyyy"
                        )} - ${format(
                          new Date(currentEndingDate + "T00:00:00"),
                          "MMM dd, yyyy"
                        )}`
                      : activeProgram?.programType === "custom"
                      ? "Current Rotation"
                      : "Current Period"}
                  </p>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="h-[300px] overflow-y-auto">
                <div className="space-y-5">
                  {workoutSessions && workoutSessions.length > 0 ? (
                    workoutSessions.map((session) => (
                      <div key={session.id}>
                        <div className="flex justify-between mb-5">
                          <div className="w-3/10">
                            <p className="text-sm font-bold truncate">
                              {session.title}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {activeProgram?.programName}
                            </p>
                          </div>
                          <div className="w-3/10 flex justify-center items-center">
                            <p className="text-sm text-muted-foreground">
                              {format(session.date, "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div className="w-3/10 flex justify-end">
                            <Button
                              className="w-fit arrow-button"
                              onClick={() => handleViewWorkout(session.date)}
                            >
                              View
                              <svg
                                className="arrow-icon"
                                viewBox="0 -3.5 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                width="7"
                                height="7"
                              >
                                <path
                                  className="arrow-icon__tip"
                                  d="M8 15L14 8.5L8 2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <line
                                  className="arrow-icon__line"
                                  x1="13"
                                  y1="8.5"
                                  y2="8.5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))
                  ) : activeProgram?.programType === "manual" ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-sm text-muted-foreground mb-2">
                        Manual Program
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Create workouts as needed - no scheduled sessions
                      </p>
                    </div>
                  ) : activeProgram ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-sm text-muted-foreground mb-2">
                        No workout sessions found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeProgram?.programType === "dayOfWeek"
                          ? "No workouts scheduled for this week"
                          : "No workouts in current rotation"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-sm text-muted-foreground mb-2">
                        No active workout program
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Create a workout program to see sessions here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Sales */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Sets</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center gap-2 space-y-0  sm:flex-row ">
                <div className="flex flex-col w-full gap-2">
                  <CardTitle>Weight log overview</CardTitle>
                  <CardDescription>
                    March 15, 2025 - March 21, 2025
                  </CardDescription>
                </div>

                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger
                    className="w-[160px] rounded-lg sm:ml-auto"
                    aria-label="Select a value"
                  >
                    <SelectValue placeholder="Last 3 months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d" className="rounded-lg">
                      Last 3 months
                    </SelectItem>
                    <SelectItem value="30d" className="rounded-lg">
                      Last 30 days
                    </SelectItem>
                    <SelectItem value="7d" className="rounded-lg">
                      Last 7 days
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <LineChart weightLogData={[]} view={"both"} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
