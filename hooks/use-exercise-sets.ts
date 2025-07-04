"use client";
import { SetData } from "@/interfaces/workout-log-interfaces";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  WorkoutDay,
  Exercise,
  WorkoutProgram,
} from "@/interfaces/workout-program-interfaces";

export const useExerciseSets = (
  workoutLog: any,
  workoutPrograms: WorkoutProgram[],
  selectedDay?: WorkoutDay | null,
  previousLog?: any
) => {
  const [exerciseSets, setExerciseSets] = useState<Record<string, SetData[]>>(
    {}
  );

  const [validationAttempts, setValidationAttempts] = useState<
    Record<string, boolean[]>
  >({});

  // Helper function to group workout log entries by exercise
  const groupWorkoutLogByExercise = (workoutLogData: any[]) => {
    const grouped: Record<string, any[]> = {};

    if (workoutLogData && Array.isArray(workoutLogData)) {
      workoutLogData.forEach((entry) => {
        const exerciseId = entry.programExerciseId;
        if (!grouped[exerciseId]) {
          grouped[exerciseId] = [];
        }
        grouped[exerciseId].push(entry);
      });
    }

    return grouped;
  };

  // Helper function to validate if set data is actually logged (has weight and reps)
  const isSetDataValid = useCallback(
    (setData: any, laterality: string): boolean => {
      if (!setData) return false;

      // Check weight (must be greater than 0)
      if (!setData.weight || setData.weight <= 0) return false;

      // Check reps based on exercise laterality
      if (laterality === "unilateral") {
        return !!(
          setData.repsLeft &&
          setData.repsLeft > 0 &&
          setData.repsRight &&
          setData.repsRight > 0
        );
      } else {
        return !!(
          (setData.repsLeft && setData.repsLeft > 0) ||
          (setData.repsRight && setData.repsRight > 0)
        );
      }
    },
    []
  );

  // Memoize the exercise lookup map to prevent recalculation on every render
  const exerciseMap = useMemo(() => {
    const map = new Map<string, Exercise>();

    if (workoutPrograms && Array.isArray(workoutPrograms)) {
      workoutPrograms.forEach((program) => {
        if (program.workoutDays && Array.isArray(program.workoutDays)) {
          program.workoutDays.forEach((day: any) => {
            if (day.exercises && Array.isArray(day.exercises)) {
              day.exercises.forEach((exercise: Exercise) => {
                map.set(exercise.exerciseId, exercise);
              });
            }
          });
        }
      });
    }

    return map;
  }, [workoutPrograms]);

  // Initialize sets when selectedDay or workoutLog changes
  useEffect(() => {
    if (workoutPrograms.length === 0) return;
    if (workoutPrograms.length > 1) return;

    if (selectedDay) {
      const initialSets: Record<string, SetData[]> = {};
      const initialValidationAttempts: Record<string, boolean[]> = {};

      // Group workout log data by exercise
      const loggedExercises = workoutLog?.data[0]?.workoutExercises
        ? groupWorkoutLogByExercise(workoutLog.data[0]?.workoutExercises)
        : {};

      const previousLoggedExercises = previousLog?.data
        ? groupWorkoutLogByExercise(previousLog?.data)
        : {};

      selectedDay.exercises.forEach((exercise) => {
        const loggedExercise = loggedExercises[exercise.exerciseId] || [];
        const previousLoggedExercise =
          previousLoggedExercises[exercise.exerciseId] || [];

        initialSets[exercise.exerciseId] = Array.from(
          { length: exercise.sets },
          (_, index) => {
            // Find the logged set that matches this set number (index + 1)
            const loggedSet = loggedExercise.find((exerciseData: any) =>
              exerciseData.workoutSets?.some(
                (set: any) => set.setNumber === index + 1
              )
            );

            const previousLoggedSet = previousLoggedExercise.find(
              (previousExerciseData: any) =>
                previousExerciseData.previousWorkoutSets?.some(
                  (set: any) => set.setNumber === index + 1
                )
            );

            // If we found a matching exercise, get the specific set data
            const setData = loggedSet?.workoutSets?.find(
              (set: any) => set.setNumber === index + 1
            );

            const previousSetData =
              previousLoggedSet?.previousWorkoutSets?.find(
                (set: any) => set.setNumber === index + 1
              );

            if (setData) {
              // Use data from workout log
              return {
                workoutLogId: loggedExercise[0]?.workoutLogId,
                setNumber: setData.setNumber,
                workoutSetId: setData.workoutSetId,
                workoutExerciseId: setData.workoutExerciseId,
                weight: setData.weight || 0,
                weightUnit: loggedSet.weightUnit || "lb",
                reps:
                  setData.repsLeft && setData.repsRight
                    ? (setData.repsLeft + setData.repsRight) / 2
                    : setData.repsLeft || setData.repsRight || 0,
                leftReps: setData.repsLeft || 0,
                rightReps: setData.repsRight || 0,
                previousLeftReps: setData.previousLeftReps || null,
                previousRightReps: setData.previousRightReps || null,
                previousWeight: setData.previousWeight || null,
                isLogged: true, // Already logged
              };
            } else {
              // Empty set for unlogged exercises
              return {
                workoutLogId: null,
                setNumber: index + 1,
                weight: 0,
                weightUnit: "lb",
                reps: 0,
                leftReps: 0,
                rightReps: 0,
                previousLeftReps: previousSetData?.leftReps || null,
                previousRightReps: previousSetData?.rightReps || null,
                previousWeight: previousSetData?.weight || null,
                isLogged: false,
                workoutSetId: null,
                workoutExerciseId: null,
              };
            }
          }
        );

        initialValidationAttempts[exercise.exerciseId] = Array.from(
          { length: exercise.sets },
          () => false
        );
      });

      setExerciseSets(initialSets);
      setValidationAttempts(initialValidationAttempts);
    }
  }, [selectedDay, workoutLog, previousLog]);

  // Remove the functions from the dependency array
  useEffect(() => {
    if (workoutPrograms.length === 0) return;
    if (
      workoutPrograms.length === 1 &&
      workoutPrograms[0].programType !== "manual"
    )
      return;

    if (workoutLog?.data?.[0]?.workoutExercises) {
      const initialSets: Record<string, SetData[]> = {};
      const initialValidationAttempts: Record<string, boolean[]> = {};

      // Group workout log data by exercise
      const loggedExercises = workoutLog?.data?.[0]?.workoutExercises
        ? groupWorkoutLogByExercise(workoutLog?.data?.[0]?.workoutExercises)
        : {};

      workoutLog?.data?.[0]?.workoutExercises.forEach(
        (workoutExercise: any) => {
          const exerciseId = workoutExercise.programExerciseId;
          const loggedExercise = loggedExercises[exerciseId] || [];

          // Determine sets count - use original exercise sets count, fallback to logged sets or default
          const originalExercise = findOriginalExercise(exerciseId);
          const originalSets =
            originalExercise?.sets ||
            workoutExercise.sets ||
            workoutExercise.originalSets;
          const existingSetsCount = workoutExercise.workoutSets?.length || 0;
          const setsCount = originalSets || Math.max(existingSetsCount, 3);

          initialSets[exerciseId] = Array.from(
            { length: setsCount },
            (_, index) => {
              // ... rest of your logic remains the same
              const loggedSet = loggedExercise.find((exerciseData: any) =>
                exerciseData.workoutSets?.some(
                  (set: any) => set.setNumber === index + 1
                )
              );

              const setData = loggedSet?.workoutSets?.find(
                (set: any) => set.setNumber === index + 1
              );

              if (setData) {
                const isValidSet = isSetDataValid(
                  setData,
                  workoutExercise.laterality
                );

                return {
                  workoutLogId: loggedExercise[0]?.workoutLogId || null,
                  setNumber: setData.setNumber || index + 1,
                  workoutSetId: setData.workoutSetId || null,
                  workoutExerciseId: setData.workoutExerciseId || null,
                  weight: setData.weight || 0,
                  weightUnit: setData.weightUnit || "lb",
                  reps:
                    setData.repsLeft && setData.repsRight
                      ? (setData.repsLeft + setData.repsRight) / 2
                      : setData.repsLeft || setData.repsRight || 0,
                  leftReps: setData.repsLeft || 0,
                  rightReps: setData.repsRight || 0,
                  previousLeftReps: setData.previousLeftReps || null,
                  previousRightReps: setData.previousRightReps || null,
                  previousWeight: setData.previousWeight || null,
                  isLogged: isValidSet,
                };
              } else {
                return {
                  workoutLogId: loggedExercise[0]?.workoutLogId || null,
                  setNumber: index + 1,
                  workoutSetId: null,
                  workoutExerciseId: null,
                  weight: 0,
                  weightUnit: "lb",
                  reps: 0,
                  leftReps: 0,
                  rightReps: 0,
                  previousLeftReps: null,
                  previousRightReps: null,
                  previousWeight: null,
                  isLogged: false,
                };
              }
            }
          );

          initialValidationAttempts[exerciseId] = Array.from(
            { length: setsCount },
            () => false
          );
        }
      );

      setExerciseSets(initialSets);
      setValidationAttempts(initialValidationAttempts);
    }
  }, [workoutLog, exerciseMap, workoutPrograms]); // Only include stable dependencies

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

  const getWorkoutExerciseId = useCallback(
    (exerciseId: string): string => {
      return (
        exerciseSets[exerciseId]?.find((set) => set.isLogged)
          ?.workoutExerciseId || ""
      );
    },
    [exerciseSets]
  );

  const getManualWorkoutExerciseId = useCallback(
    (exerciseId: string): string => {
      return (
        workoutLog?.data?.[0]?.workoutExercises.find(
          (exercise: any) => exercise.programExerciseId === exerciseId
        )?.workoutExerciseId || ""
      );
    },
    [workoutLog]
  );

  const getExerciseNotes = (workoutExerciseId: string): string => {
    const notes = workoutLog?.data[0]?.workoutExercises.find(
      (exercise: any) => exercise.workoutExerciseId === workoutExerciseId
    )?.notes;
    return notes || "";
  };

  // Helper function to find original exercise data from workout programs
  const findOriginalExercise = useCallback(
    (exerciseId: string): Exercise | null => {
      return exerciseMap.get(exerciseId) || null;
    },
    [exerciseMap]
  );

  // Convert workout exercise to exercise format for compatibility with ExerciseTable
  const convertWorkoutExerciseToExercise = useCallback(
    (workoutExercise: any): Exercise => {
      // First try to find original exercise data from workout programs
      const originalExercise = findOriginalExercise(
        workoutExercise.programExerciseId
      );

      // Use original exercise data if available, otherwise use stored data or defaults
      const originalSets =
        originalExercise?.sets ||
        workoutExercise.sets ||
        workoutExercise.originalSets ||
        Math.max(workoutExercise.workoutSets?.length || 0, 3);

      return {
        exerciseId: workoutExercise.programExerciseId,
        exerciseName: workoutExercise.exerciseName,
        bodyPart: workoutExercise.bodyPart,
        laterality: workoutExercise.laterality,
        sets: originalSets,
        minReps: originalExercise?.minReps || workoutExercise.minReps || 8,
        maxReps: originalExercise?.maxReps || workoutExercise.maxReps || 12,
        exerciseOrder: workoutExercise.exerciseOrder,
      };
    },
    [findOriginalExercise]
  );

  // Get exercises in the format expected by ExerciseTable
  const getExercises = useCallback((): Exercise[] => {
    if (!workoutLog?.data?.[0]?.workoutExercises) return [];

    return workoutLog?.data?.[0]?.workoutExercises.map((workoutExercise: any) =>
      convertWorkoutExerciseToExercise(workoutExercise)
    );
  }, [workoutLog, convertWorkoutExerciseToExercise]);

  return {
    exerciseSets,
    updateSetData,
    toggleSetLogged,
    isFieldInvalid,
    isExerciseFullyLogged,
    hasLoggedSets,
    getWorkoutExerciseId,
    getExerciseNotes,
    getExercises,
    getManualWorkoutExerciseId,
  };
};
