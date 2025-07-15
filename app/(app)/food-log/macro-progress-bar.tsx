"use client";

import { useIsMobile } from "@/hooks/use-mobile";

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}

export default function MacroProgressBar({
  label,
  current,
  target,
  unit,
  color,
  icon,
}: MacroProgressBarProps) {
  const isMobile = useIsMobile();
  const percentage = Math.min((current / target) * 100, 100);

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
            {Math.round(current)}/{target} {unit}
          </span>
          <div className="text-sm text-primary">{Math.round(percentage)}%</div>
        </div>
        <div className="relative w-full rounded-full h-2.5 bg-secondary">
          <div
            className="h-2.5 transition-all duration-300 ease-in-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: `${color}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
