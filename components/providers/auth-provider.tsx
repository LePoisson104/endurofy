"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRefreshMutation } from "@/api/auth/auth-api-slice";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Loader2 } from "lucide-react";
import usePersist from "@/hooks/use-persist";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [persist] = usePersist();
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const effectRan = useRef(false);
  const router = useRouter();
  const [trueSuccess, setTrueSuccess] = useState(false);

  const [refresh, { isUninitialized, isLoading, isSuccess, isError }] =
    useRefreshMutation();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        console.log("Verifying refresh token...");
        await refresh().unwrap();
        setTrueSuccess(true);
      } catch (err) {
        console.error("Error refreshing token:", err);
      }
    };

    if (!token && persist) {
      verifyRefreshToken();
    }

    return () => {
      effectRan.current = true;
    };
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  } else if (isSuccess && trueSuccess) {
    content = children;
  } else if (token && isUninitialized) {
    content = children;
  }

  return content;
}
