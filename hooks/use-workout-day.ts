"use client";
import { useEffect } from "react";
import {
  AllDays,
  WorkoutDay,
  WorkoutProgram,
} from "@/interfaces/workout-program-interfaces";
import { useState } from "react";

export const useWorkoutDay = (program: WorkoutProgram, selectedDate: Date) => {
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [allDays, setAllDays] = useState<Record<number, AllDays>>({});

  useEffect(() => {
    if (program.workoutDays && program.workoutDays.length > 0) {
      let matchingDay: WorkoutDay | null = null;

      if (program.programType === "custom") {
        const startingDate = new Date(program.startingDate);
        const daysDifference = Math.floor(
          (selectedDate.getTime() - startingDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        const maxDayNumber = Math.max(
          ...program.workoutDays.map((workoutDay) => workoutDay.dayNumber)
        );

        if (maxDayNumber > 0) {
          let cycleDay;
          if (daysDifference >= 0) {
            cycleDay = (daysDifference % maxDayNumber) + 1;
          } else {
            const positiveDays = Math.abs(daysDifference);
            const remainder = positiveDays % maxDayNumber;
            cycleDay =
              remainder === 0 ? maxDayNumber : maxDayNumber - remainder + 1;
          }

          matchingDay =
            program.workoutDays.find((day) => day.dayNumber === cycleDay) ||
            null;
        }
      } else {
        const dayOfWeek = selectedDate.getDay() || 7;
        matchingDay =
          program.workoutDays.find((day) => day.dayNumber === dayOfWeek) ||
          null;
      }

      setSelectedDay(matchingDay);
    }

    setAllDays(
      program.programType === "dayOfWeek"
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
          }
    );
  }, [program, selectedDate]);

  return { selectedDay, allDays };
};
