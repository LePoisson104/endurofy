import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { useUpdateUsersEmailMutation } from "@/api/user/user-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useSelector } from "react-redux";
import VerifyOTPModal from "./verify-otp-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

export default function UpdateEmailModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const user = useSelector(selectCurrentUser);
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [updateEmail, { isLoading: isUpdatingEmail }] =
    useUpdateUsersEmailMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newEmail !== confirmNewEmail) {
      toast.error("New email and confirm new email do not match");
      return;
    }

    try {
      await updateEmail({
        userId: user?.user_id || "",
        email: user?.email || "",
        newEmail: newEmail,
        password: password,
      }).unwrap();
      setNewEmail("");
      setConfirmNewEmail("");
      setPassword("");
      setPendingEmail(newEmail);
      setIsOpen(false);
      setShowVerifyModal(true);
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else if (error.status === 400) {
        toast.error(error.data?.message);
      } else if (error.status === 401) {
        toast.error(error.data?.message);
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card">
          <DialogHeader className="mb-4">
            <DialogTitle>Update Email</DialogTitle>
            <DialogDescription className="text-left">
              Update your email address associated with your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              placeholder="Enter your new email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              placeholder="Confirm your new email"
              value={confirmNewEmail}
              onChange={(e) => setConfirmNewEmail(e.target.value)}
            />

            <div className="mt-4 flex justify-end">
              <Button
                variant="default"
                type="submit"
                disabled={
                  password === "" ||
                  newEmail === "" ||
                  confirmNewEmail === "" ||
                  newEmail !== confirmNewEmail ||
                  isUpdatingEmail
                }
                className={`${isMobile ? "w-full" : "w-[150px]"}`}
              >
                {isUpdatingEmail ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Update Email"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <VerifyOTPModal
        pendingEmail={pendingEmail}
        userId={user?.user_id || ""}
        isOpen={showVerifyModal}
        setIsOpen={setShowVerifyModal}
      />
    </>
  );
}
