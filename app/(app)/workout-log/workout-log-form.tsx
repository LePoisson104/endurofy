"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, History, SquarePen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Exercise } from "@/interfaces/workout-program-interfaces";
import {
  WorkoutLogFormProps,
  ExercisePayload,
  WorkoutLogPayload,
} from "@/interfaces/workout-log-interfaces";
import ExerciseTable from "./exercise-table";
import { useExerciseSets } from "@/hooks/use-exercise-sets";
import { useWorkoutDay } from "@/hooks/use-workout-day";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import {
  useGetWorkoutLogQuery,
  useCreateWorkoutLogMutation,
  useUpdateExerciseNotesMutation,
} from "@/api/workout-log/workout-log-api-slice";
import ErrorAlert from "@/components/alerts/error-alert";
import { useDebounceCallback } from "@/hooks/use-debounce";
import {
  useUpdateWorkoutLogStatusMutation,
  useGetPreviousWorkoutLogQuery,
} from "@/api/workout-log/workout-log-api-slice";

export function WorkoutLogForm({ program, selectedDate }: WorkoutLogFormProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const { selectedDay } = useWorkoutDay(program, selectedDate);

  const [isEditing, setIsEditing] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState<{ [id: string]: string }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  const [updateWorkoutLogStatus] = useUpdateWorkoutLogStatusMutation();

  const { data: workoutLog } = useGetWorkoutLogQuery({
    userId: user?.user_id,
    programId: program.programId,
    startDate: format(selectedDate, "yyyy-MM-dd"),
    endDate: format(selectedDate, "yyyy-MM-dd"),
  });
  const { data: previousWorkoutLog } = useGetPreviousWorkoutLogQuery({
    userId: user?.user_id,
    programId: program.programId,
    dayId: selectedDay?.dayId,
    currentWorkoutDate: format(selectedDate, "yyyy-MM-dd"),
  });

  const [createWorkoutLog] = useCreateWorkoutLogMutation();
  const [updateExerciseNotes, { isLoading: isUpdatingExerciseNotes }] =
    useUpdateExerciseNotesMutation();

  const {
    exerciseSets,
    updateSetData,
    toggleSetLogged,
    isFieldInvalid,
    isExerciseFullyLogged,
    hasLoggedSets,
    getWorkoutExerciseId,
    getExerciseNotes,
  } = useExerciseSets(selectedDay, workoutLog, previousWorkoutLog);

  useEffect(() => {
    if (!selectedDay || !workoutLog?.data[0]) return;
    if (selectedDay.dayId !== workoutLog.data[0].dayId) return;

    const currentWorkout = workoutLog.data[0];

    const total = selectedDay.exercises.reduce(
      (acc, exercise) => acc + exercise.sets,
      0
    );
    const logged = currentWorkout.workoutExercises.reduce(
      (acc: number, exercise: any) => acc + exercise.workoutSets.length,
      0
    );

    if (total === 0) return;

    // Use local variables for comparison to avoid double request
    if (logged === total && currentWorkout.status === "incomplete") {
      updateWorkoutLogStatus({
        workoutLogId: currentWorkout.workoutLogId,
        status: "completed",
      }).unwrap();
    } else if (logged !== total && currentWorkout.status === "completed") {
      updateWorkoutLogStatus({
        workoutLogId: currentWorkout.workoutLogId,
        status: "incomplete",
      }).unwrap();
    }
  }, [selectedDay, workoutLog, selectedDate]);

  // Load existing notes when workout log data is available
  useEffect(() => {
    if (selectedDay && workoutLog) {
      const initialNotes: { [id: string]: string } = {};

      selectedDay.exercises.forEach((exercise) => {
        const workoutExerciseId = getWorkoutExerciseId(exercise.exerciseId);
        const existingNotes = getExerciseNotes(workoutExerciseId);

        if (existingNotes && existingNotes.trim()) {
          initialNotes[workoutExerciseId] = existingNotes;
        }
      });

      // Only update state if there are actually notes to set
      if (Object.keys(initialNotes).length > 0) {
        setExerciseNotes((prev) => ({
          ...prev,
          ...initialNotes,
        }));
      }
    }
  }, [selectedDay, workoutLog]); // Remove function dependencies

  const debouncedSaveNote = useDebounceCallback(
    async (workoutExerciseId: string, notes: string) => {
      if (!workoutExerciseId && notes.trim() === "") {
        return;
      }

      try {
        await updateExerciseNotes({
          workoutExerciseId: workoutExerciseId,
          exerciseNotes: notes.trim(),
        }).unwrap();
      } catch (error: any) {
        if (error) {
          setError(error.data.message);
        } else {
          setError("Internal server error. Failed to save exercise notes");
        }
      }
    },
    2000
  );

  const handleNotesChange = (workoutExerciseId: string, notes: string) => {
    // Update UI immediately
    setExerciseNotes((prev) => ({
      ...prev,
      [workoutExerciseId]: notes,
    }));

    // Save to API with debounce
    debouncedSaveNote(workoutExerciseId, notes);
  };

  // Get the current value for a textarea (local state takes precedence over saved notes)
  const getCurrentNoteValue = (workoutExerciseId: string): string => {
    // If we have local changes, use those
    if (exerciseNotes[workoutExerciseId] !== undefined) {
      return exerciseNotes[workoutExerciseId];
    }

    // Otherwise, use the saved notes from the database
    return getExerciseNotes(workoutExerciseId) || "";
  };

  const onSaveExerciseSets = async (exercisePayload: ExercisePayload) => {
    const workoutLogPayload: WorkoutLogPayload = {
      workoutName: selectedDay?.dayName || "",
      workoutDate: format(selectedDate, "yyyy-MM-dd"),
      ...exercisePayload,
    };

    if (
      exercisePayload.weight === 0 &&
      exercisePayload.repsLeft === 0 &&
      exercisePayload.repsRight === 0
    ) {
      return;
    }

    try {
      await createWorkoutLog({
        userId: user?.user_id || "",
        programId: program.programId || "",
        dayId: selectedDay?.dayId || "",
        workoutLog: workoutLogPayload,
      }).unwrap();
    } catch (error: any) {
      if (error) {
        setError(error.data.message);
      } else {
        setError("Internal server error. Failed to save workout log");
      }
    }
  };

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
      <ErrorAlert error={error} setError={setError} />
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
          {workoutLog?.data?.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <SquarePen className="h-4 w-4" />
              {isEditing ? "Done" : "Edit"}
            </Button>
          )}
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
                    <div className="flex flex-col flex-1 ">
                      <div
                        className={`flex items-center gap-3 ${
                          isMobile ? "justify-between" : ""
                        }`}
                      >
                        <h4 className="font-medium">{exercise.exerciseName}</h4>
                        {isFullyLogged && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Badge className="bg-green-600 text-white">
                              <Check className="h-2 w-2" />
                              Completed
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 my-1">
                        <Badge className="text-xs">{exercise.laterality}</Badge>
                        <Badge className="text-xs bg-blue-500 text-white">
                          {exercise.bodyPart}
                        </Badge>
                      </div>
                      <div
                        className={`text-sm ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Target: {exercise.sets} sets × {exercise.minReps}-
                        {exercise.maxReps} reps
                      </div>
                    </div>
                  </div>

                  <ExerciseTable
                    onSaveExerciseSets={onSaveExerciseSets}
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
                  <div className="space-y-2">
                    <Label htmlFor="workout-notes">
                      Exercise Notes
                      <span className="text-sm text-slate-500">
                        {isUpdatingExerciseNotes
                          ? "(Saving...)"
                          : getExerciseNotes(
                              getWorkoutExerciseId(exercise.exerciseId)
                            ) !== ""
                          ? "(Saved)"
                          : "(Optional)"}
                      </span>
                    </Label>
                    <Textarea
                      id="workout-notes"
                      placeholder={
                        hasAnyLoggedSets
                          ? "Add notes about this exercise... (max 200 characters)"
                          : "No sets logged yet"
                      }
                      maxLength={200}
                      className="min-h-[80px]"
                      value={getCurrentNoteValue(
                        getWorkoutExerciseId(exercise.exerciseId)
                      )}
                      onChange={(e) =>
                        handleNotesChange(
                          getWorkoutExerciseId(exercise.exerciseId),
                          e.target.value
                        )
                      }
                      disabled={!hasAnyLoggedSets}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
