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
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutCalendarProps {
  workoutLogs: any[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function WorkoutCalendar({
  workoutLogs,
  selectedDate,
  onSelectDate,
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

  // Check if a day has a workout log
  const hasWorkout = (day: Date) => {
    return workoutLogs.some((log) => isSameDay(parseISO(log.date), day));
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
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayHasWorkout = hasWorkout(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <Button
                  key={dayIndex}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 w-full p-0 font-normal relative",
                    isSelected && "bg-blue-100 text-blue-600",
                    isToday && !isSelected && "border border-blue-500",
                    !isCurrentMonth && "text-slate-500",
                    dayHasWorkout && !isSelected && "bg-green-50"
                  )}
                  onClick={() => onSelectDate(day)}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span>{format(day, "d")}</span>
                    {dayHasWorkout && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-full mx-1"></div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
