"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRefreshMutation } from "@/api/auth/auth-api-slice";
import { useSelector } from "react-redux";
import usePersist from "@/hooks/use-persist";
import { selectCurrentToken, selectCurrentUser } from "@/api/auth/auth-slice";
import DotPulse from "@/components/global/dot-pulse";
import UsersProfileModal from "@/components/modals/users-profile-modal";
import { useGetAllUsersInfoQuery } from "@/api/user/user-api-slice";
import ProfileSuccessNotice from "@/components/modals/profile-success-notice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { persist } = usePersist();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const { data: userInfo } = useGetAllUsersInfoQuery(user?.user_id || "");
  const effectRan = useRef(false);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileSuccessNoticeOpen, setIsProfileSuccessNoticeOpen] =
    useState(false);
  const [trueSuccess, setTrueSuccess] = useState(false);
  const [refresh, { isUninitialized, isLoading, isSuccess, isError }] =
    useRefreshMutation();

  useEffect(() => {
    if (userInfo?.data?.profile_status === "incomplete") {
      setIsOpen(true);
    } else if (userInfo?.data?.profile_status === "complete") {
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    }
  }, [userInfo]);

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        console.log("Verifying refresh token...");
        await refresh().unwrap(); // Get the new token
        setTrueSuccess(true); // Mark successful refresh
      } catch (err) {
        console.log("Error refreshing token:", err);
      }
    };

    if (effectRan.current === true) {
      if (!token && persist) {
        verifyRefreshToken();
      }
    }

    return () => {
      effectRan.current = true; // Prevent re-runs in React Strict Mode
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, persist, refresh]);

  useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  let content;
  if (!persist) {
    content = children;
  } else if (isLoading) {
    content = (
      <div className="w-full h-screen flex justify-center items-center bg-background">
        <DotPulse />
      </div>
    );
  } else if (isSuccess && trueSuccess) {
    if (isOpen) {
      content = (
        <>
          {children}
          <UsersProfileModal
            isOpen={isOpen}
            profileStatus={userInfo?.data?.profile_status}
            setIsProfileSuccessNoticeOpen={setIsProfileSuccessNoticeOpen}
          />
        </>
      );
    } else {
      content = (
        <>
          <ProfileSuccessNotice open={isProfileSuccessNoticeOpen} />
          {children}
        </>
      );
    }
  } else if (token && isUninitialized) {
    if (isOpen) {
      content = (
        <>
          {children}
          <UsersProfileModal
            isOpen={isOpen}
            profileStatus={userInfo?.data?.profile_status}
            setIsProfileSuccessNoticeOpen={setIsProfileSuccessNoticeOpen}
          />
        </>
      );
    } else {
      content = (
        <>
          <ProfileSuccessNotice open={isProfileSuccessNoticeOpen} />
          {children}
        </>
      );
    }
  }

  return content;
}
