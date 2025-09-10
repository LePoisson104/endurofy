import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";
import { parseISO } from "date-fns";

export const isInCurrentRotation = (program: WorkoutProgram) => {
  if (!program || program.programType !== "custom")
    return {
      currentRotationStart: null,
      currentRotationEnd: null,
    };

  const today = new Date();
  const startingDate = parseISO(program.startingDate);

  // Get the maximum day number to determine the cycle length
  const maxDayNumber = Math.max(
    ...program.workoutDays.map((workoutDay) => workoutDay.dayNumber)
  );

  // Calculate which rotation today is in
  const todaysDifference = Math.floor(
    (today.getTime() - startingDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const oneDay = 1000 * 60 * 60 * 24;
  const currentRotation = Math.floor(todaysDifference / maxDayNumber);
  const currentRotationStart = new Date(
    startingDate.getTime() + currentRotation * maxDayNumber * oneDay - oneDay
  );
  const currentRotationEnd = new Date(
    currentRotationStart.getTime() + maxDayNumber * oneDay
  );

  return {
    currentRotationStart:
      new Date(currentRotationStart).toISOString().split("T")[0] || null,
    currentRotationEnd:
      new Date(currentRotationEnd).toISOString().split("T")[0] || null,
  };
};
