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
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Loader2 } from "lucide-react";

export default function AddExerciseConfirmDialog({
  showDeleteDialog,
  setShowDeleteDialog,
  exerciseName,
  setIsAddingExercise,
  isAddingExercise,
}: {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  exerciseName: string;
  setIsAddingExercise: () => void;
  isAddingExercise: boolean;
}) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent
        className={`bg-card ${isMobile ? "w-[330px]" : "w-[350px]"} border`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Add Exercise
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to add this{" "}
            <span
              className={`font-medium ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              {exerciseName}
            </span>{" "}
            exercise?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row justify-between gap-2">
          <AlertDialogCancel className="w-1/2 border-none bg-foreground/20">
            Cancel
          </AlertDialogCancel>
          <Button
            className={`${isMobile ? "w-full" : "w-[100px]"} w-1/2`}
            onClick={setIsAddingExercise}
            disabled={isAddingExercise}
          >
            {isAddingExercise ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              "Add Exercise"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
