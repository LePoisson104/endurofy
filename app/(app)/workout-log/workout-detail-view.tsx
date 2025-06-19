"use client";

import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Target } from "lucide-react";
import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";

interface WorkoutDetailModalProps {
  workout: WorkoutLog | null;
}

export function WorkoutDetailView({ workout }: WorkoutDetailModalProps) {
  // Don't render the modal if there's no workout
  if (!workout) {
    return null;
  }

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case "strength":
        return "bg-blue-100 text-blue-800";
      case "cardio":
        return "bg-red-100 text-red-800";
      case "flexibility":
        return "bg-green-100 text-green-800";
      case "sports":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTotalVolume = () => {
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
  };

  const calculateTotalSets = () => {
    return workout.workoutExercises.reduce(
      (sum, exercise) => sum + exercise.workoutSets.length,
      0
    );
  };

  const calculateTotalReps = () => {
    return workout.workoutExercises.reduce(
      (sum, exercise) =>
        sum +
        exercise.workoutSets.reduce((setSum, set) => {
          const leftReps = set.repsLeft || 0;
          const rightReps = set.repsRight || 0;
          return setSum + leftReps + rightReps;
        }, 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={getWorkoutTypeColor(workout.status)}>
            {workout.status}
          </Badge>
        </div>
        <div className="text-sm">
          {format(parseISO(workout.workoutDate), "EEEE, MMMM d, yyyy")}
        </div>
      </div>

      {/* Workout Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-sm font-medium">Volume</div>
            <div className="text-xl font-bold">
              {(calculateTotalVolume() / 1000).toFixed(1)}K lbs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium">Total Sets</div>
            <div className="text-xl font-bold">{calculateTotalSets()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 rounded-lg">
          <div className="text-2xl font-bold">{calculateTotalReps()}</div>
          <div className="text-sm">Total Reps</div>
        </div>
      </div>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Exercises ({workout.workoutExercises.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {workout.workoutExercises.map((exercise) => (
              <div
                key={exercise.workoutExerciseId}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {exercise.exerciseName}
                    </h4>
                  </div>
                  <div className="text-right text-sm">
                    <div>
                      Volume:{" "}
                      {(
                        exercise.workoutSets.reduce(
                          (sum, set) =>
                            sum +
                            set.weight * set.repsLeft +
                            set.weight * set.repsRight,
                          0
                        ) / 1000
                      ).toFixed(1)}
                      K lbs
                    </div>
                    <div>{exercise.workoutSets.length} sets</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Set</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Reps</TableHead>
                        <TableHead>Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercise.workoutSets.map((set, setIndex) => (
                        <TableRow key={setIndex}>
                          <TableCell className="font-medium">
                            {setIndex + 1}
                          </TableCell>
                          <TableCell>{set.weight} lbs</TableCell>
                          <TableCell>{set.repsLeft}</TableCell>
                          <TableCell className="font-medium">
                            {set.weight * set.repsLeft} lbs
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {exercise.notes && (
                  <div className="mt-4 p-3 rounded-md">
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
