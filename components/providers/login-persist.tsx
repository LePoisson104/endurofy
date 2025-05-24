"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "@/api/auth/auth-slice";

export default function LoginPersist({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token]);

  return <>{children}</>;
}
