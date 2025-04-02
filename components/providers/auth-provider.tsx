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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { persist } = usePersist();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const { data: userInfo } = useGetAllUsersInfoQuery(user?.user_id || "");
  const effectRan = useRef(false);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [trueSuccess, setTrueSuccess] = useState(false);
  const [refresh, { isUninitialized, isLoading, isSuccess, isError }] =
    useRefreshMutation();

  useEffect(() => {
    if (userInfo?.data?.profile_status === "incomplete") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
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
  }, [token, persist, refresh, userInfo]);

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
            userId={user?.user_id || ""}
            email={user?.email || ""}
          />
        </>
      );
    } else {
      content = children;
    }
  } else if (token && isUninitialized) {
    content = children;
  }

  return content;
}
