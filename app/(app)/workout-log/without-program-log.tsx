import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Button } from "@/components/ui/button";
import { Check, SquarePen, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import ExerciseSelectionModal from "@/components/modals/exercise-selection-modal";
import { Exercise } from "@/interfaces/workout-program-interfaces";

export default function WithoutProgramLog({
  selectedDate,
}: {
  selectedDate: Date;
}) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [workoutName, setWorkoutName] = useState("Workout Name");
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
          <div className="flex gap-1 items-center">
            {isEditing ? (
              <Input
                value={workoutName}
                placeholder="Workout Name"
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-fit"
              />
            ) : (
              <h2 className="text-xl font-bold">{workoutName}</h2>
            )}
            {isEditing ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditWorkoutName}
              >
                <Check className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <SquarePen className="w-3 h-3" />
              </Button>
            )}
          </div>
          <span
            className={`text-sm ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {format(selectedDate, "MMMM d, yyyy")}
          </span>
        </header>
        <main className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => setIsExerciseSelectionModalOpen(true)}
            >
              <Plus className="w-3 h-3" />
              Add Exercise
            </Button>
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
