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
          <span className="text-primary text-sm">
            {view === "consumed"
              ? unit === "kcal"
                ? `${formatNumberForDisplay(
                    Math.round(current).toFixed(2)
                  )}/${target} ${unit}`
                : `${formatNumberForDisplay(
                    Number(current).toFixed(2)
                  )}/${target} ${unit}`
              : unit === "kcal"
              ? `${formatNumberForDisplay(
                  Math.round(target - Number(current)).toFixed(2)
                )} ${unit}`
              : `${formatNumberForDisplay(
                  Number(target - Number(current)).toFixed(2)
                )} ${unit}`}
          </span>
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
