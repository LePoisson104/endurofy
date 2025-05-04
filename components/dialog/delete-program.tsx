import { Loader2 } from "lucide-react";
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

export default function DeleteProgramDialog({
  showDeleteDialog,
  setShowDeleteDialog,
  handleDeleteProgram,
  isDeleting,
}: {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  handleDeleteProgram: () => void;
  isDeleting: boolean;
}) {
  const isMobile = useIsMobile();

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workout Program</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this workout program? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDeleteProgram}
            variant="destructive"
            disabled={isDeleting}
            className={`${isMobile ? "w-full" : "w-[100px]"}`}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
