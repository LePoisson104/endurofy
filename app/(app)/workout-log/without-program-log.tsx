import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, SquarePen, Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import ExerciseSelectionModal from "@/components/modals/exercise-selection-modal";
import CreateManualWorkoutLogModal from "@/components/modals/create-manual-workout-log-modal";
import {
  useAddManualWorkoutExerciseMutation,
  useCreateManualWorkoutLogMutation,
  useUpdateWorkoutLogNameMutation,
  useDeleteWorkoutLogMutation,
  useAddWorkoutSetMutation,
  useDeleteWorkoutExerciseMutation,
  useGetManualWorkoutLogWithPreviousQuery,
  useUpdateWorkoutLogStatusMutation,
} from "@/api/workout-log/workout-log-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { toast } from "sonner";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import DeleteDialog from "@/components/dialog/delete-dialog";
import ExerciseTable from "./exercise-table";
import ExerciseNotes from "./exercise-notes";
import { ProgramWorkoutLogSkeleton } from "@/components/skeletons/program-workout-log-skeleton";

import type {
  WorkoutProgram,
  Exercise,
} from "@/interfaces/workout-program-interfaces";
import type { ExercisePayload } from "@/interfaces/workout-log-interfaces";
import { useExerciseSets } from "@/hooks/use-exercise-sets";

