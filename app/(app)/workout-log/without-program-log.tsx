import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Button } from "@/components/ui/button";
import { Check, SquarePen, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import ExerciseSelectionModal from "@/components/modals/exercise-selection-modal";
import { Exercise } from "@/interfaces/workout-program-interfaces";
import CreateManualWorkoutLogModal from "@/components/modals/create-manual-workout-log-modal";

export default function WithoutProgramLog({
  selectedDate,
}: {
  selectedDate: Date;
}) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [isExerciseSelectionModalOpen, setIsExerciseSelectionModalOpen] =
    useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  const handleSelectExercise = (exercise: Exercise) => {
    console.log("Selected exercise:", exercise);
    // TODO: Add exercise to workout log
  };

  const handleEditWorkoutName = () => {
    if (workoutName === "") {
      setWorkoutName("Workout Name");
      setIsEditing(false);
      return;
    }

    // TODO: Call API to update workout name
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <header className="flex flex-col">
          <span
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {format(selectedDate, "MMMM d, yyyy")}
          </span>
        </header>
        <main className="space-y-4">
          <div className="flex justify-end">
            <CreateManualWorkoutLogModal
              logName={workoutName}
              setLogName={setWorkoutName}
              isLoading={false}
              setIsOpen={() => {}}
            />
            {/* <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setIsExerciseSelectionModalOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Add Exercise
            </Button> */}
          </div>
          <div className="flex justify-center items-center border border-dashed border-slate-300 rounded-lg h-[200px]">
            No workout yet
          </div>
        </main>
      </div>
      <ExerciseSelectionModal
        isOpen={isExerciseSelectionModalOpen}
        setIsOpen={setIsExerciseSelectionModalOpen}
        onSelectExercise={handleSelectExercise}
        isAddingExercise={isAddingExercise}
      />
    </div>
  );
}
