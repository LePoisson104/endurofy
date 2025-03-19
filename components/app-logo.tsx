"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

const AppLogo = () => {
  const { theme, systemTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState("/images/endurofy_logo.png");

  useEffect(() => {
    const isDark =
      theme === "dark" || (theme === "system" && systemTheme === "dark");
    setLogoSrc(
      isDark ? "/images/endurofy_logo_dark.png" : "/images/endurofy_logo.png"
    );
  }, [theme, systemTheme]);

  return (
    <div className="flex items-center justify-center w-10 h-10 mb-2 bg-primary">
      <Image src={logoSrc} alt="Endurofy" width={30} height={30} />
    </div>
  );
};

export default AppLogo;
