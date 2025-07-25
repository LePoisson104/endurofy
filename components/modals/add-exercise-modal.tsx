import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseForm } from "@/components/form/exercise-form";
import type { Exercise } from "@/interfaces/workout-program-interfaces";

export default function AddExerciseModal({
  isOpen,
  setIsOpen,
  onAddExercise,
  isAddingExercise,
  title,
  initialExercise,
  isEditing = false,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddExercise?: (exercise: Exercise) => void;
  isAddingExercise: boolean;
  title?: string;
  initialExercise?: Partial<Exercise>;
  isEditing?: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle>{title || "Add Exercise"}</DialogTitle>
        </DialogHeader>
        <ExerciseForm
          onAddExercise={(exercise) => {
            if (onAddExercise) {
              onAddExercise(exercise);
              setIsOpen(false);
            }
          }}
          isAddingExercise={isAddingExercise}
          initialExercise={initialExercise}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
}
