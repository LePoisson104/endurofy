"use client";

import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  Target,
  Dumbbell,
  Check,
  Eye,
  EyeOff,
  Edit,
  Play,
} from "lucide-react";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { WorkoutDetailSkeleton } from "@/components/skeletons/workout-detail-skeleton";
import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";

interface WorkoutDetailModalProps {
  workout: WorkoutLog | null;
  isLoading?: boolean;
}

export function WorkoutDetailView({
  workout,
  isLoading = false,
}: WorkoutDetailModalProps) {
  const isDark = useGetCurrentTheme();
  const isMobile = useIsMobile();
  const router = useRouter();

  const [showPrevious, setShowPrevious] = useState(false);

  // Scroll to top when workout detail view is displayed
  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, []);

  const calculateTotalVolume = useMemo(() => {
    if (workout) {
      return workout.workoutExercises.reduce(
        (sum, exercise) =>
          sum +
          exercise.workoutSets.reduce((setSum, set) => {
            const leftReps = set.repsLeft || 0;
            const rightReps = set.repsRight || 0;
            const weight = set.weight || 0;
            return setSum + weight * leftReps + weight * rightReps;
          }, 0),
        0
      );
    }
    return 0;
  }, [workout]);

  const calculateTotalSets = useMemo(() => {
    if (workout) {
      return workout.workoutExercises.reduce(
        (sum, exercise) => sum + exercise.workoutSets.length,
        0
      );
    }
    return 0;
  }, [workout]);

  // Show skeleton if loading or no workout
  if (isLoading || !workout) {
    return <WorkoutDetailSkeleton />;
  }

  const handleEditWorkout = () => {
    // Navigate to workout-log page with the specific date and program
    const workoutDate = new Date(workout.workoutDate);
    const formattedDate = workoutDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    localStorage.setItem("selectedDate", formattedDate);
    localStorage.setItem("selectedTab", "log");
    router.push(`/workout-log?date=${formattedDate}&tab=log`);
  };

  return (
    <div className="space-y-6">
      {/* Workout Overview */}
      <Card>
        <CardContent>
          <div
            className={`flex ${
              isMobile
                ? "flex-col justify-start gap-2"
                : "flex-row items-center justify-between"
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <CardTitle>{workout.title}</CardTitle>
                {workout.status === "completed" && (
                  <Badge className="bg-green-600 text-white">
                    <Check className="h-2 w-2" />
                    Completed
                  </Badge>
                )}
              </div>
              <div
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                } mt-1`}
              >
                {workout.status === "completed"
                  ? "Completed on "
                  : "Started on "}
                {format(parseISO(workout.workoutDate), "EEEE, MMMM d, yyyy")}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditWorkout}
              className="flex items-center gap-2 w-fit"
            >
              {workout.status === "completed" ? (
                <Edit className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {workout.status === "completed"
                ? "Edit Workout"
                : "Complete Workout"}
            </Button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mt-4">
            <div className="shadow-none">
              <div className="p-4 text-center">
                <Dumbbell className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Total Exercises</div>
                <div className="text-sm font-bold">
                  {workout.workoutExercises.length}
                </div>
              </div>
            </div>
            <div className="shadow-none">
              <div className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                <div className="text-sm font-medium">Total Sets</div>
                <div className="text-sm font-bold">{calculateTotalSets}</div>
              </div>
            </div>
            <div className="shadow-none">
              <div className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <div className="text-sm font-medium">Volume</div>
                <div className="text-sm font-bold">
                  {(calculateTotalVolume / 1000).toFixed(1)}K lbs
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show Previous Button for Mobile */}
      {isMobile && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrevious(!showPrevious)}
            className="flex items-center gap-2"
          >
            {showPrevious ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Previous
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Previous
              </>
            )}
          </Button>
        </div>
      )}

      {/* Exercises */}
      <Card>
        <CardContent>
          <div className="space-y-6">
            {workout.workoutExercises.map((exercise) => (
              <div
                key={exercise.workoutExerciseId}
                className={`${
                  isMobile ? "p-0 border-none" : "p-4 border rounded-lg"
                }`}
              >
                <div
                  className={`flex mb-4 ${
                    isMobile
                      ? "flex-col justify-start"
                      : "items-center justify-between"
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-lg">
                      {exercise.exerciseName}
                    </h4>
                  </div>
                  <div
                    className={`text-sm ${
                      isMobile ? "text-left" : "text-right"
                    } ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    <div>
                      Volume:{" "}
                      {(
                        exercise.workoutSets.reduce(
                          (sum, set) =>
                            sum +
                            (set.weight || 0) * (set.repsLeft || 0) +
                            (set.weight || 0) * (set.repsRight || 0),
                          0
                        ) / 1000
                      ).toFixed(1)}
                      K lbs
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px] text-center">
                          Set #
                        </TableHead>
                        <TableHead className="w-[100px] text-center">
                          Weight (lbs)
                        </TableHead>
                        {exercise.laterality === "unilateral" ? (
                          <>
                            <TableHead className="w-[80px] text-center">
                              Left
                            </TableHead>
                            <TableHead className="w-[80px] text-center">
                              Right
                            </TableHead>
                          </>
                        ) : (
                          <TableHead className="w-[80px] text-center">
                            Reps
                          </TableHead>
                        )}
                        {(!isMobile || showPrevious) && (
                          <>
                            <TableHead className="w-[100px] text-center">
                              Prev Weight
                            </TableHead>
                            {exercise.laterality === "unilateral" ? (
                              <>
                                <TableHead className="w-[80px] text-center">
                                  Prev Left
                                </TableHead>
                                <TableHead className="w-[80px] text-center">
                                  Prev Right
                                </TableHead>
                              </>
                            ) : (
                              <TableHead className="w-[80px] text-center">
                                Prev Reps
                              </TableHead>
                            )}
                            <TableHead className="w-[100px] text-center">
                              Volume (lbs)
                            </TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercise.workoutSets.map((set, setIndex) => {
                        const volume =
                          exercise.laterality === "unilateral"
                            ? (set.weight || 0) *
                              ((set.repsLeft || 0) + (set.repsRight || 0))
                            : (set.weight || 0) * (set.repsLeft || 0);

                        return (
                          <TableRow key={setIndex}>
                            <TableCell className="font-medium text-center">
                              {setIndex + 1}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className={`${isMobile ? "text-sm" : ""}`}>
                                {set.weight || 0}
                              </div>
                            </TableCell>
                            {exercise.laterality === "unilateral" ? (
                              <>
                                <TableCell className="text-center">
                                  <div
                                    className={`${isMobile ? "text-sm" : ""}`}
                                  >
                                    {set.repsLeft || 0}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div
                                    className={`${isMobile ? "text-sm" : ""}`}
                                  >
                                    {set.repsRight || 0}
                                  </div>
                                </TableCell>
                              </>
                            ) : (
                              <TableCell className="text-center">
                                <div className={`${isMobile ? "text-sm" : ""}`}>
                                  {set.repsLeft || 0}
                                </div>
                              </TableCell>
                            )}
                            {(!isMobile || showPrevious) && (
                              <>
                                <TableCell className="text-slate-500 text-center">
                                  {set.previousWeight
                                    ? set.previousWeight
                                    : "-"}
                                </TableCell>
                                {exercise.laterality === "unilateral" ? (
                                  <>
                                    <TableCell className="text-slate-500 text-center">
                                      {set.previousLeftReps
                                        ? set.previousLeftReps
                                        : "-"}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-center">
                                      {set.previousRightReps
                                        ? set.previousRightReps
                                        : "-"}
                                    </TableCell>
                                  </>
                                ) : (
                                  <TableCell className="text-slate-500 text-center">
                                    {set.previousLeftReps
                                      ? set.previousLeftReps
                                      : "-"}
                                  </TableCell>
                                )}
                                <TableCell className="text-center font-medium">
                                  {volume}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {exercise.notes && (
                  <div className="mt-4 p-3 rounded-md bg-muted/30">
                    <div className="text-sm font-medium mb-1">
                      Exercise Notes:
                    </div>
                    <div className="text-sm">{exercise.notes}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
