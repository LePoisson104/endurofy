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
  const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);

  const [validationAttempts, setValidationAttempts] = useState<
    Record<string, boolean[]>
  >({});

  // Helper function to group workout log entries by exercise
  const groupWorkoutLogByExercise = (workoutLogData: any[]) => {
    const grouped: Record<string, any[]> = {};

    if (workoutLogData && Array.isArray(workoutLogData)) {
      workoutLogData.forEach((entry) => {
        // Use workoutExerciseId as the unique key instead of programExerciseId
        const exerciseId = entry.workoutExerciseId;
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

  // this useEffect is for program workouts
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

      // 1. Get Program Exercises
      const programExercises = selectedDay.exercises.map((pe) => {
        // Check if this program exercise has a corresponding logged entry
        const loggedMatch = workoutLog?.data[0]?.workoutExercises?.find(
          (we: any) => we.programExerciseId === pe.exerciseId
        );

        // If logged match exists, merge logged data (like name) but keep program structure
        if (loggedMatch) {
          return {
            ...pe,
            exerciseName: loggedMatch.exerciseName || pe.exerciseName,
            notes: loggedMatch.notes || pe.notes,
            // We keep other program properties (sets, reps) as targets
          };
        }
        return pe;
      });

      // 2. Get Extra Exercises (from log but not in program)
      const workoutExercises = workoutLog?.data[0]?.workoutExercises || [];
      const extraExercises = workoutExercises
        .filter(
          (we: any) =>
            !selectedDay.exercises.some(
              (pe) => pe.exerciseId === we.programExerciseId
            )
        )
        .map((we: any) => ({
          exerciseId: we.workoutExerciseId, // Use workoutExerciseId as ID
          exerciseName: we.exerciseName,
          notes: we.notes,
          previousNotes: we.previousNotes,
          bodyPart: we.bodyPart,
          laterality: we.laterality,
          sets: we.workoutSets.length || 3,
          minReps: 0, // Defaults
          maxReps: 0, // Defaults
          exerciseOrder: (we.exerciseOrder || 999) + 1000, // Ensure they come last
        }));

      const allExercises = [...programExercises, ...extraExercises];
      setActiveExercises(allExercises);

      allExercises.forEach((exercise) => {
        // Check if it's a program exercise to determine matching strategy
        const isProgramExercise = programExercises.some(
          (pe) => pe.exerciseId === exercise.exerciseId
        );

        // For program workouts, we need to find the corresponding workoutExercise
        let correspondingWorkoutExercise;

        if (isProgramExercise) {
          correspondingWorkoutExercise =
            workoutLog?.data[0]?.workoutExercises?.find(
              (we: any) => we.programExerciseId === exercise.exerciseId
            );
        } else {
          // For extra exercises, ID is the workoutExerciseId
          correspondingWorkoutExercise =
            workoutLog?.data[0]?.workoutExercises?.find(
              (we: any) => we.workoutExerciseId === exercise.exerciseId
            );
        }

        const workoutExerciseId =
          correspondingWorkoutExercise?.workoutExerciseId;
        const loggedExercise = workoutExerciseId
          ? loggedExercises[workoutExerciseId] || []
          : [];

        initialSets[exercise.exerciseId] = Array.from(
          { length: exercise.sets },
          (_, index) => {
            // Find the logged set that matches this set number (index + 1)
            const loggedSet = loggedExercise.find((exerciseData: any) =>
              exerciseData.workoutSets?.some(
                (set: any) => set.setNumber === index + 1
              )
            );

            // Match by programExerciseId instead of workoutExerciseId
            // because workoutExerciseId changes between workout sessions
            // Only for program exercises; extra exercises don't have previous log in this context usually or complex to track
            let previousLoggedSet;
            if (isProgramExercise) {
              previousLoggedSet = previousLog?.data.find(
                (previousExerciseData: any) =>
                  previousExerciseData.programExerciseId === exercise.exerciseId
              );
            }

            // If we found a matching exercise, get the specific set data
            const setData = loggedSet?.workoutSets?.find(
              (set: any) => set.setNumber === index + 1
            );

            // Find the specific previous set that matches this set number
            const previousSetData =
              previousLoggedSet?.previousWorkoutSets?.find(
                (set: any) => set.setNumber === index + 1
              );

            if (setData) {
              // Use data from workout log
              return {
                workoutLogId:
                  correspondingWorkoutExercise?.workoutLogId || null,
                setNumber: setData.setNumber,
                workoutSetId: setData.workoutSetId,
                workoutExerciseId: setData.workoutExerciseId,
                weight: setData.weight || 0,
                weightUnit: correspondingWorkoutExercise?.weightUnit || "lb",
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
                workoutLogId:
                  correspondingWorkoutExercise?.workoutLogId || null,
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
                workoutExerciseId:
                  correspondingWorkoutExercise?.workoutExerciseId || null,
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

  // this useEffect is for manual workouts
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
          const exerciseId = workoutExercise.workoutExerciseId;
          const loggedExercise = loggedExercises[exerciseId] || [];

          // Determine sets count - use original exercise sets count, fallback to logged sets or default
          const originalExercise = findOriginalExercise(
            workoutExercise.programExerciseId
          );
          const originalSets =
            originalExercise?.sets || workoutExercise.workoutSets?.length;
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
            const updatedSet = { ...set };

            // Handle empty strings for numeric fields - convert to 0
            if (field === "weight") {
              const numValue =
                value === "" || value === null || value === undefined
                  ? 0
                  : Number(value);
              updatedSet.weight = isNaN(numValue) ? 0 : numValue;
            } else if (field === "reps") {
              const numValue =
                value === "" || value === null || value === undefined
                  ? 0
                  : Number(value);
              updatedSet.reps = isNaN(numValue) ? 0 : numValue;
            } else if (field === "leftReps") {
              const numValue =
                value === "" || value === null || value === undefined
                  ? 0
                  : Number(value);
              updatedSet.leftReps = isNaN(numValue) ? 0 : numValue;
            } else if (field === "rightReps") {
              const numValue =
                value === "" || value === null || value === undefined
                  ? 0
                  : Number(value);
              updatedSet.rightReps = isNaN(numValue) ? 0 : numValue;
            } else if (field === "weightUnit") {
              updatedSet.weightUnit = value as string;
            }

            // If updating reps, always sync leftReps and rightReps for bilateral exercises
            if (field === "reps" && updatedSet.reps > 0) {
              updatedSet.leftReps = updatedSet.reps;
              updatedSet.rightReps = updatedSet.reps;
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
      // For program workouts, check if it's a program exercise
      if (selectedDay) {
        const isProgramExercise = selectedDay.exercises.some(
          (e) => e.exerciseId === exerciseId
        );

        if (isProgramExercise) {
          // Match by programExerciseId
          const correspondingWorkoutExercise =
            workoutLog?.data[0]?.workoutExercises?.find(
              (we: any) => we.programExerciseId === exerciseId
            );
          return correspondingWorkoutExercise?.workoutExerciseId || "";
        }
      }

      // If not in program (or manual mode), the exerciseId IS the workoutExerciseId
      return exerciseId;
    },
    [selectedDay, workoutLog]
  );

  const getManualWorkoutExerciseId = useCallback(
    (exerciseId: string): string => {
      // Since exerciseId is now workoutExerciseId, we can return it directly
      return exerciseId;
    },
    []
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
        originalExercise?.sets || workoutExercise.workoutSets?.length;

      const getMaxReps = workoutExercise.workoutSets?.reduce(
        (max: number, set: any) => Math.max(max, set.repsRight),
        0
      );

      const getMinReps = workoutExercise.workoutSets?.reduce(
        (min: number, set: any) => Math.min(min, set.repsRight),
        Infinity
      );

      return {
        exerciseId: workoutExercise.workoutExerciseId,
        exerciseName: workoutExercise.exerciseName,
        bodyPart: workoutExercise.bodyPart,
        laterality: workoutExercise.laterality,
        sets: originalSets,
        minReps: originalExercise?.minReps || getMinReps,
        maxReps: originalExercise?.maxReps || getMaxReps,
        exerciseOrder: workoutExercise.exerciseOrder,
        notes: workoutExercise.notes || null,
        previousNotes: workoutExercise.previousNotes,
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
    activeExercises,
  };
};
