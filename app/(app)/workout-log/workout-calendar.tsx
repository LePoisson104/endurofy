"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek,
  endOfWeek,
  isAfter,
  startOfDay,
  isWithinInterval,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WorkoutProgram,
  WorkoutDay,
} from "../../../interfaces/workout-program-interfaces";
import { getDayRange } from "@/helper/get-day-range";

interface WorkoutCalendarProps {
  workoutLogs: any[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  program?: WorkoutProgram;
}

export function WorkoutCalendar({
  workoutLogs,
  selectedDate,
  onSelectDate,
  program,
}: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Get the start of the week containing the first day of the month
  const calendarStart = startOfWeek(monthStart);
  // Get the end of the week containing the last day of the month
  const calendarEnd = endOfWeek(monthEnd);

  // Get all days for the calendar view
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Get current week interval
  const currentWeekStart = startOfWeek(new Date());
  const currentWeekEnd = endOfWeek(new Date());

  // Check if a day has a workout log
  const hasWorkout = (day: Date) => {
    return workoutLogs.some((log) => isSameDay(parseISO(log.date), day));
  };

  // Check if a day has a scheduled workout in the program
  const hasScheduledWorkout = (day: Date) => {
    if (!program) return false;
    const dayOfWeek = day.getDay() || 7; // Convert Sunday (0) to 7
    return program.workoutDays.some(
      (workoutDay: WorkoutDay) => workoutDay.dayNumber === dayOfWeek
    );
  };

  // Check if a day is in the future
  const isFutureDay = (day: Date) => {
    const today = new Date();
    const isInCurrentWeek = isWithinInterval(day, {
      start: currentWeekStart,
      end: currentWeekEnd,
    });
    return !isInCurrentWeek && isAfter(startOfDay(day), startOfDay(today));
  };

  // Check if a day is in the current week
  const isCurrentWeek = (day: Date) => {
    return isWithinInterval(day, {
      start: currentWeekStart,
      end: currentWeekEnd,
    });
  };

  // Handle month navigation
  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
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
        {weeks.map((week, weekIndex) => {
          const isWeekCurrentWeek = week.some(isCurrentWeek);
          return (
            <div
              key={weekIndex}
              className={cn(
                "grid grid-cols-7 gap-1",
                isWeekCurrentWeek &&
                  "bg-blue-50 dark:bg-blue-950 rounded-lg p-1"
              )}
            >
              {week.map((day, dayIndex) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const dayHasWorkout = hasWorkout(day);
                const dayHasScheduledWorkout = hasScheduledWorkout(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isFuture = isFutureDay(day);
                const isInCurrentWeek = isCurrentWeek(day);

                return (
                  <Button
                    key={dayIndex}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 w-full p-0 font-normal relative",
                      isSelected &&
                        "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 ring-1 ring-blue-400 dark:ring-blue-500",
                      isToday &&
                        !isSelected &&
                        "border-2 border-blue-600 dark:border-blue-300",
                      !isCurrentMonth && "text-slate-500 dark:text-slate-400",
                      dayHasWorkout && "bg-green-50 dark:bg-green-950",
                      isFuture && "opacity-50 cursor-not-allowed",
                      isInCurrentWeek &&
                        dayHasScheduledWorkout &&
                        !dayHasWorkout &&
                        "bg-blue-100/50 dark:bg-blue-900/50",
                      isInCurrentWeek && "text-slate-900 dark:text-slate-100"
                    )}
                    onClick={() => !isFuture && onSelectDate(day)}
                    disabled={isFuture}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span>{format(day, "d")}</span>
                      {dayHasWorkout && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 dark:bg-green-400 rounded-full mx-1"></div>
                      )}
                      {isInCurrentWeek &&
                        dayHasScheduledWorkout &&
                        !dayHasWorkout && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 dark:bg-blue-400 rounded-full mx-1"></div>
                        )}
                    </div>
                  </Button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="border-b border-2 rounded-full border-blue-600 dark:border-blue-400 w-[23px]" />
          <span>Upcoming Workouts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <span>Current Week</span>
        </div>
      </div>
    </div>
  );
}
