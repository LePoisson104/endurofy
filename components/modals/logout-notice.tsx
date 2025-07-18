import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/api/auth/auth-api-slice";
import { useRouter } from "next/navigation";

export default function LogoutNotice({ isOpen }: { isOpen: boolean }) {
  const [logout] = useLogoutMutation();
  const router = useRouter();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Notice</AlertDialogTitle>
          <AlertDialogDescription>
            Your email has been successfully updated! To ensure your account
            security, please log out and sign in again using your new email
            address. This will help refresh your session and apply the changes
            securely.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Log out
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
