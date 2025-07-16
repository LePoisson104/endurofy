"use client";

import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { useState } from "react";

interface WeekSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function WeekSelector({
  selectedDate,
  onSelectDate,
}: WeekSelectorProps) {
  const isDark = useGetCurrentTheme();
  const [currentDay, setCurrentDay] = useState(new Date());
  const weekStart = startOfWeek(currentDay, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(currentDay, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePreviousWeek = () => {
    const previousWeek = subWeeks(currentDay, 1);
    setCurrentDay(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(currentDay, 1);
    setCurrentDay(nextWeek);
  };

  const handleDaySelect = (date: Date) => {
    onSelectDate(date);
  };

  return (
    <div className="bg-card shadow-sm rounded-lg p-3">
      {/* Header with Month/Year and Navigation */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">
          {format(selectedDate, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousWeek}
            className="h-7 w-7 text-muted-foreground hover:text-foreground bg-foreground/20 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextWeek}
            className="h-7 w-7 text-muted-foreground hover:text-foreground bg-foreground/20 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Days Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Day Headers */}
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div
            key={`header-${index}`}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}

        {/* Date Buttons */}
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <Button
              key={day.toISOString()}
              variant="ghost"
              onClick={() => handleDaySelect(day)}
              className={cn(
                "h-10 w-full p-0 text-sm font-medium transition-all duration-200 rounded-md",
                "hover:bg-muted/50",
                isSelected && [
                  `shadow-sm ${
                    isDark
                      ? "bg-blue-500 text-blue-200"
                      : "bg-blue-200 text-blue-700 ring-1 ring-blue-500"
                  }`,
                  "hover:bg-blue-600 hover:text-white",
                ],
                isCurrentDay &&
                  !isSelected && [
                    `text-blue-700 ${isDark ? "bg-blue-200" : "bg-blue-100"}`,
                  ]
              )}
            >
              <span className="text-sm">{format(day, "dd")}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
