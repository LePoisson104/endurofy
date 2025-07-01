import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, SquarePen, Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import ExerciseSelectionModal from "@/components/modals/exercise-selection-modal";
import CreateManualWorkoutLogModal from "@/components/modals/create-manual-workout-log-modal";
import {
  useAddManualWorkoutExerciseMutation,
  useCreateManualWorkoutLogMutation,
  useGetWorkoutLogQuery,
  useUpdateWorkoutLogNameMutation,
  useDeleteWorkoutLogMutation,
  useGetPreviousWorkoutLogQuery,
} from "@/api/workout-log/workout-log-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { toast } from "sonner";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import DeleteProgramDialog from "@/components/dialog/delete-program";
import ExerciseTable from "./exercise-table";
import { useManualExerciseSets } from "@/hooks/use-manual-exercise-sets";

import type {
  WorkoutProgram,
  Exercise,
} from "@/interfaces/workout-program-interfaces";
import type { ExercisePayload } from "@/interfaces/workout-log-interfaces";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

  const [updateWorkoutLogName, { isLoading: isUpdatingWorkoutLogName }] =
    useUpdateWorkoutLogNameMutation();

  const [createManualWorkoutLog, { isLoading: isCreatingWorkoutLog }] =
    useCreateManualWorkoutLogMutation();

  const [
    addManualWorkoutExercise,
    { isLoading: isAddingExerciseToWorkoutLog },
  ] = useAddManualWorkoutExerciseMutation();

  const [deleteWorkoutLog, { isLoading: isDeletingWorkoutLog }] =
    useDeleteWorkoutLogMutation();

  const { data: workoutLog } = useGetWorkoutLogQuery({
    userId: user?.user_id,
    programId: manualProgram?.programId,
    startDate: format(selectedDate, "yyyy-MM-dd"),
    endDate: format(selectedDate, "yyyy-MM-dd"),
  });

  const { data: previousWorkoutLog } = useGetPreviousWorkoutLogQuery({
    userId: user?.user_id,
    programId: manualProgram?.programId,
    dayId: manualProgram?.workoutDays?.[0]?.dayId,
    currentWorkoutDate: format(selectedDate, "yyyy-MM-dd"),
  });

  // Use manual exercise sets hook for managing exercise data
  const {
    exerciseSets,
    updateSetData,
    toggleSetLogged,
    isFieldInvalid,
    isExerciseFullyLogged,
    hasLoggedSets,
    getWorkoutExerciseId,
    getExerciseNotes,
    getExercises,
  } = useManualExerciseSets(workoutLog, previousWorkoutLog, programs || []);

  useEffect(() => {
    setManualProgram(
      programs?.filter((program) => program.programType === "manual")?.[0] ||
        null
    );
  }, [programs]);

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
      await deleteWorkoutLog({
        workoutLogId: workoutLog?.data[0].workoutLogId,
      }).unwrap();
      toast.success("Workout log deleted");
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
    console.log("exercisePayload", exercisePayload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <header className="flex justify-between items-center">
          <div>
            {workoutLog?.data.length > 0 &&
              (isEditing ? (
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
                  onClick={() => setShowDeleteDialog(true)}
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
                    <div className="flex justify-between items-start">
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
                          Target: {exercise.sets} sets × {exercise.minReps}-
                          {exercise.maxReps} reps
                        </div>
                      </div>
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
                    />
                    <div className="space-y-2">
                      <Label htmlFor="workout-notes">
                        Exercise Notes
                        {/* <span className="text-sm text-slate-500">
                          {isUpdatingExerciseNotes
                            ? "(Saving...)"
                            : getExerciseNotes(
                                getWorkoutExerciseId(exercise.exerciseId)
                              ) !== ""
                            ? "(Saved)"
                            : "(Optional)"}
                        </span> */}
                      </Label>
                      <Textarea
                        id="workout-notes"
                        // placeholder={
                        //   hasAnyLoggedSets
                        //     ? "Add notes about this exercise... (max 200 characters)"
                        //     : "No sets logged yet"
                        // }
                        maxLength={200}
                        className="min-h-[80px]"
                        // value={getCurrentNoteValue(
                        //   getWorkoutExerciseId(exercise.exerciseId)
                        // )}
                        // onChange={(e) =>
                        //   handleNotesChange(
                        //     getWorkoutExerciseId(exercise.exerciseId),
                        //     e.target.value
                        //   )
                        // }
                        // disabled={!hasAnyLoggedSets}
                      />
                    </div>
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
        isOpen={isExerciseSelectionModalOpen}
        setIsOpen={setIsExerciseSelectionModalOpen}
        onSelectExercise={handleAddExercise}
        isAddingExercise={isAddingExerciseToWorkoutLog}
      />
      <DeleteProgramDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        handleDelete={handleDelete}
        isDeleting={isDeletingWorkoutLog}
        context="Log"
      />
    </div>
  );
}
