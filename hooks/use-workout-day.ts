"use client";
import { useMemo } from "react";
import {
  WorkoutDay,
  WorkoutProgram,
} from "@/interfaces/workout-program-interfaces";

export const useWorkoutDay = (program: WorkoutProgram, selectedDate: Date) => {
  const allDays = useMemo(() => {
    return program.programType === "dayOfWeek"
      ? {
          1: "monday",
          2: "tuesday",
          3: "wednesday",
          4: "thursday",
          5: "friday",
          6: "saturday",
          7: "sunday",
        }
      : {
          1: "D1",
          2: "D2",
          3: "D3",
          4: "D4",
          5: "D5",
          6: "D6",
          7: "D7",
          8: "D8",
          9: "D9",
          10: "D10",
        };
  }, [program.programType]);

  const selectedDay = useMemo<WorkoutDay | null>(() => {
    if (!program.workoutDays || program.workoutDays.length === 0) return null;

    if (program.programType === "custom") {
      const startingDate = new Date(program.startingDate);
      const daysDifference = Math.floor(
        (selectedDate.getTime() - startingDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const maxDayNumber = Math.max(
        ...program.workoutDays.map((day) => day.dayNumber + 1)
      );

      if (maxDayNumber <= 0) return null;

      let cycleDay;
      if (daysDifference >= 0) {
        cycleDay = (daysDifference % maxDayNumber) + 1;
      } else {
        const positiveDays = Math.abs(daysDifference);
        const remainder = positiveDays % maxDayNumber;
        cycleDay = remainder === 0 ? 1 : maxDayNumber + 1 - remainder;
      }

      return (
        program.workoutDays.find((day) => day.dayNumber === cycleDay) || null
      );
    } else {
      const dayOfWeek = selectedDate.getDay() || 7;
      return (
        program.workoutDays.find((day) => day.dayNumber === dayOfWeek) || null
      );
    }
  }, [program, selectedDate]);

  return { selectedDay, allDays };
};
