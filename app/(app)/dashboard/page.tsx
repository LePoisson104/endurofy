"use client";

import { useState, useEffect } from "react";
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
import { useGetWeightLogByDateQuery } from "@/api/weight-log/weight-log-api-slice";
import { isInCurrentRotation } from "@/helper/get-current-rotation";
import { WorkoutProgram } from "@/interfaces/workout-program-interfaces";
import { startOfWeek, endOfWeek, format, parseISO, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { getDayRange } from "@/helper/get-day-range";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetWeeklySetsQuery } from "@/api/workout-log/workout-log-api-slice";

export default function DashboardPage() {
  const isDark = useGetCurrentTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [timeRange, setTimeRange] = useState("90d");
  const [weightLogView, setWeightLogView] = useState("both");
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

  // Weight log chart date range
  const [weightLogStartDate, setWeightLogStartDate] = useState<Date | null>(
    null
  );
  const [weightLogEndDate, setWeightLogEndDate] = useState<Date | null>(null);

  // Generate workout sessions based on program type
  const generateWorkoutSessions = () => {
    if (!activeProgram || activeProgram.programType === "manual") return [];

    if (activeProgram.programType === "dayOfWeek") {
      // For dayOfWeek programs, show current week's workouts
      const weekStart = startOfWeek(new Date());
      const sessions: Array<{
        id: string;
        title: string;
        date: Date;
        dayId: string;
      }> = [];

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
      const sessions: Array<{
        id: string;
        title: string;
        date: Date;
        dayId: string;
      }> = [];

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

  const { data: weeklySets } = useGetWeeklySetsQuery({
    userId: currentUser?.user_id,
    programId: activeProgram?.programId,
    startDate: currentStartingDate,
    endDate: currentEndingDate,
  });

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

  // Weight log query for chart
  const { data: weightLogData, isLoading: isLoadingWeightLog } =
    useGetWeightLogByDateQuery(
      {
        userId: currentUser?.user_id || "",
        startDate: weightLogStartDate
          ? format(weightLogStartDate, "yyyy-MM-dd")
          : "",
        endDate: weightLogEndDate ? format(weightLogEndDate, "yyyy-MM-dd") : "",
        options: timeRange !== "all" ? "date" : "all",
        withRates: false,
      },
      {
        skip: !currentUser?.user_id || !weightLogStartDate || !weightLogEndDate,
      }
    );

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

  // Get today's workout session
  const getTodaysWorkout = () => {
    if (!activeProgram) return null;

    const today = new Date();

    if (activeProgram.programType === "dayOfWeek") {
      const dayOfWeek = today.getDay() || 7; // Convert Sunday (0) to 7
      return (
        activeProgram.workoutDays.find((day) => day.dayNumber === dayOfWeek) ||
        null
      );
    }

    if (activeProgram.programType === "custom") {
      const startingDate = new Date(activeProgram.startingDate);
      const daysDifference = Math.floor(
        (today.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const maxDayNumber = Math.max(
        ...activeProgram.workoutDays.map((day) => day.dayNumber)
      );

      if (maxDayNumber <= 0) return null;

      let cycleDay;
      if (daysDifference >= 0) {
        cycleDay = (daysDifference % maxDayNumber) + 1;
      } else {
        const positiveDays = Math.abs(daysDifference);
        const remainder = positiveDays % maxDayNumber;
        cycleDay = remainder === 0 ? 1 : maxDayNumber + 1 - remainder;
      }

      return (
        activeProgram.workoutDays.find((day) => day.dayNumber === cycleDay) ||
        null
      );
    }

    return null;
  };

  const todaysWorkout = getTodaysWorkout();

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

  // Set weight log date range based on timeRange selection
  useEffect(() => {
    if (timeRange === "7d") {
      const { startDate, endDate } = getDayRange({ options: "7d" });
      setWeightLogStartDate(startDate);
      setWeightLogEndDate(endDate);
    } else if (timeRange === "30d") {
      const { startDate, endDate } = getDayRange({ options: "30d" });
      setWeightLogStartDate(startDate);
      setWeightLogEndDate(endDate);
    } else if (timeRange === "90d") {
      const { startDate, endDate } = getDayRange({ options: "90d" });
      setWeightLogStartDate(startDate);
      setWeightLogEndDate(endDate);
    } else {
      // Default to last 90 days
      const { startDate, endDate } = getDayRange({ options: "90d" });
      setWeightLogStartDate(startDate);
      setWeightLogEndDate(endDate);
    }
  }, [timeRange]);

  if (activeProgram === null) {
    return (
      <div className="flex min-h-screen flex-col p-[1rem]">
        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col space-y-6">
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
                    Today&apos;s Session
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent className="flex gap-4">
                  <div className="flex flex-col w-1/2">
                    {todaysWorkout ? (
                      <>
                        <p className="text-xl font-bold mb-2">
                          {todaysWorkout.dayName}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {todaysWorkout.exercises.length} exercises scheduled
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-bold mb-2">Rest Day</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          No workout scheduled for today
                        </p>
                      </>
                    )}
                    <Button
                      className="w-fit arrow-button mt-auto"
                      onClick={() => handleViewWorkout(new Date())}
                      disabled={!todaysWorkout}
                    >
                      {todaysWorkout ? "Start" : "View"}
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
                    {todaysWorkout && todaysWorkout.exercises.length > 0 ? (
                      todaysWorkout.exercises
                        .slice(0, 3)
                        .map((exercise, index) => (
                          <div key={exercise.exerciseId} className="flex gap-2">
                            <div
                              className={`w-[1px] h-5 ${
                                index === 0
                                  ? "bg-red-400"
                                  : index === 1
                                  ? "bg-orange-400"
                                  : "bg-teal-400"
                              }`}
                            />
                            <p
                              className={`text-sm truncate ${
                                isMobile ? "w-[140px]" : "w-full"
                              }`}
                            >
                              {exercise.exerciseName}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">
                          {todaysWorkout
                            ? "No exercises scheduled"
                            : "Enjoy your rest day!"}
                        </p>
                      </div>
                    )}
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
                <CardDescription>
                  {new Date(
                    currentStartingDate + "T00:00:00"
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(currentEndingDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-full">
                {weeklySets?.data.length > 0 ? (
                  <BarChart chartData={weeklySets?.data} />
                ) : (
                  <p className="text-sm text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader
                className={`flex items-center gap-2 space-y-0 ${
                  isMobile ? "flex-col" : "flex-row"
                }`}
              >
                <div className="flex flex-col w-full gap-2">
                  <CardTitle>Weight log overview</CardTitle>
                  <CardDescription>
                    {weightLogStartDate && weightLogEndDate
                      ? `${format(
                          weightLogStartDate,
                          "MMM dd, yyyy"
                        )} - ${format(weightLogEndDate, "MMM dd, yyyy")}`
                      : "Loading date range..."}
                  </CardDescription>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <Select
                    value={weightLogView}
                    onValueChange={setWeightLogView}
                  >
                    <SelectTrigger
                      className="w-fit rounded-lg"
                      aria-label="Select chart view"
                    >
                      <SelectValue placeholder="View Both" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="both" className="rounded-lg">
                        View Both
                      </SelectItem>
                      <SelectItem value="weight" className="rounded-lg">
                        View Weight
                      </SelectItem>
                      <SelectItem value="calories" className="rounded-lg">
                        View Calories
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                      className="w-[160px] rounded-lg"
                      aria-label="Select time range"
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
                </div>
              </CardHeader>
              {!isLoadingWeightLog ? (
                <LineChart
                  weightLogData={weightLogData?.data || []}
                  view={weightLogView}
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-muted-foreground">
                    Loading chart data...
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
