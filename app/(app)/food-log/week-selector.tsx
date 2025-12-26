"use client";

import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useGetFoddLogsDateQuery } from "@/api/food/food-log-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { getStartOfPreviousAndEndOfNextMonth } from "@/helper/get-day-range";

interface WeekSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  setIsCalendarModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function WeekSelector({
  selectedDate,
  onSelectDate,
  setIsCalendarModalOpen,
}: WeekSelectorProps) {
  const user = useSelector(selectCurrentUser);
  const [currentDay, setCurrentDay] = useState(new Date());
  const weekStart = startOfWeek(currentDay, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(currentDay, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { startDateOfPreviousMonth, endDateOfPreviousMonth } =
    getStartOfPreviousAndEndOfNextMonth({ currentMonth: currentDay });

  const { data: foodLogs } = useGetFoddLogsDateQuery({
    userId: user?.user_id || "",
    startDate: startDateOfPreviousMonth || "",
    endDate: endDateOfPreviousMonth || "",
  });

  const hasLogDay = (date: Date): boolean => {
    return foodLogs?.data?.logs.find((day: any) =>
      isSameDay(day.log_date.split("T")[0] + "T06:00:00.000Z", date)
    );
  };

  const hasCompletedLogDay = (date: Date): boolean => {
    return (
      foodLogs?.data?.logs.find((day: any) =>
        isSameDay(day.log_date.split("T")[0] + "T06:00:00.000Z", date)
      )?.status === "completed"
    );
  };

  const handlePreviousWeek = () => {
    const previousWeek = subWeeks(currentDay, 1);
    setCurrentDay(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(currentDay, 1);
    setCurrentDay(nextWeek);
  };

  return (
    <div className="bg-card shadow-sm rounded-lg p-3">
      {/* Header with Month/Year and Navigation */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground gap-1 flex items-center">
          <Button
            variant="ghost"
            onClick={() => setIsCalendarModalOpen(true)}
            className=""
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
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
        {weekDays.map((day, dayIndex) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const dayHasLogs = hasLogDay(day);
          const dayCompleted = hasCompletedLogDay(day);
          const isCurrentMonth = isSameMonth(day, currentDay);

          return (
            <div key={dayIndex} className="relative m-[1px]">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 w-full p-0 font-normal relative",
                  isSelected &&
                    `bg-blue-100 dark:bg-blue-900 ring-1 ${
                      dayHasLogs
                        ? "dark:ring-green-300 text-primary ring-green-500"
                        : "dark:ring-blue-500 ring-blue-500 text-blue-600 dark:text-blue-300"
                    } hover:bg-blue-200/50 dark:hover:bg-blue-800/50`,
                  isToday &&
                    !isSelected &&
                    `border-2 border-blue-600 dark:border-blue-300 ${
                      dayHasLogs
                        ? "border-green-600 dark:border-green-300"
                        : "border-blue-200 dark:border-blue-300"
                    }`,
                  !isCurrentMonth && "text-slate-500 dark:text-slate-400",
                  dayHasLogs &&
                    "bg-green-200 dark:bg-green-700 hover:bg-green-300 dark:hover:bg-green-600"
                )}
                onClick={() => onSelectDate(day)}
              >
                <div className="flex flex-col items-center justify-center">
                  <span>{format(day, "d")}</span>
                  {dayCompleted && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 dark:bg-green-400 rounded-full mx-1" />
                  )}
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
