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
  handleDelete,
  isDeleting,
  context,
}: {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  handleDelete: () => void;
  isDeleting: boolean;
  context: string;
}) {
  const isMobile = useIsMobile();

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workout {context}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this workout {context}? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row justify-between gap-2">
          <AlertDialogCancel className="w-1/2">Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
            className={`${isMobile ? "w-full" : "w-[100px]"} w-1/2`}
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
