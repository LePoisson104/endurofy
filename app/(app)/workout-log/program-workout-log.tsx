"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Check,
  History,
  Loader2,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import {
  Exercise,
  WorkoutProgram,
} from "@/interfaces/workout-program-interfaces";
import {
  ExercisePayload,
  WorkoutLogPayload,
} from "@/interfaces/workout-log-interfaces";
import ExerciseTable from "./exercise-table";
import { useExerciseSets } from "@/hooks/use-exercise-sets";
import { useWorkoutDay } from "@/hooks/use-workout-day";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import {
  useGetWorkoutLogQuery,
  useCreateWorkoutLogMutation,
} from "@/api/workout-log/workout-log-api-slice";
import {
  useUpdateWorkoutLogStatusMutation,
  useGetPreviousWorkoutLogQuery,
  useDeleteWorkoutLogMutation,
  useDeleteWorkoutExerciseMutation,
} from "@/api/workout-log/workout-log-api-slice";
import { ProgramWorkoutLogSkeleton } from "@/components/skeletons/program-workout-log-skeleton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useUpdateWorkoutLogNameMutation } from "@/api/workout-log/workout-log-api-slice";
import ExerciseNotes from "./exercise-notes";
import DeleteDialog from "@/components/dialog/delete-dialog";
import CompletedBadge from "@/components/badges/status-badges";
import BodyPartBadge from "@/components/badges/bodypart-badge";
import CustomBadge from "@/components/badges/custom-badge";

interface ProgramWorkoutLogProps {
  program: WorkoutProgram;
  selectedDate: Date;
}

export function ProgramWorkoutLog({
  program,
  selectedDate,
}: ProgramWorkoutLogProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const { selectedDay } = useWorkoutDay(program, selectedDate);

  const [isEditing, setIsEditing] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState<{ [id: string]: string }>(
    {}
  );
  const [workoutLogName, setWorkoutLogName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [context, setContext] = useState("");
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(
    null
  );

  const [updateWorkoutLogStatus] = useUpdateWorkoutLogStatusMutation();
  const [updateWorkoutLogName, { isLoading: isUpdatingWorkoutLogName }] =
    useUpdateWorkoutLogNameMutation();
  const [deleteWorkoutLog, { isLoading: isDeletingWorkoutLog }] =
    useDeleteWorkoutLogMutation();
  const [deleteWorkoutExercise] = useDeleteWorkoutExerciseMutation();
  const { data: workoutLog, isLoading: isLoadingWorkoutLog } =
    useGetWorkoutLogQuery({
      userId: user?.user_id,
      programId: program.programId,
      startDate: format(selectedDate, "yyyy-MM-dd"),
      endDate: format(selectedDate, "yyyy-MM-dd"),
    });
  const { data: previousWorkoutLog, isLoading: isLoadingPreviousWorkoutLog } =
    useGetPreviousWorkoutLogQuery({
      userId: user?.user_id,
      programId: program.programId,
      dayId: selectedDay?.dayId,
      currentWorkoutDate: format(selectedDate, "yyyy-MM-dd"),
    });
  const [createWorkoutLog] = useCreateWorkoutLogMutation();

  const {
    exerciseSets,
    updateSetData,
    toggleSetLogged,
    isFieldInvalid,
    isExerciseFullyLogged,
    hasLoggedSets,
    getWorkoutExerciseId,
    getExerciseNotes,
  } = useExerciseSets(workoutLog, [program], selectedDay, previousWorkoutLog);

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
      setWorkoutLogName(workoutLog.data[0]?.title || "");
    }
  }, [selectedDay, workoutLog]); // Remove function dependencies

  const handleUpdateWorkoutLogName = async () => {
    if (workoutLogName.trim() === "") {
      setWorkoutLogName(workoutLog?.data[0].title);
      return;
    }

    try {
      await updateWorkoutLogName({
        workoutLogId: workoutLog?.data[0].workoutLogId,
        title: workoutLogName,
      }).unwrap();
      toast.success("Workout log name updated");
    } catch (error: any) {
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to update workout log name");
      }
    }
  };

  const handleDelete = async () => {
    try {
      if (context === "Exercise") {
        await deleteWorkoutExercise({
          workoutExerciseId: deletingExerciseId,
          workoutLogId: workoutLog?.data[0].workoutLogId,
          workoutLogType: "program",
        }).unwrap();
        toast.success("Workout exercise deleted");
      } else if (context === "Log") {
        await deleteWorkoutLog({
          workoutLogId: workoutLog?.data[0].workoutLogId,
        }).unwrap();
        toast.success("Workout log deleted");
      }
      setIsEditing(false);
      setShowDeleteDialog(false);
      setWorkoutLogName("");
    } catch (error: any) {
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to delete workout log");
      }
    }
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
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to save workout log");
      }
    }
  };

  if (isLoadingWorkoutLog || isLoadingPreviousWorkoutLog) {
    return <ProgramWorkoutLogSkeleton />;
  }

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
            width={100}
            height={100}
            style={{ width: "auto", height: "auto", objectFit: "contain" }}
            priority
          />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="space-y-2 flex justify-between items-center w-full">
          <div className="flex">
            <div>
              {workoutLog?.data?.length > 0 ? (
                isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={workoutLogName}
                      onChange={(e) => setWorkoutLogName(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUpdateWorkoutLogName}
                      disabled={
                        workoutLogName.trim() === "" ||
                        isUpdatingWorkoutLogName ||
                        workoutLogName === workoutLog?.data[0].title
                      }
                    >
                      {isUpdatingWorkoutLogName ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold">
                    {workoutLog.data[0].title}
                  </h2>
                )
              ) : (
                <h2 className="text-xl font-bold">{selectedDay?.dayName}</h2>
              )}
              <div className="text-sm text-slate-500">
                {format(selectedDate, "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        </div>
        <div>
          {workoutLog?.data?.length > 0 && (
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setContext("Log");
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
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
                  <div
                    className={`flex justify-between ${
                      isMobile ? "items-center" : ""
                    }`}
                  >
                    <div className="flex flex-col flex-1 ">
                      <div
                        className={`flex items-center gap-3 ${
                          isMobile ? "justify-between" : ""
                        }`}
                      >
                        <h4 className="font-medium">{exercise.exerciseName}</h4>
                        {isFullyLogged && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CompletedBadge />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 my-1">
                        <CustomBadge title={exercise.laterality} />
                        <BodyPartBadge bodyPart={exercise.bodyPart} />
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
                    {isEditing && hasLoggedSets(exercise.exerciseId) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit text-destructive hover:text-destructive/80"
                        onClick={() => {
                          setContext("Exercise");
                          setShowDeleteDialog(true);
                          setDeletingExerciseId(
                            getWorkoutExerciseId(exercise.exerciseId)
                          );
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
                  <ExerciseNotes
                    exerciseNotes={exerciseNotes}
                    setExerciseNotes={setExerciseNotes}
                    getExerciseNotes={getExerciseNotes}
                    getWorkoutExerciseId={getWorkoutExerciseId}
                    hasAnyLoggedSets={hasAnyLoggedSets}
                    exercise={exercise}
                  />
                </div>
              );
            })}
        </div>
      )}

      <DeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        handleDelete={handleDelete}
        isDeleting={isDeletingWorkoutLog}
        title={`Delete Workout ${context}`}
        children={`Are you sure you want to delete this workout ${context.toLowerCase()}? This action cannot be undone.`}
      />
    </div>
  );
}
