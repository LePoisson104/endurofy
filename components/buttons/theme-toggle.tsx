"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useToggleThemeMutation } from "@/api/settings/settings-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";

export function ThemeToggle({
  onClose,
  className,
}: {
  onClose: () => void;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [toggleTheme] = useToggleThemeMutation();
  const user = useSelector(selectCurrentUser);

  const handleThemeToggle = async (selectedTheme: string) => {
    try {
      await toggleTheme({ userId: user?.user_id, theme: selectedTheme });
      setTheme(selectedTheme);
      onClose();
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Error while trying to toggle theme");
      }
    }
  };

  return (
    <>
      <div className="p-2 text-sm font-medium border-b">Theme</div>
      <div className={className}>
        <button
          onClick={() => handleThemeToggle("light")}
          className={`flex items-center w-full text-left h-9 px-2 rounded-sm hover:bg-accent ${
            theme === "light" ? "bg-accent font-medium" : ""
          }`}
        >
          <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Light</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleThemeToggle("dark")}
          className={`flex items-center w-full text-left h-9 px-2 rounded-sm hover:bg-accent ${
            theme === "dark" ? "bg-accent font-medium" : ""
          }`}
        >
          <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Dark</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleThemeToggle("system")}
          className={`flex items-center w-full text-left h-9 px-2 rounded-sm hover:bg-accent ${
            theme === "system" ? "bg-accent font-medium" : ""
          }`}
        >
          <Laptop className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>System</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      </div>
    </>
  );
}
