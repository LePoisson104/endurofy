import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AddExerciseWarning({
  showAddExerciseWarning,
  setShowAddExerciseWarning,
}: {
  showAddExerciseWarning: boolean;
  setShowAddExerciseWarning: (show: boolean) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <AlertDialog
      open={showAddExerciseWarning}
      onOpenChange={setShowAddExerciseWarning}
    >
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Add Exercise</AlertDialogTitle>
          <AlertDialogDescription>
            Please add a day name to the workout program before adding an
            exercise.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            className={`${isMobile ? "w-full" : "w-[100px]"}`}
            onClick={() => setShowAddExerciseWarning(false)}
          >
            Dismiss
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
