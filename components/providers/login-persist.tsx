"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "@/api/auth/auth-slice";
import { useRefreshMutation } from "@/api/auth/auth-api-slice";
import DotPulse from "@/components/global/dot-pulse";

export function LoginPersistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  const [isInitializing, setIsInitializing] = useState(true);
  const [refresh, { isLoading: isRefreshing }] = useRefreshMutation();

  // Define public routes that authenticated users should be redirected from
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/",
  ];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if authenticated user is on public route (should show loading before redirect)
  const shouldShowLoadingForRedirect =
    !isInitializing && !isRefreshing && token && user && isPublicRoute;

  const verifyRefreshToken = async () => {
    try {
      await refresh().unwrap();
    } catch (err) {
      console.log("Error refreshing token globally");
    } finally {
      setIsInitializing(false);
    }
  };

  // Initialize authentication state on mount
  useEffect(() => {
    verifyRefreshToken();
  }, []);

  // Handle cross-tab authentication persistence
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth-state-changed") {
        // Trigger a refresh to sync auth state across tabs
        verifyRefreshToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Redirect logic for authenticated users on public routes
  useEffect(() => {
    if (shouldShowLoadingForRedirect) {
      router.push("/dashboard");
    }
  }, [shouldShowLoadingForRedirect, router]);

  // Show loading while initializing, refreshing, or redirecting authenticated users from public routes
  if (isInitializing || isRefreshing || shouldShowLoadingForRedirect) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-background">
        <DotPulse />
      </div>
    );
  }

  return <>{children}</>;
}
