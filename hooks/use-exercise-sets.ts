"use client";
import { SetData } from "@/interfaces/workout-log-interfaces";
import { useEffect, useState } from "react";
import { WorkoutDay, Exercise } from "@/interfaces/workout-program-interfaces";

export const useExerciseSets = (selectedDay: WorkoutDay | null) => {
  const [exerciseSets, setExerciseSets] = useState<Record<string, SetData[]>>(
    {}
  );
  const [validationAttempts, setValidationAttempts] = useState<
    Record<string, boolean[]>
  >({});

  // Initialize sets when selectedDay changes
  useEffect(() => {
    if (selectedDay) {
      const initialSets: Record<string, SetData[]> = {};
      const initialValidationAttempts: Record<string, boolean[]> = {};

      selectedDay.exercises.forEach((exercise) => {
        initialSets[exercise.exerciseId] = Array.from(
          { length: exercise.sets },
          () => ({
            weight: 0,
            weightUnit: "lb",
            reps: 0,
            leftReps: 0,
            rightReps: 0,
            isLogged: Math.random() > 0.7, // 30% chance of being logged for demo
          })
        );

        initialValidationAttempts[exercise.exerciseId] = Array.from(
          { length: exercise.sets },
          () => false
        );
      });

      setExerciseSets(initialSets);
      setValidationAttempts(initialValidationAttempts);
    }
  }, [selectedDay]);

  const updateSetData = (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps" | "leftReps" | "rightReps" | "weightUnit",
    value: string | number
  ) => {
    setExerciseSets((prev) => {
      const updatedSets = {
        ...prev,
        [exerciseId]: prev[exerciseId].map((set, index) => {
          if (index === setIndex) {
            const updatedSet = { ...set, [field]: value };

            // If updating reps and leftReps/rightReps are empty or zero, sync them
            if (field === "reps" && value && Number(value) > 0) {
              if (!updatedSet.leftReps || updatedSet.leftReps <= 0) {
                updatedSet.leftReps = Number(value);
              }
              if (!updatedSet.rightReps || updatedSet.rightReps <= 0) {
                updatedSet.rightReps = Number(value);
              }
            }

            return updatedSet;
          }
          return set;
        }),
      };

      return updatedSets;
    });
  };

  const validateSet = (
    exerciseId: string,
    setIndex: number,
    exercise: Exercise
  ): boolean => {
    const currentSet = exerciseSets[exerciseId]?.[setIndex];
    if (!currentSet) return false;

    // Check weight (must be greater than 0)
    if (!currentSet.weight || currentSet.weight <= 0) return false;

    // Check reps based on exercise laterality
    if (exercise.laterality === "unilateral") {
      return !!(
        currentSet.leftReps &&
        currentSet.leftReps > 0 &&
        currentSet.rightReps &&
        currentSet.rightReps > 0
      );
    } else {
      return !!(currentSet.reps && currentSet.reps > 0);
    }
  };

  const toggleSetLogged = (
    exerciseId: string,
    setIndex: number,
    exercise: Exercise
  ) => {
    const currentSet = exerciseSets[exerciseId]?.[setIndex];
    if (!currentSet) return;

    // If trying to check as logged, validate first
    if (!currentSet.isLogged) {
      // Mark validation attempt
      setValidationAttempts((prev) => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          [setIndex]: true,
        },
      }));

      // Check if valid
      if (!validateSet(exerciseId, setIndex, exercise)) {
        return; // Don't toggle if invalid
      }
    }

    // Toggle the logged status
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, index) =>
        index === setIndex ? { ...set, isLogged: !set.isLogged } : set
      ),
    }));
  };

  const isFieldInvalid = (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps" | "leftReps" | "rightReps"
  ): boolean => {
    const currentSet = exerciseSets[exerciseId]?.[setIndex];
    if (!currentSet) return false;

    const wasValidationAttempted =
      validationAttempts[exerciseId]?.[setIndex] || false;
    const fieldValue = currentSet[field] as number;
    return (
      wasValidationAttempted &&
      !currentSet.isLogged &&
      (!fieldValue || fieldValue <= 0)
    );
  };

  const isExerciseFullyLogged = (exerciseId: string): boolean => {
    const sets = exerciseSets[exerciseId] || [];
    return sets.length > 0 && sets.every((set) => set.isLogged);
  };

  const hasLoggedSets = (exerciseId: string): boolean => {
    const sets = exerciseSets[exerciseId] || [];
    return sets.some((set) => set.isLogged);
  };

  return {
    exerciseSets,
    updateSetData,
    toggleSetLogged,
    isFieldInvalid,
    isExerciseFullyLogged,
    hasLoggedSets,
  };
};
