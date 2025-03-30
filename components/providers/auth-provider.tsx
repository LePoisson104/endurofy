"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRefreshMutation } from "@/api/auth/auth-api-slice";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import usePersist from "@/hooks/use-persist";
import { selectCurrentToken } from "@/api/auth/auth-slice";
import DotPulse from "@/components/dot-pulse";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { persist } = usePersist();
  const token = useSelector(selectCurrentToken);
  const effectRan = useRef(false);
  const router = useRouter();

  const [trueSuccess, setTrueSuccess] = useState(false);

  const [refresh, { isUninitialized, isLoading, isSuccess, isError }] =
    useRefreshMutation();

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
    content = children;
  } else if (token && isUninitialized) {
    content = children;
  }

  return content;
}
