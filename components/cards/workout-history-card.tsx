"use client";

import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Eye, Loader2 } from "lucide-react";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { WorkoutHistorySkeleton } from "@/components/skeletons/workout-history-skeleton";
import { useRef, useCallback } from "react";

import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";

interface WorkoutHistoryListProps {
  workouts: WorkoutLog[] | any;
  onSelectWorkout: (workout: WorkoutLog) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  onLoadMore?: () => void;
  hasMoreData?: boolean;
  isInitialLoad?: boolean;
}

interface WorkoutHistoryCardProps {
  workout: WorkoutLog;
  onSelectWorkout: (workout: WorkoutLog) => void;
  isDark: boolean;
  ref?: React.Ref<HTMLDivElement> | null;
}

function WorkoutHistoryCard({
  workout,
  onSelectWorkout,
  isDark,
  ref,
}: WorkoutHistoryCardProps) {
  const calculateTotalVolume = (workout: WorkoutLog) => {
    return workout.workoutExercises.reduce(
      (sum, exercise) =>
        sum +
        exercise.workoutSets.reduce((setSum: number, set: any) => {
          const reps = set.repsLeft || set.repsRight || 0;
          return setSum + set.weight * reps;
        }, 0),
      0
    );
  };
  return (
    <Card
      key={workout.workoutLogId}
      className="hover:shadow-md transition-shadow"
      ref={ref}
    >
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-lg font-semibold truncate">
                {workout.title}
              </h3>
              {/* Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectWorkout(workout)}
                className="ml-4 shrink-0"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>

            {/* Date and Duration */}
            <div
              className={`flex items-center gap-4 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              } mb-3`}
            >
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(parseISO(workout.workoutDate), "MMM d, yyyy")}
              </div>

              <div className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4" />
                {workout.workoutExercises.length} exercises
              </div>
            </div>

            {/* Exercise Preview */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {workout.workoutExercises.slice(0, 3).map((exercise) => (
                  <Badge
                    key={exercise.workoutExerciseId}
                    className="text-xs font-medium bg-blue-500 text-white"
                  >
                    {exercise.exerciseName}
                  </Badge>
                ))}
                {workout.workoutExercises.length > 3 && (
                  <Badge variant="secondary" className="text-xs font-medium">
                    +{workout.workoutExercises.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats */}
            <div
              className={`flex items-center gap-4 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <span>
                Total Volume:{" "}
                {(calculateTotalVolume(workout) / 1000).toFixed(1)}K lbs
              </span>
              <span>
                Sets:{" "}
                {workout.workoutExercises.reduce(
                  (sum, ex) => sum + ex.workoutSets.length,
                  0
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkoutHistoryList({
  workouts,
  onSelectWorkout,
  isLoading,
  isFetching,
  onLoadMore,
  hasMoreData,
  isInitialLoad,
}: WorkoutHistoryListProps) {
  const isDark = useGetCurrentTheme();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastHistoryCardRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreData && onLoadMore) {
          onLoadMore();
        }
      });
      if (node) observerRef.current?.observe(node);
    },
    [isLoading, hasMoreData, onLoadMore]
  );

  if (isInitialLoad || (isLoading && workouts.length === 0)) {
    return <WorkoutHistorySkeleton />;
  }

  //  Only show "no workouts" if we're not loading AND we have no data
  if (workouts.length === 0 && !isLoading && !isFetching && !isInitialLoad) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Dumbbell className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium mb-2">No workouts found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or start logging your workouts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {workouts.map((workout: any, index: number) =>
          workouts.length - 1 === index ? (
            <WorkoutHistoryCard
              key={workout.workoutLogId}
              workout={workout}
              onSelectWorkout={onSelectWorkout}
              isDark={isDark}
              ref={lastHistoryCardRef}
            />
          ) : (
            <WorkoutHistoryCard
              key={workout.workoutLogId}
              workout={workout}
              onSelectWorkout={onSelectWorkout}
              isDark={isDark}
            />
          )
        )}
      </div>
      {isFetching && hasMoreData && (
        <div className="flex justify-center items-center h-10 mt-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading more workouts...
          </span>
        </div>
      )}
      {!hasMoreData && workouts.length > 0 && (
        <div className="flex justify-center items-center h-10 mt-4">
          <span className="text-sm text-muted-foreground">
            No more workouts to load
          </span>
        </div>
      )}
    </>
  );
}
