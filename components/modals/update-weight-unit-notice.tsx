import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useUpdateUsersAndConvertWeightLogsMutation } from "@/api/user/user-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { UpdateUserInfo } from "@/interfaces/user-interfaces";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { convertDateForSubmission } from "@/lib/date-utils";
import { toast } from "sonner";

export default function UpdateWeightUnitNotice({
  isOpen,
  setIsOpen,
  editedProfile,
  setIsEditing,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editedProfile: UpdateUserInfo | null;
  setIsEditing: (isEditing: boolean) => void;
}) {
  const user = useSelector(selectCurrentUser);
  const isMobile = useIsMobile();
  const [updateUsersAndConvertWeightLogs, { isLoading }] =
    useUpdateUsersAndConvertWeightLogsMutation();

  const handleSubmit = async () => {
    const allFieldsFilled = editedProfile
      ? Object.values(editedProfile).every(
          (value) => value !== null && value !== undefined && value !== ""
        )
      : false;
    if (!allFieldsFilled) {
      toast.error("All fields are required");
      return;
    }

    try {
      if (!editedProfile) return;

      const submissionPayload = {
        ...editedProfile,
        birth_date: convertDateForSubmission(editedProfile.birth_date || ""),
      };

      await updateUsersAndConvertWeightLogs({
        userId: user?.user_id || "",
        payload: submissionPayload,
      }).unwrap();

      toast.success("Profile and weight logs updated successfully");
      setIsEditing(false);
      setIsOpen(false);
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else if (error.status === 400) {
        toast.error(error.data?.message);
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        className={`bg-card ${isMobile ? "w-[330px]" : "w-[350px]"}`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Notice</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Updating your weight unit will convert all weight and workout logs
            to match. This may take time depending on your log history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row justify-between gap-2">
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="w-1/2 border-none bg-foreground/20"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => {
              handleSubmit();
            }}
            className="w-1/2 border-none"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Proceed"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
