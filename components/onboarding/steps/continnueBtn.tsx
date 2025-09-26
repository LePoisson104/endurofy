"use client";

import { Button } from "@/components/ui/button";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Loader2 } from "lucide-react";

export default function ContinueBtn({
  onClick,
  disabled,
  label = "Continue",
  isLoading = false,
}: {
  onClick: () => void;
  disabled: boolean;
  label?: string;
  isLoading?: boolean;
}) {
  const isDark = useGetCurrentTheme();

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-white ${
        isDark
          ? "bg-blue-500 hover:bg-blue-600"
          : "bg-blue-400 hover:bg-blue-500"
      }`}
      size="lg"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : label}
    </Button>
  );
}
