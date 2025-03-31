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
import { useGetAllUsersInfoQuery } from "@/api/user/user-api-slice";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { convertDateFormat } from "@/helper/convert-date-format";

export function AccountSettings() {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const { data: userInfo } = useGetAllUsersInfoQuery(user?.user_id);
  const [updateFirstName, setUpdateFirstName] = useState("");
  const [updateLastName, setUpdateLastName] = useState("");
  const lastUpdated = convertDateFormat(userInfo?.data?.user_updated_at);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setUpdateFirstName(userInfo?.data?.first_name || "");
    setUpdateLastName(userInfo?.data?.last_name || "");
  }, [userInfo]);

  return (
    <div className=" flex flex-col gap-[1rem]">
      {userInfo ? (
        <>
          <div className="mb-4">
            <PageTitle
              title="Account Settings"
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
              <form className="space-y-4">
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
                <Button type="submit">Update name</Button>
              </form>
            </CardContent>
          </Card>
          {/* change email card */}
          <Card>
            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>
                Change your email address associated with your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder={userInfo?.data?.email}
                  disabled
                  className={
                    isDark
                      ? "placeholder:text-gray-300"
                      : "placeholder:text-black"
                  }
                />
                <UpdateEmailModal />
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
              <form className="space-y-2">
                <Label>Current Password</Label>
                <PasswordInput
                  placeholder="********"
                  type="password"
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
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <PasswordInput
                      placeholder="********"
                      type="password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!password || !confirmPassword || !newPassword}
                >
                  Update password
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
