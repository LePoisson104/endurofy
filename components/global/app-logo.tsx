"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function AppLogo() {
  const isDark = useGetCurrentTheme();
  const [logoSrc, setLogoSrc] = useState("/images/endurofy_logo.png");

  useEffect(() => {
    setLogoSrc(
      isDark ? "/images/endurofy_logo_dark.png" : "/images/endurofy_logo.png"
    );
  }, [isDark]);

  return (
    <div className="flex items-center justify-center w-10 h-10 mb-2 bg-primary">
      <Image src={logoSrc} alt="Endurofy" width={30} height={30} />
    </div>
  );
}
