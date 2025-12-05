import { Exercise } from "../../../interfaces/workout-program-interfaces";
import {
  SetData,
  ExercisePayload,
} from "../../../interfaces/workout-log-interfaces";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useDeleteWorkoutSetWithCascadeMutation,
  useUpdateWorkoutSetMutation,
  useDeleteWorkoutSetMutation,
} from "@/api/workout-log/workout-log-api-slice";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getProgressionColor } from "@/helper/get-progression-color";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { getRecommendedProgressionBilateralValues } from "@/helper/get-recommended-progression-values";

interface ExerciseTableProps {
  onSaveExerciseSets: (exercisePayload: ExercisePayload) => void;
  exercise: Exercise;
  exerciseSets: SetData[];
  updateSetData: (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps" | "leftReps" | "rightReps" | "weightUnit",
    value: string
  ) => void;
  toggleSetLogged: (
    exerciseId: string,
    setIndex: number,
    exercise: Exercise
  ) => void;
  isFieldInvalid: (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps" | "leftReps" | "rightReps"
  ) => boolean;
  isEditing: boolean;
  hasLoggedSets: boolean;
  isMobile: boolean;
  showPrevious: boolean;
  isStartingWorkout: boolean;
  logType?: "program" | "manual";
}

export default function ExerciseTable({
  onSaveExerciseSets,
  exercise,
  exerciseSets,
  updateSetData,
  toggleSetLogged,
  isFieldInvalid,
  isEditing,
  hasLoggedSets,
  isMobile,
  showPrevious,
  isStartingWorkout,
  logType = "program",
}: ExerciseTableProps) {
  const isDark = useGetCurrentTheme();
  const [updatingSetId, setUpdatingSetId] = useState<string | null>(null);
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
  const [successSetId, setSuccessSetId] = useState<string | null>(null);
  const [modifiedSets, setModifiedSets] = useState<Set<string>>(new Set());
  const [originalValues, setOriginalValues] = useState<{
    [setId: string]: SetData;
  }>({});

  const [deleteWorkoutSetWithCascade] =
    useDeleteWorkoutSetWithCascadeMutation();
  const [deleteWorkoutSet] = useDeleteWorkoutSetMutation();
  const [updateWorkoutSet] = useUpdateWorkoutSetMutation();

  // Store original values when sets are first loaded
  useEffect(() => {
    const originals: { [setId: string]: SetData } = {};
    exerciseSets.forEach((setData) => {
      if (
        setData.isLogged &&
        setData.workoutSetId &&
        !originalValues[setData.workoutSetId]
      ) {
        originals[setData.workoutSetId] = { ...setData };
      }
    });
    if (Object.keys(originals).length > 0) {
      setOriginalValues((prev) => ({ ...prev, ...originals }));
    }
  }, [exerciseSets]);

  // Reset unsaved changes when exiting edit mode
  useEffect(() => {
    if (!isEditing && modifiedSets.size > 0) {
      // Reset any unsaved changes back to original values
      modifiedSets.forEach((setId) => {
        const original = originalValues[setId];
        if (original) {
          // Find the set index for this setId
          const setIndex = exerciseSets.findIndex(
            (set) => set.workoutSetId === setId
          );
          if (setIndex !== -1) {
            // Reset each field back to original value
            if (exerciseSets[setIndex].weight !== original.weight) {
              updateSetData(
                exercise.exerciseId,
                setIndex,
                "weight",
                String(original.weight || "")
              );
            }
            if (exerciseSets[setIndex].reps !== original.reps) {
              updateSetData(
                exercise.exerciseId,
                setIndex,
                "reps",
                String(original.reps || "")
              );
            }
            if (exerciseSets[setIndex].leftReps !== original.leftReps) {
              updateSetData(
                exercise.exerciseId,
                setIndex,
                "leftReps",
                String(original.leftReps || "")
              );
            }
            if (exerciseSets[setIndex].rightReps !== original.rightReps) {
              updateSetData(
                exercise.exerciseId,
                setIndex,
                "rightReps",
                String(original.rightReps || "")
              );
            }
          }
        }
      });

      // Clear modified sets after reset
      setModifiedSets(new Set());
    }
  }, [
    isEditing,
    modifiedSets,
    originalValues,
    exerciseSets,
    exercise.exerciseId,
    updateSetData,
  ]);

  // Check if current values differ from original values
  const hasActualChanges = (setData: SetData): boolean => {
    if (!setData.workoutSetId || !originalValues[setData.workoutSetId]) {
      return false;
    }

    const original = originalValues[setData.workoutSetId];
    const hasChanges =
      String(setData.weight || "") !== String(original.weight || "") ||
      String(setData.reps || "") !== String(original.reps || "") ||
      String(setData.leftReps || "") !== String(original.leftReps || "") ||
      String(setData.rightReps || "") !== String(original.rightReps || "");

    return hasChanges;
  };

  // Enhanced updateSetData that tracks modifications only if values actually changed
  const handleUpdateSetData = (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps" | "leftReps" | "rightReps" | "weightUnit",
    value: string
  ) => {
    // First update the data
    updateSetData(exerciseId, setIndex, field, value);

    // Simply mark any logged set as potentially modified when user types
    // The actual change check will happen in the render
    const setData = exerciseSets[setIndex];
    if (setData?.workoutSetId && setData.isLogged) {
      setModifiedSets((prev) => new Set(prev).add(setData.workoutSetId!));
    }
  };

  // Function to log set data to console
  const logSetData = (
    setData: SetData,
    exercise: Exercise,
    setIndex: number
  ) => {
    const exercisePayload: ExercisePayload = {
      exerciseNotes: "",
      exerciseName: exercise.exerciseName,
      bodyPart: exercise.bodyPart,
      laterality: exercise.laterality,
      setNumber: setIndex + 1,
      repsLeft: setData.leftReps,
      repsRight: setData.rightReps,
      weight: setData.weight,
      weightUnit: setData.weightUnit as "kg" | "lb",
      workoutExerciseId: exercise.exerciseId,
      exerciseOrder: exercise.exerciseOrder,
    };
    if (logType === "program") {
      exercisePayload.programExerciseId = exercise.exerciseId;
    } else {
      exercisePayload.workoutExerciseId = exercise.exerciseId;
    }
    onSaveExerciseSets(exercisePayload);
  };

  // Handle checkbox toggle with logging
  const handleSetToggle = (
    exerciseId: string,
    setIndex: number,
    exercise: Exercise,
    setData: SetData
  ) => {
    // Only save to API when marking a set as logged (not when unmarking)
    if (!setData.isLogged) {
      // Log the current set data to API
      logSetData(setData, exercise, setIndex);
    }

    // Call the original toggle function
    toggleSetLogged(exerciseId, setIndex, exercise);
  };

  const handleSaveSetChanges = async (setData: SetData) => {
    const setId = setData.workoutSetId;
    if (!setId) return;

    setUpdatingSetId(setId);
    setSuccessSetId(null); // Clear any previous success state

    let workoutSetPayload = {};

    if (exercise.laterality === "bilateral") {
      workoutSetPayload = {
        weight: setData.weight,
        weightUnit: setData.weightUnit,
        leftReps: Number(setData.reps),
        rightReps: Number(setData.reps),
      };
    } else {
      workoutSetPayload = {
        weight: setData.weight,
        weightUnit: setData.weightUnit,
        leftReps: setData.leftReps,
        rightReps: setData.rightReps,
      };
    }

    try {
      await updateWorkoutSet({
        workoutSetId: setData.workoutSetId,
        workoutExerciseId: setData.workoutExerciseId,
        workoutSetPayload: workoutSetPayload,
      }).unwrap();

      // Show success state for this specific set
      setSuccessSetId(setId);

      // Update original values with the new saved values (use the exact values sent to API)
      const updatedSetData = { ...setData };
      if (exercise.laterality === "bilateral") {
        updatedSetData.leftReps = Number(setData.reps);
        updatedSetData.rightReps = Number(setData.reps);
      }

      setOriginalValues((prev) => {
        const newOriginals = {
          ...prev,
          [setId]: updatedSetData,
        };

        return newOriginals;
      });

      // Remove from modified sets after successful save
      setModifiedSets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(setId);
        return newSet;
      });

      // Clear success state after 2 seconds
      setTimeout(() => {
        setSuccessSetId(null);
      }, 2000);
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else {
        toast.error(error.data?.message);
      }
    } finally {
      setUpdatingSetId(null);
    }
  };

  const handleDeleteSet = async (
    workoutSetId: string | null,
    workoutExerciseId: string | null,
    workoutLogId: string | null
  ) => {
    setDeletingSetId(workoutSetId);
    try {
      if (logType === "program") {
        await deleteWorkoutSetWithCascade({
          workoutSetId,
          workoutExerciseId,
          workoutLogId,
        }).unwrap();
      } else if (logType === "manual") {
        await deleteWorkoutSet({
          workoutSetId,
        }).unwrap();
      }
      setDeletingSetId(null);
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[60px] text-center">
              {(!isEditing && hasLoggedSets) || !hasLoggedSets ? (
                <Check className="h-4 w-4 mx-auto" />
              ) : (
                "Actions"
              )}
            </TableHead>
            <TableHead className="w-[60px] text-center px-2">Set #</TableHead>
            <TableHead
              className={`w-[120px] text-center ${
                !isMobile || showPrevious ? "px-4" : "px-2"
              }`}
            >
              Weight {exercise.laterality === "bilateral" ? "(lbs)" : ""}
            </TableHead>
            {exercise.laterality === "unilateral" ? (
              <>
                <TableHead
                  className={`w-[120px] text-center ${
                    !isMobile || showPrevious ? "px-4" : "px-2"
                  }`}
                >
                  Left
                </TableHead>
                <TableHead
                  className={`w-[120px] text-center ${
                    !isMobile || showPrevious ? "px-4" : "px-2"
                  }`}
                >
                  Right
                </TableHead>
              </>
            ) : (
              <TableHead
                className={`w-[120px] text-center ${
                  !isMobile || showPrevious ? "px-4" : "px-2"
                }`}
              >
                Reps
              </TableHead>
            )}
            {(!isMobile || showPrevious) && (
              <>
                <TableHead className="w-[120px] text-center px-4 border-l border-muted">
                  Prev Weight
                </TableHead>
                {exercise.laterality === "unilateral" ? (
                  <>
                    <TableHead className="w-[120px] text-center px-4">
                      Prev Left
                    </TableHead>
                    <TableHead className="w-[120px] text-center px-4">
                      Prev Right
                    </TableHead>
                  </>
                ) : (
                  <TableHead className="w-[120px] text-center px-4">
                    Prev Reps
                  </TableHead>
                )}
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: exercise.sets }).map((_, setIndex) => {
            const setData = exerciseSets[setIndex] || {
              weight: "",
              reps: "",
              leftReps: "",
              rightReps: "",
              isLogged: false,
              workoutSetId: null,
              workoutExerciseId: null,
              workoutLogId: null,
              previousWeight: null,
              previousLeftReps: null,
              previousRightReps: null,
              setNumber: setIndex + 1,
            };

            const isModified = setData.workoutSetId
              ? modifiedSets.has(setData.workoutSetId) &&
                hasActualChanges(setData)
              : false;

            return (
              <TableRow key={`${exercise.exerciseId}-set-${setIndex}`}>
                {setData.isLogged && isEditing ? (
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSaveSetChanges(setData)}
                        disabled={
                          !isModified || updatingSetId === setData.workoutSetId
                        }
                        title={
                          !isModified
                            ? "No changes to save"
                            : updatingSetId === setData.workoutSetId
                            ? "Saving..."
                            : "Save changes to this set"
                        }
                      >
                        {updatingSetId === setData.workoutSetId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : successSetId === setData.workoutSetId ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span className="sr-only">Save set</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 "
                        disabled={deletingSetId === setData.workoutSetId}
                        onClick={() =>
                          handleDeleteSet(
                            setData.workoutSetId,
                            setData.workoutExerciseId,
                            setData.workoutLogId
                          )
                        }
                      >
                        {deletingSetId === setData.workoutSetId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                        <span className="sr-only">Delete set</span>
                      </Button>
                    </div>
                  </TableCell>
                ) : (
                  <TableCell className="text-center">
                    <Checkbox
                      checked={setData.isLogged}
                      onCheckedChange={() => {
                        handleSetToggle(
                          exercise.exerciseId,
                          setIndex,
                          exercise,
                          setData
                        );
                      }}
                      disabled={
                        setData.isLogged || (isStartingWorkout && !isEditing)
                      }
                      className="h-4 w-4"
                    />
                  </TableCell>
                )}

                <TableCell className="font-medium text-center px-2">
                  {setData.setNumber}
                </TableCell>
                <TableCell
                  className={`text-center ${
                    !isMobile || showPrevious ? "px-4" : "px-2"
                  }`}
                >
                  <Input
                    placeholder={
                      setData.reps > 0 && setData.weight === 0
                        ? getRecommendedProgressionBilateralValues(setData)
                        : setData.previousWeight
                        ? String(setData.previousWeight)
                        : "-"
                    }
                    type="number"
                    min="0"
                    inputMode="decimal"
                    step="2.5"
                    value={setData.weight === 0 ? "" : setData.weight}
                    onChange={(e) =>
                      handleUpdateSetData(
                        exercise.exerciseId,
                        setIndex,
                        "weight",
                        e.target.value
                      )
                    }
                    disabled={
                      (setData.isLogged && !isEditing) ||
                      (isStartingWorkout && !isEditing)
                    }
                    className={`${
                      exercise.laterality === "unilateral"
                        ? isMobile
                          ? "w-16"
                          : "w-20"
                        : "w-20"
                    } mx-auto text-center ${
                      setData.isLogged
                        ? "bg-muted/50"
                        : isFieldInvalid(
                            exercise.exerciseId,
                            setIndex,
                            "weight"
                          )
                        ? "border-red-500"
                        : ""
                    } ${getProgressionColor(setData, isDark)}`}
                  />
                </TableCell>
                {exercise.laterality === "unilateral" ? (
                  <>
                    <TableCell
                      className={`text-center ${
                        !isMobile || showPrevious ? "px-4" : "px-2"
                      }`}
                    >
                      <Input
                        placeholder={
                          setData.previousLeftReps
                            ? String(setData.previousLeftReps)
                            : "-"
                        }
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={setData.leftReps === 0 ? "" : setData.leftReps}
                        onChange={(e) =>
                          handleUpdateSetData(
                            exercise.exerciseId,
                            setIndex,
                            "leftReps",
                            e.target.value
                          )
                        }
                        disabled={
                          (setData.isLogged && !isEditing) ||
                          (isStartingWorkout && !isEditing)
                        }
                        className={`${
                          isMobile ? "w-16" : "w-20"
                        } mx-auto text-center ${
                          setData.isLogged
                            ? "bg-muted/50"
                            : isFieldInvalid(
                                exercise.exerciseId,
                                setIndex,
                                "leftReps"
                              )
                            ? "border-red-500"
                            : ""
                        } ${getProgressionColor(setData, isDark)}`}
                      />
                    </TableCell>
                    <TableCell
                      className={`text-center ${
                        !isMobile || showPrevious ? "px-4" : "px-2"
                      }`}
                    >
                      <Input
                        placeholder={
                          setData.previousRightReps
                            ? String(setData.previousRightReps)
                            : "-"
                        }
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={setData.rightReps === 0 ? "" : setData.rightReps}
                        onChange={(e) =>
                          handleUpdateSetData(
                            exercise.exerciseId,
                            setIndex,
                            "rightReps",
                            e.target.value
                          )
                        }
                        disabled={
                          (setData.isLogged && !isEditing) ||
                          (isStartingWorkout && !isEditing)
                        }
                        className={`${
                          isMobile ? "w-16" : "w-20"
                        } mx-auto text-center ${
                          setData.isLogged
                            ? "bg-muted/50"
                            : isFieldInvalid(
                                exercise.exerciseId,
                                setIndex,
                                "rightReps"
                              )
                            ? "border-red-500"
                            : ""
                        } ${getProgressionColor(setData, isDark)}`}
                      />
                    </TableCell>
                  </>
                ) : (
                  <TableCell
                    className={`text-center ${
                      !isMobile || showPrevious ? "px-4" : "px-2"
                    }`}
                  >
                    <Input
                      placeholder={
                        setData.weight > 0 && setData.reps === 0
                          ? getRecommendedProgressionBilateralValues(setData)
                          : setData.previousLeftReps
                          ? String(setData.previousLeftReps)
                          : "-"
                      }
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={setData.reps === 0 ? "" : setData.reps}
                      onChange={(e) =>
                        handleUpdateSetData(
                          exercise.exerciseId,
                          setIndex,
                          "reps",
                          e.target.value
                        )
                      }
                      disabled={
                        (setData.isLogged && !isEditing) ||
                        (isStartingWorkout && !isEditing)
                      }
                      className={`w-20 mx-auto text-center ${
                        setData.isLogged
                          ? "bg-muted/50"
                          : isFieldInvalid(
                              exercise.exerciseId,
                              setIndex,
                              "reps"
                            )
                          ? "border-red-500"
                          : ""
                      } ${getProgressionColor(setData, isDark)}`}
                    />
                  </TableCell>
                )}
                {(!isMobile || showPrevious) && (
                  <>
                    <TableCell className="text-slate-500 text-center px-4 border-l border-muted">
                      {setData.previousWeight ? setData.previousWeight : "-"}
                    </TableCell>
                    {exercise.laterality === "unilateral" ? (
                      <>
                        <TableCell className="text-slate-500 text-center px-4">
                          {setData.previousLeftReps
                            ? setData.previousLeftReps
                            : "-"}
                        </TableCell>
                        <TableCell className="text-slate-500 text-center px-4">
                          {setData.previousRightReps
                            ? setData.previousRightReps
                            : "-"}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell className="text-slate-500 text-center px-4">
                        {setData.previousLeftReps
                          ? setData.previousLeftReps
                          : "-"}
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
