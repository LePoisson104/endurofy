"use client";

import { Button } from "@/components/ui/button";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function ContinueBtn({
  onClick,
  disabled,
  label = "Continue",
}: {
  onClick: () => void;
  disabled: boolean;
  label?: string;
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
      {label}
    </Button>
  );
}
