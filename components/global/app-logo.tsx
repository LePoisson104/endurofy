"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function AppLogo({ size = 45 }: { size?: number }) {
  const isDark = useGetCurrentTheme();
  const [logoSrc, setLogoSrc] = useState("/images/endurofy_logo.png");

  useEffect(() => {
    setLogoSrc(
      !isDark ? "/images/endurofy_logo_dark.png" : "/images/endurofy_logo.png"
    );
  }, [isDark]);

  return (
    <div className="flex items-center justify-center p-0">
      <Image src={logoSrc} alt="Endurofy" width={size} height={size} />
    </div>
  );
}
