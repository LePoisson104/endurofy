"use client";

import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  Target,
  Dumbbell,
  Check,
  Edit,
  Save,
  Trash2,
  Loader2,
  MoreVertical,
  History,
} from "lucide-react";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  useDeleteWorkoutSetWithCascadeMutation,
  useUpdateWorkoutSetMutation,
  useDeleteWorkoutLogMutation,
  useDeleteWorkoutExerciseMutation,
} from "@/api/workout-log/workout-log-api-slice";
import { toast } from "sonner";
import { WorkoutDetailSkeleton } from "@/components/skeletons/workout-detail-skeleton";
import { useUpdateWorkoutLogNameMutation } from "@/api/workout-log/workout-log-api-slice";
import DeleteDialog from "@/components/dialog/delete-dialog";
import CompletedBadge from "@/components/badges/status-badges";
import ExerciseNotes from "./exercise-notes";
import {
  ResponsiveMenu,
  createMenuItem,
  createMenuSection,
} from "@/components/ui/responsive-menu";

import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";

interface WorkoutDetailModalProps {
  workout: WorkoutLog | null;
  workoutLogType: string;
  isLoading?: boolean;
  handleBackToList: () => void;
}

export function WorkoutDetailView({
  workout,
  workoutLogType,
  isLoading = false,
  handleBackToList,
}: WorkoutDetailModalProps) {
  const isDark = useGetCurrentTheme();
  const isMobile = useIsMobile();
  const router = useRouter();

  const [showPrevious, setShowPrevious] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatingSetId, setUpdatingSetId] = useState<string | null>(null);
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
  const [successSetId, setSuccessSetId] = useState<string | null>(null);
  const [modifiedSets, setModifiedSets] = useState<Set<string>>(new Set());
  const [workoutLogName, setWorkoutLogName] = useState(workout?.title || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [context, setContext] = useState("");
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(
    null
  );
  const [exerciseNotes, setExerciseNotes] = useState<{ [id: string]: string }>(
    {}
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [originalValues, setOriginalValues] = useState<{
    [setId: string]: any;
  }>({});
  const [editedValues, setEditedValues] = useState<{
    [setId: string]: any;
  }>({});

  const [deleteWorkoutSetWithCascade] =
    useDeleteWorkoutSetWithCascadeMutation();
  const [updateWorkoutSet] = useUpdateWorkoutSetMutation();
  const [updateWorkoutLogName, { isLoading: isUpdatingWorkoutLogName }] =
    useUpdateWorkoutLogNameMutation();
  const [deleteWorkoutLog, { isLoading: isDeletingWorkoutLog }] =
    useDeleteWorkoutLogMutation();
  const [deleteWorkoutExercise] = useDeleteWorkoutExerciseMutation();

  // Menu configuration for responsive menu
  const editMenuSections = [
    createMenuSection([
      createMenuItem("edit", isEditing ? "Done" : "Edit", Edit, () =>
        setIsEditing(!isEditing)
      ),
    ]),
    // Show Previous item only appears in mobile drawer
    ...(isMobile
      ? [
          createMenuSection([
            createMenuItem(
              "show-previous",
              showPrevious ? "Hide Previous" : "Show Previous",
              History,
              () => setShowPrevious(!showPrevious)
            ),
          ]),
        ]
      : []),
    createMenuSection([
      createMenuItem(
        "delete",
        "Delete",
        Trash2,
        () => {
          setContext("Log");
          setShowDeleteDialog(true);
        },
        { variant: "destructive" }
      ),
    ]),
  ];

  // Helper functions for exercise notes (similar to program-workout-log)
  const getExerciseNotes = (workoutExerciseId: string): string => {
    if (workout?.workoutExercises) {
      const exercise = workout.workoutExercises.find(
        (ex) => ex.workoutExerciseId === workoutExerciseId
      );
      return exercise?.notes || "";
    }
    return "";
  };

  const getWorkoutExerciseId = (exerciseId: string): string => {
    // In workout detail view, we need to find the workoutExerciseId by exerciseName
    // since we don't have exerciseId in WorkoutExercise interface
    if (workout?.workoutExercises) {
      const exercise = workout.workoutExercises.find(
        (ex) => ex.exerciseName === exerciseId // Using exerciseName as identifier
      );
      return exercise?.workoutExerciseId || "";
    }
    return "";
  };

  const hasLoggedSets = (exerciseName: string): boolean => {
    if (workout?.workoutExercises) {
      const exercise = workout.workoutExercises.find(
        (ex) => ex.exerciseName === exerciseName
      );
      return !!(exercise?.workoutSets && exercise.workoutSets.length > 0);
    }
    return false;
  };

  // Scroll to top when workout detail view is displayed
  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, []);

  // Store original values when workout is loaded
  useEffect(() => {
    if (workout && workout.workoutExercises) {
      const originals: { [setId: string]: any } = {};
      const edited: { [setId: string]: any } = {};

      workout.workoutExercises.forEach((exercise) => {
        exercise.workoutSets.forEach((set) => {
          const setId = set.workoutSetId;
          originals[setId] = { ...set };
          edited[setId] = { ...set };
        });
      });

      setOriginalValues(originals);
      setEditedValues(edited);
      setWorkoutLogName(workout.title);
    }
  }, [workout]);

  // Reset unsaved changes when exiting edit mode
  useEffect(() => {
    if (!isEditing && modifiedSets.size > 0) {
      // Reset edited values back to original values
      const resetValues = { ...editedValues };
      modifiedSets.forEach((setId) => {
        if (originalValues[setId]) {
          resetValues[setId] = { ...originalValues[setId] };
        }
      });
      setEditedValues(resetValues);
      setModifiedSets(new Set());
    }
  }, [isEditing, modifiedSets, originalValues, editedValues]);

  const calculateTotalVolume = useMemo(() => {
    if (workout) {
      return workout.workoutExercises.reduce(
        (sum, exercise) =>
          sum +
          exercise.workoutSets.reduce((setSum, set) => {
            const leftReps = set.repsLeft || 0;
            const rightReps = set.repsRight || 0;
            const weight = set.weight || 0;
            return setSum + weight * leftReps + weight * rightReps;
          }, 0),
        0
      );
    }
    return 0;
  }, [workout]);

  const calculateTotalSets = useMemo(() => {
    if (workout) {
      return workout.workoutExercises.reduce(
        (sum, exercise) => sum + exercise.workoutSets.length,
        0
      );
    }
    return 0;
  }, [workout]);

  if (isLoading) {
    return <WorkoutDetailSkeleton />;
  }

  if (!workout) {
    return;
  }

  const handleEditWorkout = () => {
    // Navigate to workout-log page with the specific date and program
    const workoutDate = new Date(workout.workoutDate);
    const formattedDate = workoutDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    localStorage.setItem("selectedDate", formattedDate);
    localStorage.setItem("selectedTab", "log");
    router.push(`/workout-log?date=${formattedDate}&tab=log`);
  };

  // Check if current values differ from original values
  const hasActualChanges = (setId: string): boolean => {
    if (!originalValues[setId] || !editedValues[setId]) {
      return false;
    }

    const original = originalValues[setId];
    const edited = editedValues[setId];

    return (
      String(edited.weight || "") !== String(original.weight || "") ||
      String(edited.repsLeft || "") !== String(original.repsLeft || "") ||
      String(edited.repsRight || "") !== String(original.repsRight || "")
    );
  };

  // Handle input changes
  const handleInputChange = (
    setId: string,
    field: "weight" | "repsLeft" | "repsRight",
    value: string
  ) => {
    setEditedValues((prev) => ({
      ...prev,
      [setId]: {
        ...prev[setId],
        [field]: value === "" ? 0 : Number(value),
      },
    }));

    setModifiedSets((prev) => new Set(prev).add(setId));
  };

  // Handle save changes
  const handleSaveSetChanges = async (setId: string, exercise: any) => {
    if (!editedValues[setId]) return;

    setUpdatingSetId(setId);
    setSuccessSetId(null);

    const editedSet = editedValues[setId];
    let workoutSetPayload = {};

    if (exercise.laterality === "bilateral") {
      workoutSetPayload = {
        weight: editedSet.weight,
        weightUnit: editedSet.weightUnit || "lb",
        leftReps: Number(editedSet.repsLeft),
        rightReps: Number(editedSet.repsLeft), // For bilateral, both sides are the same
      };
    } else {
      workoutSetPayload = {
        weight: editedSet.weight,
        weightUnit: editedSet.weightUnit || "lb",
        leftReps: editedSet.repsLeft,
        rightReps: editedSet.repsRight,
      };
    }

    try {
      await updateWorkoutSet({
        workoutSetId: editedSet.workoutSetId,
        workoutExerciseId: editedSet.workoutExerciseId,
        workoutSetPayload: workoutSetPayload,
      }).unwrap();

      // Show success state
      setSuccessSetId(setId);

      // Update original values with the new saved values
      setOriginalValues((prev) => ({
        ...prev,
        [setId]: { ...editedSet },
      }));

      // Remove from modified sets after successful save
      setModifiedSets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(setId);
        return newSet;
      });

      setSuccessSetId(null);
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

  // Handle delete set
  const handleDeleteSet = async (
    workoutSetId: string,
    workoutExerciseId: string,
    workoutLogId: string
  ) => {
    setDeletingSetId(workoutSetId);
    try {
      await deleteWorkoutSetWithCascade({
        workoutSetId,
        workoutExerciseId,
        workoutLogId,
      }).unwrap();
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  const handleUpdateWorkoutLogName = async () => {
    if (workoutLogName.trim() === "") {
      setWorkoutLogName(workout.title);
      return;
    }

    try {
      await updateWorkoutLogName({
        workoutLogId: workout.workoutLogId,
        title: workoutLogName,
      }).unwrap();
      toast.success("Workout log name updated");
    } catch (error: any) {
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to update workout log name");
      }
    }
  };

  const handleDelete = async () => {
    try {
      if (context === "Exercise") {
        await deleteWorkoutExercise({
          workoutExerciseId: deletingExerciseId,
          workoutLogId: workout.workoutLogId,
          workoutLogType: workoutLogType,
        }).unwrap();
        toast.success("Workout exercise deleted");
      } else if (context === "Log") {
        await deleteWorkoutLog({
          workoutLogId: workout.workoutLogId,
        }).unwrap();
        toast.success("Workout log deleted");
        // Navigate back to workout-log page after deleting the log
        router.push("/workout-log");
      }
      setIsEditing(false);
      setShowDeleteDialog(false);
      setWorkoutLogName("");
    } catch (error: any) {
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to delete workout log");
      }
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToList}
          className="gap-1 arrow-button"
        >
          <svg
            className="arrow-icon transform rotate-180 mr-2"
            viewBox="0 -3.5 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="arrow-icon__tip"
              d="M8 15L14 8.5L8 2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              className="arrow-icon__line"
              x1="13"
              y1="8.5"
              y2="8.5"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          Back to History
        </Button>
        {isMobile ? (
          <Button
            onClick={() => setIsDrawerOpen(true)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-card/50 dark:hover:bg-card/50"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        ) : (
          <ResponsiveMenu
            sections={editMenuSections}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-card/50 dark:hover:bg-card/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          />
        )}

        <ResponsiveMenu
          sections={editMenuSections}
          isOpen={isDrawerOpen}
          setIsOpen={setIsDrawerOpen}
          dropdownAlign="end"
          dropdownWidth="w-40"
        />
      </header>
      <Card>
        <CardContent>
          <div
            className={`flex ${
              isMobile
                ? "flex-col justify-start gap-2"
                : "flex-row items-center justify-between"
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <>
                    <Input
                      value={workoutLogName}
                      onChange={(e) => setWorkoutLogName(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUpdateWorkoutLogName}
                      disabled={
                        workoutLogName.trim() === "" ||
                        isUpdatingWorkoutLogName ||
                        workoutLogName === workout.title
                      }
                    >
                      {isUpdatingWorkoutLogName ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <CardTitle>{workout.title}</CardTitle>
                )}

                {workout.status === "completed" && <CompletedBadge />}
              </div>
              <div
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                } mt-1`}
              >
                {workout.status === "completed"
                  ? "Completed on "
                  : "Started on "}
                {format(parseISO(workout.workoutDate), "EEEE, MMMM d, yyyy")}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEditWorkout}
              className="flex items-center gap-2 w-fit arrow-button"
            >
              {workout.status === "completed"
                ? "Go To Workout"
                : "Complete Workout"}
              <svg
                className="arrow-icon transform rotate-360"
                viewBox="0 -3.5 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="arrow-icon__tip"
                  d="M8 15L14 8.5L8 2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  className="arrow-icon__line"
                  x1="13"
                  y1="8.5"
                  y2="8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </Button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mt-4">
            <div className="shadow-none">
              <div className="p-4 text-center">
                <Dumbbell className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
                <div className="text-sm font-medium">Total Exercises</div>
                <div className="text-sm font-bold">
                  {workout.workoutExercises.length}
                </div>
              </div>
            </div>
            <div className="shadow-none">
              <div className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-sky-500" />
                <div className="text-sm font-medium">Total Sets</div>
                <div className="text-sm font-bold">{calculateTotalSets}</div>
              </div>
            </div>
            <div className="shadow-none">
              <div className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-sm font-medium">Volume</div>
                <div className="text-sm font-bold">
                  {(calculateTotalVolume / 1000).toFixed(1)}K lbs
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardContent className={`${isMobile && "p-4"}`}>
          <div className="space-y-6">
            {workout.workoutExercises.map((exercise) => (
              <div
                key={exercise.workoutExerciseId}
                className={`${
                  isMobile ? "p-0 border-none" : "p-4 border rounded-lg"
                }`}
              >
                <div
                  className={`flex mb-4 ${
                    isMobile
                      ? "flex-col justify-start"
                      : "items-center justify-between"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit text-destructive hover:text-destructive/80"
                        onClick={() => {
                          setContext("Exercise");
                          setShowDeleteDialog(true);
                          setDeletingExerciseId(exercise.workoutExerciseId);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <h4 className="font-semibold text-lg">
                      {exercise.exerciseName}
                    </h4>
                  </div>
                  <div
                    className={`text-sm ${
                      isMobile ? "text-left" : "text-right"
                    } ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    <div>
                      Volume:{" "}
                      {(
                        exercise.workoutSets.reduce(
                          (sum, set) =>
                            sum +
                            (set.weight || 0) * (set.repsLeft || 0) +
                            (set.weight || 0) * (set.repsRight || 0),
                          0
                        ) / 1000
                      ).toFixed(1)}
                      K lbs
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto mb-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        {isEditing && (
                          <TableHead className="w-[60px] text-center">
                            Actions
                          </TableHead>
                        )}
                        <TableHead className="w-[60px] text-center px-2">
                          Set #
                        </TableHead>
                        <TableHead
                          className={`w-[120px] text-center ${
                            !isMobile || showPrevious ? "px-4" : "px-2"
                          }`}
                        >
                          Weight{" "}
                          {exercise.laterality === "bilateral" ? "(lbs)" : ""}
                        </TableHead>
                        {exercise.laterality === "unilateral" ? (
                          <>
                            <TableHead
                              className={`w-[120px] text-center  ${
                                !isMobile || showPrevious ? "px-4" : "px-2"
                              }`}
                            >
                              Left
                            </TableHead>
                            <TableHead
                              className={`w-[120px] text-center  ${
                                !isMobile || showPrevious ? "px-4" : "px-2"
                              }`}
                            >
                              Right
                            </TableHead>
                          </>
                        ) : (
                          <TableHead
                            className={`w-[120px] text-center  ${
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
                            <TableHead className="w-[120px] text-center px-4">
                              Volume (lbs)
                            </TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercise.workoutSets.map((set, setIndex) => {
                        const setId = set.workoutSetId;
                        const currentSet = editedValues[setId] || set;
                        const isModified = setId
                          ? modifiedSets.has(setId) && hasActualChanges(setId)
                          : false;

                        const volume =
                          exercise.laterality === "unilateral"
                            ? (currentSet.weight || 0) *
                              ((currentSet.repsLeft || 0) +
                                (currentSet.repsRight || 0))
                            : (currentSet.weight || 0) *
                              (currentSet.repsLeft || 0);

                        return (
                          <TableRow key={setIndex}>
                            {isEditing && (
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      handleSaveSetChanges(setId, exercise)
                                    }
                                    disabled={
                                      !isModified || updatingSetId === setId
                                    }
                                    title={
                                      !isModified
                                        ? "No changes to save"
                                        : updatingSetId === setId
                                        ? "Saving..."
                                        : "Save changes to this set"
                                    }
                                  >
                                    {updatingSetId === setId ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : successSetId === setId ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Save className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive"
                                    disabled={deletingSetId === setId}
                                    onClick={() =>
                                      handleDeleteSet(
                                        set.workoutSetId,
                                        set.workoutExerciseId,
                                        workout.workoutLogId
                                      )
                                    }
                                  >
                                    {deletingSetId === setId ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            )}

                            <TableCell className="font-medium text-center px-2">
                              {setIndex + 1}
                            </TableCell>
                            <TableCell
                              className={`text-center ${
                                !isMobile || showPrevious ? "px-4" : "px-2"
                              }`}
                            >
                              {isEditing ? (
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="2.5"
                                  value={
                                    currentSet.weight === 0
                                      ? ""
                                      : currentSet.weight
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      setId,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  className={`${
                                    isMobile
                                      ? exercise.laterality === "unilateral"
                                        ? "w-16"
                                        : "w-18"
                                      : "w-22"
                                  } mx-auto text-center`}
                                />
                              ) : (
                                <div className={`${isMobile ? "text-sm" : ""}`}>
                                  {currentSet.weight || 0}
                                </div>
                              )}
                            </TableCell>
                            {exercise.laterality === "unilateral" ? (
                              <>
                                <TableCell
                                  className={`text-center ${
                                    !isMobile || showPrevious ? "px-4" : "px-2"
                                  }`}
                                >
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      inputMode="numeric"
                                      min="0"
                                      value={
                                        currentSet.repsLeft === 0
                                          ? ""
                                          : currentSet.repsLeft
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          setId,
                                          "repsLeft",
                                          e.target.value
                                        )
                                      }
                                      className={`${
                                        isMobile ? "w-16" : "w-22"
                                      } mx-auto text-center`}
                                    />
                                  ) : (
                                    <div
                                      className={`${isMobile ? "text-sm" : ""}`}
                                    >
                                      {currentSet.repsLeft || 0}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell
                                  className={`text-center ${
                                    !isMobile || showPrevious ? "px-4" : "px-2"
                                  }`}
                                >
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      inputMode="numeric"
                                      min="0"
                                      value={
                                        currentSet.repsRight === 0
                                          ? ""
                                          : currentSet.repsRight
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          setId,
                                          "repsRight",
                                          e.target.value
                                        )
                                      }
                                      className={`${
                                        isMobile ? "w-16" : "w-22"
                                      } mx-auto text-center`}
                                    />
                                  ) : (
                                    <div
                                      className={`${isMobile ? "text-sm" : ""}`}
                                    >
                                      {currentSet.repsRight || 0}
                                    </div>
                                  )}
                                </TableCell>
                              </>
                            ) : (
                              <TableCell
                                className={`text-center ${
                                  !isMobile || showPrevious ? "px-4" : "px-2"
                                }`}
                              >
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    value={
                                      currentSet.repsLeft === 0
                                        ? ""
                                        : currentSet.repsLeft
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        setId,
                                        "repsLeft",
                                        e.target.value
                                      )
                                    }
                                    className={`${
                                      isMobile ? "w-18" : "w-22"
                                    } mx-auto text-center`}
                                  />
                                ) : (
                                  <div
                                    className={`${isMobile ? "text-sm" : ""}`}
                                  >
                                    {currentSet.repsLeft || 0}
                                  </div>
                                )}
                              </TableCell>
                            )}
                            {(!isMobile || showPrevious) && (
                              <>
                                <TableCell className="text-slate-500 text-center px-4 border-l border-muted">
                                  {set.previousWeight
                                    ? set.previousWeight
                                    : "-"}
                                </TableCell>
                                {exercise.laterality === "unilateral" ? (
                                  <>
                                    <TableCell className="text-slate-500 text-center px-4">
                                      {set.previousLeftReps
                                        ? set.previousLeftReps
                                        : "-"}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-center px-4">
                                      {set.previousRightReps
                                        ? set.previousRightReps
                                        : "-"}
                                    </TableCell>
                                  </>
                                ) : (
                                  <TableCell className="text-slate-500 text-center px-4">
                                    {set.previousLeftReps
                                      ? set.previousLeftReps
                                      : "-"}
                                  </TableCell>
                                )}
                                <TableCell className="text-center font-medium px-4">
                                  {volume}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <ExerciseNotes
                  exerciseNotes={exerciseNotes}
                  setExerciseNotes={setExerciseNotes}
                  getExerciseNotes={getExerciseNotes}
                  getWorkoutExerciseId={getWorkoutExerciseId}
                  hasAnyLoggedSets={hasLoggedSets(exercise.exerciseName)}
                  exercise={{
                    exerciseId: exercise.exerciseName, // Use exerciseName as exerciseId
                    exerciseName: exercise.exerciseName,
                    bodyPart: exercise.bodyPart,
                    laterality: exercise.laterality as
                      | "bilateral"
                      | "unilateral",
                    sets: exercise.workoutSets.length,
                    minReps: 0, // Not available in WorkoutExercise
                    maxReps: 0, // Not available in WorkoutExercise
                    exerciseOrder: exercise.exerciseOrder,
                  }}
                  readOnly={!isEditing}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        handleDelete={handleDelete}
        isDeleting={isDeletingWorkoutLog}
        title={`Delete Workout ${context}`}
        children={`Are you sure you want to delete this workout ${context.toLowerCase()}? This action cannot be undone.`}
      />
    </div>
  );
}
