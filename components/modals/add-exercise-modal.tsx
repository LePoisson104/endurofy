import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseForm } from "@/app/(app)/my-programs/exercise-form";
import type { Exercise } from "@/interfaces/workout-program-interfaces";

export default function AddExerciseModal({
  isOpen,
  setIsOpen,
  onAddExercise,
  isAddingExercise,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddExercise?: (exercise: Exercise) => void;
  isAddingExercise: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <ExerciseForm
          onAddExercise={(exercise) => {
            if (onAddExercise) {
              onAddExercise(exercise);
              setIsOpen(false);
            }
          }}
          isAddingExercise={isAddingExercise}
        />
      </DialogContent>
    </Dialog>
  );
}