export default function WithoutProgramLog({
  selectedDate,
}: {
  selectedDate: Date;
}) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const programs = useSelector(selectWorkoutProgram);

  const [manualProgram, setManualProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [workoutLogName, setWorkoutLogName] = useState("");
  const [isExerciseSelectionModalOpen, setIsExerciseSelectionModalOpen] =
    useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState<{ [id: string]: string }>(
    {}
  );
  const [context, setContext] = useState("");
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(
    null
  );

  const [updateWorkoutLogName, { isLoading: isUpdatingWorkoutLogName }] =
    useUpdateWorkoutLogNameMutation();

  const [createManualWorkoutLog, { isLoading: isCreatingWorkoutLog }] =
    useCreateManualWorkoutLogMutation();

  const [
    addManualWorkoutExercise,
    { isLoading: isAddingExerciseToWorkoutLog },
  ] = useAddManualWorkoutExerciseMutation();

  const [updateWorkoutLogStatus] = useUpdateWorkoutLogStatusMutation();

  const [deleteWorkoutLog, { isLoading: isDeletingWorkoutLog }] =
    useDeleteWorkoutLogMutation();

  const [deleteWorkoutExercise] = useDeleteWorkoutExerciseMutation();

  const [addWorkoutSet] = useAddWorkoutSetMutation();

  const { data: workoutLog, isLoading: isLoadingWorkoutLog } =
    useGetManualWorkoutLogWithPreviousQuery(
      {
        userId: user?.user_id,
        programId: manualProgram?.programId,
        workoutDate: format(selectedDate, "yyyy-MM-dd"),
      },
      {
        skip: !manualProgram || !selectedDate || !user?.user_id,
      }
    );

  // Use manual exercise sets hook for managing exercise data
  const {
    exerciseSets,
    updateSetData,
    toggleSetLogged,
    isFieldInvalid,
    isExerciseFullyLogged,
    hasLoggedSets,
    getExerciseNotes,
    getExercises,
    getManualWorkoutExerciseId,
  } = useExerciseSets(workoutLog, programs || []);

  useEffect(() => {
    setManualProgram(
      programs?.filter((program) => program.programType === "manual")?.[0] ||
        null
    );
  }, [programs]);

  // Calculate completion status using proper validation
  const isWorkoutComplete = useMemo(() => {
    const exercises = getExercises();
    if (exercises.length === 0) return false;

    // Check if all exercises are fully logged (with valid weight and reps)
    return exercises.every((exercise) =>
      isExerciseFullyLogged(exercise.exerciseId)
    );
  }, [getExercises, isExerciseFullyLogged]);

  // Update workout status when completion state changes
  useEffect(() => {
    if (!workoutLog?.data[0] || !selectedDate) return;
    if (
      selectedDate.toISOString().split("T")[0] !==
      workoutLog.data[0].workoutDate.split("T")[0]
    )
      return;

    const currentWorkout = workoutLog.data[0];
    const exercises = currentWorkout.workoutExercises || [];

    // Check if exerciseSets are properly synced with current workoutLog
    // by verifying that each exercise has corresponding exerciseSets
    const isExerciseSetsSynced =
      exercises.length === 0 ||
      exercises.every(
        (exercise: any) =>
          exerciseSets[exercise.programExerciseId] !== undefined
      );

    if (!isExerciseSetsSynced) {
      return; // Wait for exerciseSets to be synced with current workoutLog
    }

    const shouldBeCompleted = isWorkoutComplete;
    const currentStatus = currentWorkout.status;

    // Only update if status actually needs to change
    if (shouldBeCompleted && currentStatus === "incomplete") {
      updateWorkoutLogStatus({
        workoutLogId: currentWorkout.workoutLogId,
        status: "completed",
      })
        .unwrap()
        .catch((error) => {
          if (error?.data?.message) {
            toast.error(error.data.message);
          } else {
            toast.error("Failed to update workout status to completed");
          }
        });
    } else if (!shouldBeCompleted && currentStatus === "completed") {
      updateWorkoutLogStatus({
        workoutLogId: currentWorkout.workoutLogId,
        status: "incomplete",
      })
        .unwrap()
        .catch((error) => {
          if (error?.data?.message) {
            toast.error(error.data.message);
          } else {
            toast.error("Failed to update workout status to incomplete");
          }
        });
    }
  }, [
    isWorkoutComplete,
    workoutLog?.data[0]?.status,
    workoutLog?.data[0]?.workoutLogId,
    updateWorkoutLogStatus,
    selectedDate,
    exerciseSets,
  ]);

  useEffect(() => {
    if (workoutLog?.data.length > 0) {
      setWorkoutLogName(workoutLog?.data[0]?.title || "");
    }
  }, [workoutLog]);

  const handleCreateWorkoutLog = async () => {
    if (!workoutLogName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }

    try {
      const payload = {
        title: workoutLogName.trim(),
        workoutDate: format(selectedDate, "yyyy-MM-dd"),
      };

      await createManualWorkoutLog({
        userId: user?.user_id,
        programId: manualProgram?.programId,
        dayId: manualProgram?.workoutDays?.[0]?.dayId,
        payload,
      }).unwrap();

      toast.success("Workout log created successfully!");
      setWorkoutLogName(""); // Clear the form
      setIsModalOpen(false); // Close the modal only on success
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to create workout log. Please try again.");
      }
    }
  };

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

  const handleAddExercise = async (exercise: Exercise) => {
    if (!workoutLog?.data[0]?.workoutLogId) {
      toast.error("No workout log found. Please create a workout log first.");
      return;
    }

    try {
      const payload = {
        exerciseName: exercise.exerciseName,
        bodyPart: exercise.bodyPart,
        laterality: exercise.laterality,
        sets: exercise.sets,
        minReps: exercise.minReps,
        maxReps: exercise.maxReps,
        exerciseOrder: workoutLog?.data[0]?.workoutExercises.length + 1,
      };

      await addManualWorkoutExercise({
        workoutLogId: workoutLog.data[0].workoutLogId,
        programExerciseId: exercise.exerciseId,
        payload,
      }).unwrap();

      toast.success(`${exercise.exerciseName} added to workout log!`);
      setIsExerciseSelectionModalOpen(false);
    } catch (error: any) {
      console.error("Error adding exercise:", error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to add exercise to workout log. Please try again.");
      }
    }
  };

  const onSaveExerciseSets = async (exercisePayload: ExercisePayload) => {
    console.log(exercisePayload);
    if (
      exercisePayload.weight === 0 ||
      exercisePayload.repsLeft === 0 ||
      exercisePayload.repsRight === 0
    ) {
      return;
    }

    try {
      await addWorkoutSet({
        workoutExerciseId: getManualWorkoutExerciseId(
          exercisePayload.programExerciseId
        ),
        payload: exercisePayload,
      }).unwrap();
    } catch (err: any) {
      if (err?.data?.message) {
        toast.error(err.data.message);
      } else {
        toast.error("Failed to save workout log. Please try again.");
      }
    }
  };

  if (isLoadingWorkoutLog) {
    return <ProgramWorkoutLogSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <header
          className={`flex ${
            isMobile ? "flex-col gap-2" : "justify-between items-center"
          }`}
        >
          <div>
            {workoutLog?.data.length > 0 &&
              (isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    className="w-fit"
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
              ))}
            <span
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {format(selectedDate, "MMMM d, yyyy")}
            </span>
          </div>
          {workoutLog?.data.length > 0 && (
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
        </header>
        <main className="space-y-4">
          <div className="flex justify-end">
            {workoutLog?.data.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setIsExerciseSelectionModalOpen(true)}
              >
                <Plus className="w-3 h-3" />
                Add Exercise
              </Button>
            ) : (
              <CreateManualWorkoutLogModal
                logName={workoutLogName}
                setLogName={setWorkoutLogName}
                isLoading={isCreatingWorkoutLog}
                handleCreateWorkoutLog={handleCreateWorkoutLog}
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
              />
            )}
          </div>
          {workoutLog?.data.length > 0 ? (
            <div className="space-y-6">
              {workoutLog?.data?.[0]?.workoutExercises.length === 0 ? (
                <div className="flex justify-center items-center border border-dashed border-slate-300 rounded-lg h-[200px]">
                  <div>No exercises added yet</div>
                </div>
              ) : (
                getExercises().map((exercise) => (
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
                          <h4 className="font-medium">
                            {exercise.exerciseName}
                          </h4>
                          {isExerciseFullyLogged(exercise.exerciseId) && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Badge className="bg-green-600 text-white">
                                <Check className="h-2 w-2" />
                                Completed
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 my-1">
                          <Badge className="text-xs">
                            {exercise.laterality}
                          </Badge>
                          <Badge className="text-xs bg-blue-500 text-white">
                            {exercise.bodyPart}
                          </Badge>
                        </div>
                        <div
                          className={`text-sm ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Target: {exercise.sets} sets ×{" "}
                          {exercise.minReps === exercise.maxReps
                            ? exercise.minReps
                            : `${exercise.minReps}-${exercise.maxReps}`}{" "}
                          reps
                        </div>
                      </div>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-fit text-destructive hover:text-destructive/80"
                          onClick={() => {
                            setContext("Exercise");
                            setShowDeleteDialog(true);
                            setDeletingExerciseId(
                              getManualWorkoutExerciseId(exercise.exerciseId)
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <ExerciseTable
                      exercise={exercise}
                      exerciseSets={exerciseSets[exercise.exerciseId] || []}
                      updateSetData={updateSetData}
                      toggleSetLogged={toggleSetLogged}
                      isFieldInvalid={isFieldInvalid}
                      onSaveExerciseSets={onSaveExerciseSets}
                      isEditing={isEditing}
                      hasLoggedSets={hasLoggedSets(exercise.exerciseId)}
                      isMobile={isMobile}
                      showPrevious={false}
                      logType="manual"
                    />
                    <ExerciseNotes
                      exerciseNotes={exerciseNotes}
                      setExerciseNotes={setExerciseNotes}
                      getExerciseNotes={getExerciseNotes}
                      getWorkoutExerciseId={getManualWorkoutExerciseId}
                      hasAnyLoggedSets={hasLoggedSets(exercise.exerciseId)}
                      exercise={exercise}
                    />
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center border border-dashed border-slate-300 rounded-lg h-[200px]">
              No workout yet
            </div>
          )}
        </main>
      </div>
      <ExerciseSelectionModal
        dayId={manualProgram?.workoutDays?.[0]?.dayId || ""}
        isOpen={isExerciseSelectionModalOpen}
        setIsOpen={setIsExerciseSelectionModalOpen}
        onSelectExercise={handleAddExercise}
        isAddingExercise={isAddingExerciseToWorkoutLog}
      />
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
