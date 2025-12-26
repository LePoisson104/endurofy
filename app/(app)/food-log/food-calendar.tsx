"use client";

import { useState } from "react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetFoddLogsDateQuery } from "@/api/food/food-log-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { getStartOfPreviousAndEndOfNextMonth } from "@/helper/get-day-range";

interface FoodCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

interface DayData {
  date: Date;
  calories: number;
  hasLogs: boolean;
}

export default function FoodCalendar({
  selectedDate,
  onSelectDate,
}: FoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const user = useSelector(selectCurrentUser);
  const { startDateOfPreviousMonth, endDateOfPreviousMonth } =
    getStartOfPreviousAndEndOfNextMonth({ currentMonth });

  const { data: foodLogs } = useGetFoddLogsDateQuery({
    userId: user?.user_id || "",
    startDate: startDateOfPreviousMonth || "",
    endDate: endDateOfPreviousMonth || "",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Get the start and end of the calendar view (complete weeks)
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Get all days to display (including previous/next month days)
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Handle month navigation
  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  };

  const hasFoodLog = (date: Date): DayData | undefined => {
    return foodLogs?.data?.logs.find((day: any) =>
      isSameDay(parseISO(day.log_date.split("T")[0] + "T06:00:00.000Z"), date)
    );
  };

  const hasCompletedFoodLog = (date: Date): boolean => {
    return (
      foodLogs?.data?.logs.find((day: any) =>
        isSameDay(parseISO(day.log_date.split("T")[0] + "T06:00:00.000Z"), date)
      )?.status === "completed"
    );
  };

  // Group days by weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Add all days of the calendar view
  calendarDays.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  // Add the last week if it's not empty
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 text-center text-xs text-primary">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayHasLogs = hasFoodLog(day);
              const dayCompleted = hasCompletedFoodLog(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div key={dayIndex} className="relative">
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
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded-[2px]"></div>
          <span>Has Logged Food</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="border-b border-2 rounded-full border-green-600 dark:border-green-400 w-[23px]" />
          <span>Completed Food Log</span>
        </div>
      </div>
    </div>
  );
}
