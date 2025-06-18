"use client";

import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Clock,
  Calendar,
  Star,
  Dumbbell,
  TrendingUp,
  Target,
} from "lucide-react";
import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";

interface WorkoutDetailModalProps {
  workout: WorkoutLog | null;
  onClose: () => void;
}

export function WorkoutDetailModal({
  workout,
  onClose,
}: WorkoutDetailModalProps) {
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{workout.title}</DialogTitle>
            <Badge className={getWorkoutTypeColor(workout.status)}>
              {workout.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium text-muted-foreground">
                  Date
                </div>
                <div className="text-lg font-bold">
                  {format(parseISO(workout.workoutDate), "MMM d, yyyy")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium text-muted-foreground">
                  Duration
                </div>
                <div className="text-lg font-bold">
                  {workout.workoutExercises.length} min
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Dumbbell className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium text-muted-foreground">
                  Exercises
                </div>
                <div className="text-lg font-bold">
                  {workout.workoutExercises.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-sm font-medium text-muted-foreground">
                  Volume
                </div>
                <div className="text-lg font-bold">
                  {(calculateTotalVolume() / 1000).toFixed(1)}K lbs
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{calculateTotalSets()}</div>
              <div className="text-sm text-muted-foreground">Total Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{calculateTotalReps()}</div>
              <div className="text-sm text-muted-foreground">Total Reps</div>
            </div>
          </div>

          {/* Exercises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Exercises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workout.workoutExercises.map((exercise) => (
                  <div
                    key={exercise.workoutExerciseId}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">
                        {exercise.exerciseName}
                      </h4>
                      <div className="flex items-center gap-2">
                        {exercise.laterality && (
                          <Badge variant="secondary" className="capitalize">
                            {exercise.laterality}
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {exercise.bodyPart}
                        </Badge>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="w-16 text-center">
                              Set
                            </TableHead>
                            <TableHead className="text-center">
                              Weight
                            </TableHead>
                            {exercise.laterality === "bilateral" ? (
                              <TableHead className="text-center">
                                Reps
                              </TableHead>
                            ) : (
                              <>
                                <TableHead className="text-center">
                                  Left Reps
                                </TableHead>
                                <TableHead className="text-center">
                                  Right Reps
                                </TableHead>
                              </>
                            )}
                            <TableHead className="text-center">
                              Volume
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercise.workoutSets.map((set, index) => (
                            <TableRow
                              key={set.workoutSetId || index}
                              className="hover:bg-muted/20"
                            >
                              <TableCell className="font-medium text-center">
                                {set.setNumber || index + 1}
                              </TableCell>
                              <TableCell className="text-center">
                                {set.weight > 0
                                  ? `${set.weight} ${set.weightUnit}`
                                  : "Bodyweight"}
                              </TableCell>
                              {exercise.laterality === "bilateral" ? (
                                <TableCell className="text-center">
                                  {set.repsLeft || set.repsRight} reps
                                </TableCell>
                              ) : (
                                <>
                                  <TableCell className="text-center">
                                    {set.repsLeft} reps
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {set.repsRight} reps
                                  </TableCell>
                                </>
                              )}
                              <TableCell className="text-center">
                                {(() => {
                                  const leftReps = set.repsLeft || 0;
                                  const rightReps = set.repsRight || 0;
                                  const weight = set.weight || 0;
                                  const volume =
                                    weight * leftReps + weight * rightReps;
                                  return volume > 0 ? `${volume} lbs` : "-";
                                })()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {exercise.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <div className="text-sm font-medium mb-1">Notes:</div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
