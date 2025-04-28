import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExerciseForm } from "@/app/(app)/my-programs/exercise-form";
import { Button } from "../ui/button";

export default function AddExerciseModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-4 w-fit">Add Exercise</Button>
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <ExerciseForm onAddExercise={() => {}} />
      </DialogContent>
    </Dialog>
  );
}
