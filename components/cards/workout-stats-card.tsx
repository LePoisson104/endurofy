"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Dumbbell, TrendingUp, Flame } from "lucide-react";
import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";

export function WorkoutHistoryStats({
  workouts,
}: {
  workouts: WorkoutLog[] | any;
}) {
  // Ensure workouts is an array and handle different data structures that might come from API
  const getWorkoutsArray = (): WorkoutLog[] => {
    if (!workouts) return [];
    if (Array.isArray(workouts)) return workouts;
    if (
      typeof workouts === "object" &&
      workouts.data &&
      Array.isArray(workouts.data)
    )
      return workouts.data;
    return [];
  };

  const workoutsArray = getWorkoutsArray();

  const totalWorkouts = workoutsArray.length;

  // This month stats
  const thisMonth = new Date();
  const firstDayOfMonth = new Date(
    thisMonth.getFullYear(),
    thisMonth.getMonth(),
    1
  );
  const thisMonthWorkouts = workoutsArray.filter(
    (workout) => new Date(workout.workoutDate) >= firstDayOfMonth
  ).length;

  // This week stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekWorkouts = workoutsArray.filter(
    (workout) => new Date(workout.workoutDate) >= oneWeekAgo
  ).length;

  // Total volume (weight × reps)
  const totalVolume = workoutsArray.reduce(
    (sum: number, workout: WorkoutLog) =>
      sum +
      workout.workoutExercises.reduce(
        (exerciseSum: number, exercise: any) =>
          exerciseSum +
          exercise.workoutSets.reduce((setSum: number, set: any) => {
            const leftReps = set.repsLeft || 0;
            const rightReps = set.repsRight || 0;
            const weight = set.weight || 0;
            return setSum + weight * leftReps + weight * rightReps;
          }, 0),
        0
      ),
    0
  );

  const monthlyGoal = 12;
  const monthlyProgress = Math.min(
    (thisMonthWorkouts / monthlyGoal) * 100,
    100
  );

  const stats = [
    {
      title: "Total Workouts",
      value: totalWorkouts.toString(),
      icon: Dumbbell,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "This Month",
      value: thisMonthWorkouts.toString(),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "This Week",
      value: thisWeekWorkouts.toString(),
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Streaks",
      value: "10",
      icon: Flame,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Monthly Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Workouts this month</span>
                <span>
                  {thisMonthWorkouts} / {monthlyGoal}
                </span>
              </div>
              <Progress value={monthlyProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {monthlyProgress >= 100
                  ? "🎉 Goal achieved!"
                  : `${Math.ceil(
                      monthlyGoal - thisMonthWorkouts
                    )} more to reach your goal`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Volume Lifted</CardTitle>
            <p className="text-xs text-muted-foreground">
              Across all strength training sessions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {totalVolume > 0 ? (totalVolume / 1000).toFixed(1) : "0"}K lbs
              </div>
              <p className="text-xs text-muted-foreground">
                20k lbs more than last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
