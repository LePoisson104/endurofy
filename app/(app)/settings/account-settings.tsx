"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import PageTitle from "@/components/global/page-title";
import DeleteAccountModal from "@/components/modals/delete-account-modal";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import UpdateEmailModal from "@/components/modals/update-email-modal";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { PasswordInput } from "@/components/ui/password-input";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { parseDateAndTimeSafely } from "@/helper/parse-date-safely";
import {
  useUpdateUsersNameMutation,
  useUpdateUsersPasswordMutation,
} from "@/api/user/user-api-slice";

import { Loader2 } from "lucide-react";
import VerifyOTPModal from "@/components/modals/verify-otp-modal";
import { selectUserInfo } from "@/api/user/user-slice";
import { toast } from "sonner";

export function AccountSettings() {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const userInfo = useSelector(selectUserInfo);

  const [updateFirstName, setUpdateFirstName] = useState("");
  const [updateLastName, setUpdateLastName] = useState("");
  const lastUpdated = parseDateAndTimeSafely(userInfo?.user_updated_at || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showUpdateEmailModal, setShowUpdateEmailModal] = useState(false);

  const [updateUsersName, { isLoading: isUpdatingName }] =
    useUpdateUsersNameMutation();
  const [updateUsersPassword, { isLoading: isUpdatingPassword }] =
    useUpdateUsersPasswordMutation();

  useEffect(() => {
    setUpdateFirstName(userInfo?.first_name || "");
    setUpdateLastName(userInfo?.last_name || "");
  }, [userInfo]);

  const handleUpdateName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!updateFirstName || !updateLastName) {
      toast.error("Please enter a valid name");
      return;
    }

    try {
      await updateUsersName({
        userId: user?.user_id,
        payload: { firstName: updateFirstName, lastName: updateLastName },
      }).unwrap();
      toast.success("Name updated successfully");
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

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Make sure new password and confirm password match");
      return;
    }
    try {
      await updateUsersPassword({
        userId: user?.user_id,
        payload: {
          email: userInfo?.email,
          password: password,
          newPassword: newPassword,
        },
      }).unwrap();
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
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
    <div className=" flex flex-col gap-[1rem]">
      {userInfo.email !== "" ? (
        <>
          <div className="mb-4">
            <PageTitle
              title="Account Settings"
              showCurrentDateAndTime={false}
              subTitle={`Last updated: ${lastUpdated}`}
            />
          </div>
          {/* change name card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Name</CardTitle>
              <CardDescription>
                Change your name associated with your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleUpdateName}>
                <div
                  className={`flex ${
                    isMobile ? "flex-col" : "flex-row"
                  } gap-4 w-full`}
                >
                  <div className="space-y-2 w-full">
                    <Label>First Name</Label>
                    <Input
                      value={updateFirstName}
                      onChange={(e) => setUpdateFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label>Last Name</Label>
                    <Input
                      value={updateLastName}
                      onChange={(e) => setUpdateLastName(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={
                    isUpdatingName ||
                    !updateFirstName ||
                    !updateLastName ||
                    (updateFirstName === userInfo?.first_name &&
                      updateLastName === userInfo?.last_name)
                  }
                  className="w-[120px]"
                >
                  {isUpdatingName ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Update name"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          {/* change email card */}
          <Card>
            <VerifyOTPModal
              pendingEmail={userInfo?.pending_email || ""}
              userId={user?.user_id || ""}
              isOpen={showVerifyModal}
              setIsOpen={setShowVerifyModal}
            />
            <UpdateEmailModal
              isOpen={showUpdateEmailModal}
              setIsOpen={setShowUpdateEmailModal}
            />

            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>
                Change your email address associated with your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder={userInfo?.email}
                  disabled
                  className={
                    isDark
                      ? "placeholder:text-gray-300"
                      : "placeholder:text-black"
                  }
                />
                {userInfo?.pending_email ? (
                  <Button
                    variant="default"
                    onClick={() => setShowVerifyModal(true)}
                  >
                    Verify Email
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => setShowUpdateEmailModal(true)}
                  >
                    Update Email
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to maintain account security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-2" onSubmit={handleUpdatePassword}>
                <Label>Current Password</Label>
                <PasswordInput
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div
                  className={`grid ${
                    isMobile ? "grid-cols-1" : "grid-cols-2"
                  } gap-4 mb-4 mt-4`}
                >
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <PasswordInput
                      placeholder="********"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <PasswordInput
                      placeholder="********"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!password || !confirmPassword || !newPassword}
                  className="w-[150px]"
                >
                  {isUpdatingPassword ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Update password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. All your data will be
                  permanently removed.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <DeleteAccountModal />
            </CardFooter>
          </Card>
        </>
      ) : (
        <>
          <Skeleton className="w-full h-[90px]" />
          <Skeleton className="w-full h-[200px]" />
          <Skeleton className="w-full h-[200px]" />
          <Skeleton className="w-full h-[230px]" />
          <Skeleton className="w-full h-[250px]" />
        </>
      )}
    </div>
  );
}
