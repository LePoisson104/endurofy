"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { formatNumberForDisplay } from "@/helper/display-number-format";

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  view: "remaining" | "consumed";
  bgColor: string;
}

// Helper function to format numbers based on unit type
const formatValue = (value: number, unit: string): string => {
  if (unit === "kcal") {
    return formatNumberForDisplay(Math.round(value).toFixed(2));
  }
  return formatNumberForDisplay(Number(value).toFixed(2));
};

// Helper function to get display text based on view mode
const getDisplayText = (
  view: "remaining" | "consumed",
  current: number,
  target: number,
  unit: string
): string => {
  if (view === "consumed") {
    const formattedCurrent = formatValue(current, unit);
    return `${formattedCurrent}/${target} ${unit}`;
  } else {
    const remaining = target - current;
    const formattedRemaining = formatValue(Math.abs(remaining), unit);

    // If remaining is negative (over target), show with plus sign
    if (remaining < 0) {
      return `+${formattedRemaining} ${unit}`;
    }

    return `${formattedRemaining} ${unit}`;
  }
};

export default function MacroProgressBar({
  label,
  current,
  target,
  unit,
  bgColor,
  color,
  icon,
  view,
}: MacroProgressBarProps) {
  const isMobile = useIsMobile();
  const actualPercentage = (current / target) * 100;
  const displayPercentage = Math.min(actualPercentage, 100);
  const isOverTarget = actualPercentage > 100;

  const displayText = getDisplayText(view, current, target, unit);

  return (
    <div
      className={`space-y-1 ${
        isMobile ? "flex-col" : "flex"
      } w-full items-center`}
    >
      <div
        className={`flex justify-between text-sm ${
          isMobile ? "w-full" : "w-[30%]"
        }`}
      >
        <span className="font-medium flex items-center gap-2">
          {icon}
          {label}
        </span>
      </div>
      <div className={`flex flex-col ${isMobile ? "w-full" : "w-[70%]"}`}>
        <div className="flex justify-between w-full">
          <span className="text-primary text-sm">{displayText}</span>
          <div
            className={`text-sm ${
              isOverTarget ? "text-red-500 font-medium" : "text-primary"
            }`}
          >
            {Math.round(actualPercentage)}%
          </div>
        </div>
        <div
          className={`relative w-full rounded-full h-2.5 ${
            view === "consumed" ? "bg-secondary" : `${bgColor}`
          }`}
        >
          <div
            className="h-2.5 transition-all duration-300 ease-in-out"
            style={{
              width: `${displayPercentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
