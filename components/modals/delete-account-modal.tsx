"use client";
import { Button } from "../ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Dialog } from "../ui/dialog";
import { PasswordInput } from "../ui/password-input";
import { useDeleteUsersAccountMutation } from "@/api/user/user-api-slice";
import { useState } from "react";
import { useLogoutMutation } from "@/api/auth/auth-api-slice";
import ErrorAlert from "../alerts/error-alert";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { Loader2 } from "lucide-react";

export default function DeleteAccountModal() {
  const user = useSelector(selectCurrentUser);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleteAccount, { isLoading }] = useDeleteUsersAccountMutation();
  const [logout] = useLogoutMutation();

  const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      await deleteAccount({
        user_id: user?.user_id || "",
        email: user?.email || "",
        password,
      }).unwrap();
      await logout();
    } catch (error: any) {
      if (!error.status) {
        setError("No Server Response");
      } else if (error.status === 400) {
        setError(error.data?.message);
      } else if (error.status === 401 || error.status === 404) {
        setError("Incorrect password. Try again.");
      } else {
        setError(error.data?.message);
      }
    }
  };

  return (
    <Dialog>
      <ErrorAlert error={error} setError={setError} />
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This action cannot be undone. All your data will be permanently
          removed.
        </DialogDescription>

        <form onSubmit={handleDeleteAccount}>
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-4 flex justify-end">
            <Button
              variant="destructive"
              type="submit"
              disabled={password === "" || isLoading}
              className="w-[150px]"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete Account"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
