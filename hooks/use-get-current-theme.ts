"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useGetCurrentTheme = (): boolean => {
  const [isDark, setIsDark] = useState(false);
  const { theme, systemTheme } = useTheme();
  useEffect(() => {
    setIsDark(
      theme === "dark" || (theme === "system" && systemTheme === "dark")
    );
  }, [theme, systemTheme]);
  return isDark;
};
