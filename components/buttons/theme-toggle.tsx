"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useToggleThemeMutation } from "@/api/settings/settings-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";

export function ThemeToggle({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const [toggleTheme] = useToggleThemeMutation();
  const user = useSelector(selectCurrentUser);

  const handleThemeToggle = async ({ theme }: { theme: string }) => {
    try {
      await toggleTheme({ userId: user?.user_id, theme });
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
    <div className="flex flex-col gap-1">
      <Button
        variant="ghost"
        onClick={() => handleThemeToggle({ theme: "light" })}
        className={`flex items-center w-full justify-start h-9 rounded-sm ${
          theme === "light" ? "bg-accent font-medium" : "hover:bg-accent"
        }`}
      >
        <Sun className="mr-1 h-4 w-4 text-muted-foreground" />
        <span>Light</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => handleThemeToggle({ theme: "dark" })}
        className={`flex items-center w-full justify-start h-9 rounded-sm ${
          theme === "dark" ? "bg-accent font-medium" : "hover:bg-accent"
        }`}
      >
        <Moon className="mr-1 h-4 w-4 text-muted-foreground" />
        <span>Dark</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => handleThemeToggle({ theme: "system" })}
        className={`flex items-center w-full justify-start h-9 rounded-sm ${
          theme === "system" ? "bg-accent font-medium" : "hover:bg-accent"
        }`}
      >
        <Laptop className="mr-1 h-4 w-4 text-muted-foreground" />
        <span>System</span>
      </Button>
    </div>
  );
}
