import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExerciseForm } from "@/app/(app)/my-programs/exercise-form";

export default function AddExerciseModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <ExerciseForm onAddExercise={() => {}} />
      </DialogContent>
    </Dialog>
  );
}
