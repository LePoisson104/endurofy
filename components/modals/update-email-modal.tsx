import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import ErrorAlert from "../alerts/error-alert";
import SuccessAlert from "../alerts/success-alert";
import { Input } from "../ui/input";

export default function UpdateEmailModal() {
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <Dialog>
      <ErrorAlert error={error} setError={setError} />
      <SuccessAlert success={success} setSuccess={setSuccess} />
      <DialogTrigger asChild>
        <Button variant="default">Update Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Email</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Update your email address associated with your account.
        </DialogDescription>
        <form className="space-y-4">
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

          <DialogFooter className="mt-4">
            <Button
              variant="default"
              type="submit"
              //   disabled={isLoading}
              className="w-[150px]"
            >
              {false ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Update Email"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
