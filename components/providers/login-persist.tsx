"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/api/auth/auth-slice";

export function LoginPersistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useSelector(selectCurrentToken);

  console.log("token", token);
  useEffect(() => {
    console.log("token", token);

    if (token) {
      router.push("/dashboard");
    }
  }, [token]);

  return <>{children}</>;
}
