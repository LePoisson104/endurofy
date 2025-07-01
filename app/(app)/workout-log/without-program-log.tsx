import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Button } from "@/components/ui/button";
import { Check, SquarePen, Plus, Divide } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import ExerciseSelectionModal from "@/components/modals/exercise-selection-modal";
import { Exercise } from "@/interfaces/workout-program-interfaces";
import CreateManualWorkoutLogModal from "@/components/modals/create-manual-workout-log-modal";
import {
  useAddManualWorkoutExerciseMutation,
  useCreateManualWorkoutLogMutation,
  useGetWorkoutLogQuery,
} from "@/api/workout-log/workout-log-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { toast } from "sonner";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";

import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";
import ExerciseTable from "./exercise-table";

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
  const [workoutName, setWorkoutName] = useState("");
  const [isExerciseSelectionModalOpen, setIsExerciseSelectionModalOpen] =
    useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [createManualWorkoutLog, { isLoading: isCreatingWorkoutLog }] =
    useCreateManualWorkoutLogMutation();
  const [
    addManualWorkoutExercise,
    { isLoading: isAddingExerciseToWorkoutLog },
  ] = useAddManualWorkoutExerciseMutation();
  const { data: workoutLog } = useGetWorkoutLogQuery({
    userId: user?.user_id,
    programId: manualProgram?.programId,
    startDate: format(selectedDate, "yyyy-MM-dd"),
    endDate: format(selectedDate, "yyyy-MM-dd"),
  });

  useEffect(() => {
    setManualProgram(
      programs?.filter((program) => program.programType === "manual")?.[0] ||
        null
    );
  }, [programs]);

  useEffect(() => {
    if (workoutLog?.data.length > 0) {
      setWorkoutName(workoutLog?.data[0]?.title || "");
    }
  }, [workoutLog]);

  const handleSelectExercise = (exercise: Exercise) => {
    console.log("Selected exercise:", exercise);
    // TODO: Add exercise to workout log
  };

  const handleCreateWorkoutLog = async () => {
    if (!workoutName.trim()) {
      toast.error("Please enter a workout name");
      return;
    }

    try {
      const payload = {
        title: workoutName.trim(),
        workoutDate: format(selectedDate, "yyyy-MM-dd"),
      };

      await createManualWorkoutLog({
        userId: user?.user_id,
        programId: manualProgram?.programId,
        dayId: manualProgram?.workoutDays?.[0]?.dayId,
        payload,
      }).unwrap();

      toast.success("Workout log created successfully!");
      setWorkoutName(""); // Clear the form
      setIsModalOpen(false); // Close the modal only on success
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to create workout log. Please try again.");
      }
    }
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
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <Check className="h-4 w-4" />
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <SquarePen className="h-4 w-4" />
            {isEditing ? "Done" : "Edit"}
          </Button>
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
                logName={workoutName}
                setLogName={setWorkoutName}
                isLoading={isCreatingWorkoutLog}
                handleCreateWorkoutLog={handleCreateWorkoutLog}
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
              />
            )}
          </div>
          {workoutLog?.data.length > 0 ? (
            <div className="flex justify-center items-center border border-dashed border-slate-300 rounded-lg h-[200px]">
              {workoutLog?.data?.[0]?.workoutExercises.length === 0 ? (
                <div>No exercises added yet</div>
              ) : (
                // exercise table
                <div></div>
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
        onSelectExercise={handleSelectExercise}
        isAddingExercise={isAddingExerciseToWorkoutLog}
      />
    </div>
  );
}
