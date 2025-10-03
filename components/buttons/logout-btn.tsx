"use client";

import { useLogoutMutation } from "@/api/auth/auth-api-slice";
import { useRouter } from "next/navigation";

export default function LogoutBtn({
  className,
  icon,
}: {
  className: string;
  icon: React.ReactNode;
}) {
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    }
  };

  return (
    <button onClick={handleLogout} className={className}>
      {icon}
      Log out
    </button>
  );
}
