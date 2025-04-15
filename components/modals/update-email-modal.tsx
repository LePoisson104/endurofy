import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import ErrorAlert from "../alerts/error-alert";
import { Input } from "../ui/input";
import { useUpdateUsersEmailMutation } from "@/api/user/user-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useSelector } from "react-redux";
import VerifyOTPModal from "./verify-otp-modal";

export default function UpdateEmailModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const user = useSelector(selectCurrentUser);
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [error, setError] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [updateEmail, { isLoading: isUpdatingEmail }] =
    useUpdateUsersEmailMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newEmail !== confirmNewEmail) {
      setError("New email and confirm new email do not match");
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
        setError("No Server Response");
      } else if (error.status === 400) {
        setError(error.data?.message);
      } else if (error.status === 401) {
        setError(error.data?.message);
      } else {
        setError(error.data?.message);
      }
    }
  };

  return (
    <>
      <ErrorAlert error={error} setError={setError} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Update Email</DialogTitle>
            <DialogDescription>
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
              className="text-sm"
            />
            <Input
              placeholder="Confirm your new email"
              value={confirmNewEmail}
              onChange={(e) => setConfirmNewEmail(e.target.value)}
              className="text-sm"
            />

            <DialogFooter className="mt-4">
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
                className="w-[150px]"
              >
                {isUpdatingEmail ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Update Email"
                )}
              </Button>
            </DialogFooter>
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
