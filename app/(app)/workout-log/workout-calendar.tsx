"use client";

import { useState, useEffect } from "react";
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
import { useGetWorkoutLogDatesQuery } from "@/api/workout-log/workout-log-api-slice";
import { getStartOfPreviousAndEndOfNextMonth } from "@/helper/get-day-range";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import type {
  WorkoutProgram,
  WorkoutDay,
} from "../../../interfaces/workout-program-interfaces";

interface WorkoutCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  program?: WorkoutProgram;
}

export function WorkoutCalendar({
  selectedDate,
  onSelectDate,
  program,
}: WorkoutCalendarProps) {
  const user = useSelector(selectCurrentUser);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (selectedDate) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("date");
      newSearchParams.delete("tab");
      router.replace(`/workout-log?${newSearchParams.toString()}`);
    }
  }, [selectedDate, router, searchParams]);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate) || new Date()
  );

  const { startDateOfPreviousMonth, endDateOfPreviousMonth } =
    getStartOfPreviousAndEndOfNextMonth({
      currentMonth: new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      ),
    });

  const { data: workoutLogs, isLoading: isLoadingWorkoutLogs } =
    useGetWorkoutLogDatesQuery({
      userId: user?.user_id || "",
      programId: program?.programId || "",
      startDate: startDateOfPreviousMonth,
      endDate: endDateOfPreviousMonth,
    });

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
  const hasLoggedWorkout = (day: Date) => {
    return workoutLogs?.data.some((log: any) =>
      isSameDay(parseISO(log.workout_date), day)
    );
  };

  const hasCompletedWorkout = (day: Date) => {
    return workoutLogs?.data.some(
      (log: any) =>
        isSameDay(parseISO(log.workout_date), day) && log.status === "completed"
    );
  };

  // Check if a day has a scheduled workout in the program
  const hasScheduledWorkout = (day: Date) => {
    if (!program) return false;
    if (program.programType === "manual") return false;

    if (program.programType === "custom") {
      return hasScheduledWorkoutCustom(day);
    } else {
      // Original logic for dayOfWeek programs
      const dayOfWeek = day.getDay() || 7; // Convert Sunday (0) to 7
      return program?.workoutDays?.some(
        (workoutDay: WorkoutDay) => workoutDay.dayNumber === dayOfWeek
      );
    }
  };

  // Check if a day has a scheduled workout for custom programs
  const hasScheduledWorkoutCustom = (day: Date) => {
    if (!program || program.programType !== "custom") return false;

    const startingDate = parseISO(program.startingDate);
    const daysDifference = Math.floor(
      (day.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24) // 1 day
    );

    // Get the maximum day number to determine the cycle length (accounts for rest days)
    const maxDayNumber = Math.max(
      ...program.workoutDays.map((workoutDay) => workoutDay.dayNumber + 1)
    );
    if (maxDayNumber === 0) return false;

    // Calculate which day in the cycle this date represents (1-based)
    // Handle both positive and negative daysDifference (before and after start date)
    let cycleDay;
    if (daysDifference >= 0) {
      cycleDay = (daysDifference % maxDayNumber) + 1;
    } else {
      // For days before start date, calculate backwards
      const positiveDays = Math.abs(daysDifference);
      const remainder = positiveDays % maxDayNumber;
      console.log(remainder, day);

      cycleDay = remainder === 0 ? 1 : maxDayNumber + 1 - remainder;
      // console.log(cycleDay, day);
    }

    // Check if there's a workout day with this cycle day number
    return program.workoutDays.some(
      (workoutDay: WorkoutDay) => workoutDay.dayNumber === cycleDay
    );
  };

  // Check if a day is in the current rotation for custom programs
  const isInCurrentRotation = (day: Date) => {
    if (!program || program.programType !== "custom") return false;

    const today = new Date();
    const startingDate = parseISO(program.startingDate);

    // Get the maximum day number to determine the cycle length
    const maxDayNumber = Math.max(
      ...program.workoutDays.map((workoutDay) => workoutDay.dayNumber + 1)
    );

    if (maxDayNumber === 0) return false;

    // Calculate which rotation today is in
    const todaysDifference = Math.floor(
      (today.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const todaysRotation = Math.floor(todaysDifference / maxDayNumber);

    // Calculate which rotation the given day is in
    const daysDifference = Math.floor(
      (day.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysRotation = Math.floor(daysDifference / maxDayNumber);

    // Check if they're in the same rotation
    return todaysRotation === daysRotation;
  };

  // Check if a day is in the future
  const isFutureDay = (day: Date) => {
    const today = new Date();
    const isInCurrentWeek = isWithinInterval(day, {
      start: currentWeekStart,
      end: currentWeekEnd,
    });
    return (
      !isInCurrentWeek &&
      isAfter(startOfDay(day), startOfDay(today)) &&
      !isInCurrentRotation(day)
    );
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

  if (isLoadingWorkoutLogs) {
    return <Skeleton className="h-80 w-full" />;
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
          // Only highlight weeks for dayOfWeek programs, not custom programs
          const isWeekHighlighted =
            program?.programType !== "custom" && week.some(isCurrentWeek);

          return (
            <div
              key={weekIndex}
              className={cn(
                "grid grid-cols-7 gap-1",
                isWeekHighlighted &&
                  "bg-blue-50 dark:bg-blue-950 rounded-lg p-1"
              )}
            >
              {week.map((day, dayIndex) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const dayHasLoggedWorkout = hasLoggedWorkout(day);
                const dayHasScheduledWorkout = hasScheduledWorkout(day);
                const dayHasCompletedWorkout = hasCompletedWorkout(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isFuture = isFutureDay(day);
                const isInCurrentWeekOrRotation =
                  program?.programType === "custom"
                    ? isInCurrentRotation(day)
                    : isCurrentWeek(day);

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "relative",
                      // Apply rotation background to the div for custom programs
                      program?.programType === "custom" &&
                        isInCurrentWeekOrRotation &&
                        "bg-blue-50 dark:bg-blue-950 rounded-lg"
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-10 w-full p-0 font-normal relative",
                        isSelected &&
                          `bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 ring-1 ${
                            dayHasLoggedWorkout
                              ? "dark:ring-green-300 ring-green-500"
                              : "dark:ring-blue-500 ring-blue-500"
                          } hover:bg-blue-200/50 dark:hover:bg-blue-800/50`,
                        isToday &&
                          !isSelected &&
                          `border-2 border-blue-600 dark:border-blue-300 ${
                            dayHasLoggedWorkout
                              ? "border-green-600 dark:border-green-300"
                              : "border-blue-200 dark:border-blue-300"
                          }`,
                        !isCurrentMonth && "text-slate-500 dark:text-slate-400",
                        dayHasLoggedWorkout &&
                          "bg-green-200 dark:bg-green-700 hover:bg-green-300 dark:hover:bg-green-600",
                        isFuture && "opacity-50 cursor-not-allowed",
                        // Keep the original logic for scheduled workouts
                        isInCurrentWeekOrRotation &&
                          !dayHasLoggedWorkout &&
                          "bg-blue-100/50 dark:bg-blue-900/50 hover:bg-blue-200/50 dark:hover:bg-blue-800/50",
                        isInCurrentWeekOrRotation &&
                          "text-slate-900 dark:text-slate-100"
                      )}
                      onClick={() => !isFuture && onSelectDate(day)}
                      disabled={isFuture}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <span>{format(day, "d")}</span>
                        {dayHasLoggedWorkout && dayHasCompletedWorkout && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 dark:bg-green-400 rounded-full mx-1" />
                        )}
                        {isInCurrentWeekOrRotation &&
                          dayHasScheduledWorkout &&
                          !dayHasLoggedWorkout && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 dark:bg-blue-400 rounded-full mx-1" />
                          )}
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300 mt-4">
        <div className="flex items-center gap-2">
          <div className="border-b border-2 rounded-full border-green-600 dark:border-green-400 w-[23px]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded-[2px]"></div>
          <span>Logged Workouts</span>
        </div>
        {program?.programType !== "manual" && (
          <div className="flex items-center gap-2">
            <div className="border-b border-2 rounded-full border-blue-600 dark:border-blue-400 w-[23px]" />
            <span>Upcoming Workouts</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 dark:bg-blue-500 bg-blue-400 rounded-[2px]" />
          {program?.programType === "custom" ? (
            <span>Current Rotation</span>
          ) : (
            <span>Current Week</span>
          )}
        </div>
      </div>
    </div>
  );
}
