"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Check,
  ArrowUp,
  ArrowDown,
  Minus,
  History,
  SquarePen,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Exercise } from "@/interfaces/workout-program-interfaces";
import { WorkoutLogFormProps } from "@/interfaces/workout-log-interfaces";
import ExerciseTable from "./exercise-table";
import { useExerciseSets } from "@/hooks/use-exercise-sets";
import { useWorkoutDay } from "@/hooks/use-workout-day";

export function WorkoutLogForm({ program, selectedDate }: WorkoutLogFormProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");

  const { selectedDay } = useWorkoutDay(program, selectedDate);
  const {
    exerciseSets,
    updateSetData,
    toggleSetLogged,
    isFieldInvalid,
    isExerciseFullyLogged,
    hasLoggedSets,
  } = useExerciseSets(selectedDay);

  if (!selectedDay) {
    return (
      <>
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workout scheduled for this day. This is a rest day.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center items-center w-full mt-4 border rounded-lg h-[400px]">
          <Image
            src={
              isDark ? "/images/darksnorlax.png" : "/images/lightsnorlax.png"
            }
            alt="Rest Day"
            width={150}
            height={150}
          />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="space-y-2 flex justify-between items-center w-full">
          <div className="flex">
            <div>
              <h2 className="text-xl font-bold">{selectedDay?.dayName}</h2>
              <div className="text-sm text-slate-500">
                {format(selectedDate, "MMMM d, yyyy")}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <SquarePen className="h-4 w-4" />
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrevious(!showPrevious)}
            className="border3 w-fit"
          >
            <History className="h-4 w-4 mr-2" />
            {showPrevious ? "Hide Previous" : "Show Previous"}
          </Button>
        )}
      </div>

      {selectedDay && (
        <div className="space-y-6">
          {[...selectedDay.exercises]
            .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
            .map((exercise: Exercise) => {
              const sets = exerciseSets[exercise.exerciseId] || [];
              const isFullyLogged = isExerciseFullyLogged(exercise.exerciseId);
              const hasAnyLoggedSets = hasLoggedSets(exercise.exerciseId);

              return (
                <div
                  key={exercise.exerciseId}
                  className={`rounded-lg space-y-4 ${
                    isMobile ? "p-0 border-none" : "p-4 border"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{exercise.exerciseName}</h4>
                        {isFullyLogged && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">Logged</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">
                        Target: {exercise.sets} sets × {exercise.minReps}-
                        {exercise.maxReps} reps
                      </div>
                    </div>
                  </div>

                  <ExerciseTable
                    exercise={exercise}
                    exerciseSets={sets}
                    updateSetData={updateSetData}
                    toggleSetLogged={toggleSetLogged}
                    isFieldInvalid={isFieldInvalid}
                    isEditing={isEditing}
                    hasLoggedSets={hasAnyLoggedSets}
                    isMobile={isMobile}
                    showPrevious={showPrevious}
                  />
                </div>
              );
            })}

          <div className="space-y-2">
            <Label htmlFor="workout-notes">Workout Notes:</Label>
            <Textarea
              id="workout-notes"
              placeholder="Add notes about this workout..."
              className="min-h-[100px]"
              value={workoutNotes}
              disabled={!isEditing}
              onChange={(e) => setWorkoutNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button className="w-[170px]" disabled={!isEditing}>
              Complete Workout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
