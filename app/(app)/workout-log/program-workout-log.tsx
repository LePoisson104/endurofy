"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Check,
  History,
  Loader2,
  Trash2,
  MoreVertical,
  Edit,
  Timer,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import {
  Exercise,
  WorkoutProgram,
} from "@/interfaces/workout-program-interfaces";
import {
  ExercisePayload,
  WorkoutLogPayload,
} from "@/interfaces/workout-log-interfaces";
import ExerciseTable from "./exercise-table";
import { useExerciseSets } from "@/hooks/use-exercise-sets";
import { useWorkoutDay } from "@/hooks/use-workout-day";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import {
  useGetWorkoutLogQuery,
  useCreateWorkoutLogMutation,
} from "@/api/workout-log/workout-log-api-slice";
import {
  useUpdateWorkoutLogStatusMutation,
  useGetPreviousWorkoutLogQuery,
  useDeleteWorkoutLogMutation,
  useDeleteWorkoutExerciseMutation,
} from "@/api/workout-log/workout-log-api-slice";
import { ProgramWorkoutLogSkeleton } from "@/components/skeletons/program-workout-log-skeleton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useUpdateWorkoutLogNameMutation } from "@/api/workout-log/workout-log-api-slice";
import ExerciseNotes from "./exercise-notes";
import DeleteDialog from "@/components/dialog/delete-dialog";
import { CompletedBadge } from "@/components/badges/status-badges";
import BodyPartBadge from "@/components/badges/bodypart-badge";
import CustomBadge from "@/components/badges/custom-badge";
import {
  ResponsiveMenu,
  createMenuItem,
  createMenuSection,
} from "@/components/ui/responsive-menu";
import { WorkoutTimers } from "@/components/workout/workout-timers";
import { useUpdateExpectedNumberOfSetsMutation } from "@/api/workout-log/workout-log-api-slice";
import { formatTime } from "@/components/workout/timer-helper";
import WorkoutSummaryModal from "@/components/modals/workout-summary-modal";

interface ProgramWorkoutLogProps {
  program: WorkoutProgram;
  selectedDate: Date;
}

export function ProgramWorkoutLog({
  program,
  selectedDate,
}: ProgramWorkoutLogProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const { selectedDay } = useWorkoutDay(program, selectedDate);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState<{ [id: string]: string }>(
    {}
  );
  const [workoutLogName, setWorkoutLogName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [context, setContext] = useState("");
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(
    null
  );

  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const previousStatusRef = useRef<string | null>(null);

  const [updateWorkoutLogStatus, { isLoading: isUpdatingWorkoutLogStatus }] =
    useUpdateWorkoutLogStatusMutation();
  const [updateExpectedNumberOfSets] = useUpdateExpectedNumberOfSetsMutation();
  const [updateWorkoutLogName, { isLoading: isUpdatingWorkoutLogName }] =
    useUpdateWorkoutLogNameMutation();
  const [deleteWorkoutLog, { isLoading: isDeletingWorkoutLog }] =
    useDeleteWorkoutLogMutation();
  const [deleteWorkoutExercise] = useDeleteWorkoutExerciseMutation();
  const { data: workoutLog, isLoading: isLoadingWorkoutLog } =
    useGetWorkoutLogQuery({
      userId: user?.user_id,
      programId: program.programId,
      startDate: format(selectedDate, "yyyy-MM-dd"),
      endDate: format(selectedDate, "yyyy-MM-dd"),
    });

  const { data: previousWorkoutLog, isLoading: isLoadingPreviousWorkoutLog } =
    useGetPreviousWorkoutLogQuery({
      userId: user?.user_id,
      programId: program.programId,
      dayId: selectedDay?.dayId,
      currentWorkoutDate: format(selectedDate, "yyyy-MM-dd"),
    });

  const [createWorkoutLog] = useCreateWorkoutLogMutation();

  const {
    exerciseSets,
    updateSetData,
    toggleSetLogged,
    isFieldInvalid,
    isExerciseFullyLogged,
    hasLoggedSets,
    getWorkoutExerciseId,
    getExerciseNotes,
    activeExercises,
  } = useExerciseSets(workoutLog, [program], selectedDay, previousWorkoutLog);

  useEffect(() => {
    if (!selectedDay || !workoutLog?.data[0]) return;
    if (selectedDay.exercises.length > 0 && activeExercises.length === 0)
      return;

    const currentWorkout = workoutLog.data[0];
    if (selectedDay.dayId !== currentWorkout.dayId) return;

    const logged = currentWorkout.workoutExercises.reduce(
      (acc: number, exercise: any) => acc + exercise.workoutSets.length,
      0
    );

    const totalSets = activeExercises.reduce(
      (acc: number, exercise: any) => acc + exercise.sets,
      0
    );

    const expectedNumberOfSets = currentWorkout.expectedNumberOfSets;

    if (expectedNumberOfSets === 0) return;

    if (
      totalSets !== expectedNumberOfSets &&
      currentWorkout.status === "incomplete"
    ) {
      updateExpectedNumberOfSets({
        workoutLogId: currentWorkout.workoutLogId,
        expectedNumberOfSets: totalSets,
      }).unwrap();

      return;
    }

    const shouldBeCompleted = logged === expectedNumberOfSets;
    const isCompleted = currentWorkout.status === "completed";

    if (shouldBeCompleted && !isCompleted) {
      updateWorkoutLogStatus({
        workoutLogId: currentWorkout.workoutLogId,
        status: "completed",
      }).unwrap();
    } else if (!shouldBeCompleted && isCompleted) {
      updateWorkoutLogStatus({
        workoutLogId: currentWorkout.workoutLogId,
        status: "incomplete",
      }).unwrap();
    }
  }, [
    selectedDay,
    workoutLog,
    updateWorkoutLogStatus,
    updateExpectedNumberOfSets,
  ]);

  // Track status change from incomplete to completed
  useEffect(() => {
    const currentStatus = workoutLog?.data[0]?.status;
    const previousStatus = previousStatusRef.current;

    // Initialize ref on first load if not set
    if (!previousStatus && currentStatus) {
      previousStatusRef.current = currentStatus;
      return;
    }

    // Check if status changed from incomplete to completed
    if (
      previousStatus === "incomplete" &&
      currentStatus === "completed" &&
      !isUpdatingWorkoutLogStatus
    ) {
      // Show summary modal after successful completion
      setShowSummaryModal(true);
    }

    // Update the previous status ref
    if (currentStatus && currentStatus !== previousStatus) {
      previousStatusRef.current = currentStatus;
    }
  }, [workoutLog?.data[0]?.status, isUpdatingWorkoutLogStatus]);

  // Load existing notes when workout log data is available
  useEffect(() => {
    if (selectedDay && workoutLog) {
      const initialNotes: { [id: string]: string } = {};

      selectedDay.exercises.forEach((exercise) => {
        const workoutExerciseId = getWorkoutExerciseId(exercise.exerciseId);
        const existingNotes = getExerciseNotes(workoutExerciseId);

        if (existingNotes && existingNotes.trim()) {
          initialNotes[workoutExerciseId] = existingNotes;
        }
      });

      // Only update state if there are actually notes to set
      if (Object.keys(initialNotes).length > 0) {
        setExerciseNotes((prev) => ({
          ...prev,
          ...initialNotes,
        }));
      }
      setWorkoutLogName(workoutLog.data[0]?.title || "");

      // Initialize previous status ref
      if (workoutLog.data[0]?.status) {
        previousStatusRef.current = workoutLog.data[0].status;
      }
    }
  }, [selectedDay, workoutLog]); // Remove function dependencies

  const getPreviousExerciseNotes = (exerciseId: string) => {
    if (previousWorkoutLog?.data?.length > 0) {
      const exercise = previousWorkoutLog?.data?.find(
        (ex: any) => ex.programExerciseId === exerciseId
      );
      return exercise?.notes || null;
    }
    return null;
  };

  const handleUpdateWorkoutLogName = async () => {
    if (workoutLogName.trim() === "") {
      setWorkoutLogName(workoutLog?.data[0].title);
      return;
    }

    try {
      await updateWorkoutLogName({
        workoutLogId: workoutLog?.data[0].workoutLogId,
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
          workoutLogId: workoutLog?.data[0].workoutLogId,
          workoutLogType: "program",
        }).unwrap();
        toast.success("Workout exercise deleted");
      } else if (context === "Log") {
        await deleteWorkoutLog({
          workoutLogId: workoutLog?.data[0].workoutLogId,
        }).unwrap();
        toast.success("Workout log deleted");
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

  const onSaveExerciseSets = async (exercisePayload: ExercisePayload) => {
    const workoutLogPayload: WorkoutLogPayload = {
      workoutName: selectedDay?.dayName || "",
      workoutDate: format(selectedDate, "yyyy-MM-dd"),
      ...exercisePayload,
    };

    if (
      exercisePayload.weight === 0 &&
      exercisePayload.repsLeft === 0 &&
      exercisePayload.repsRight === 0
    ) {
      return;
    }

    try {
      await createWorkoutLog({
        userId: user?.user_id || "",
        programId: program.programId || "",
        dayId: selectedDay?.dayId || "",
        workoutLog: workoutLogPayload,
      }).unwrap();
    } catch (error: any) {
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to save workout log");
      }
    }
  };

  if (isLoadingWorkoutLog || isLoadingPreviousWorkoutLog) {
    return <ProgramWorkoutLogSkeleton />;
  }

  if (!selectedDay) {
    return (
      <>
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workout scheduled for this day. This is a rest day.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center items-center w-full mt-4 border rounded-lg h-[400px]">
          <Image
            src={
              isDark ? "/images/darksnorlax.png" : "/images/lightsnorlax.png"
            }
            alt="Rest Day"
            width={100}
            height={100}
            style={{ width: "auto", height: "auto", objectFit: "contain" }}
            priority
          />
        </div>
      </>
    );
  }

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

  return (
    <>
      {/* Spinner Overlay */}
      {isUpdatingWorkoutLogStatus && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Completing workout...
            </p>
          </div>
        </div>
      )}

      <div
        className={`space-y-6 ${
          !isEditing && workoutLog?.data[0]?.status !== "completed"
            ? "pb-15"
            : ""
        }`}
      >
        <div className="flex flex-col space-y-2">
          <div className="space-y-2 flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div>
                {workoutLog?.data?.length > 0 ? (
                  isEditing ? (
                    <div className="flex items-center gap-2">
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
                          workoutLogName === workoutLog?.data[0].title
                        }
                      >
                        {isUpdatingWorkoutLogName ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold">
                        {workoutLog.data[0].title}
                      </h2>
                      {workoutLog.data[0].status === "completed" && (
                        <CompletedBadge />
                      )}
                    </div>
                  )
                ) : (
                  <h2 className="text-xl font-bold">{selectedDay?.dayName}</h2>
                )}
              </div>
              <p className="text-sm text-slate-500">
                {format(selectedDate, "MMMM d, yyyy")}
              </p>
              {workoutLog?.data[0]?.status === "completed" && (
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Timer className="h-4 w-4" />{" "}
                  {formatTime(workoutLog?.data[0]?.timer || 0)}
                </p>
              )}
            </div>

            {workoutLog?.data?.length > 0 &&
              (isMobile ? (
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
                  dropdownAlign="end"
                  dropdownWidth="w-40"
                  onClose={() => {
                    // Optional: Add any additional close logic here
                  }}
                />
              ))}
          </div>
        </div>

        {selectedDay && (
          <div className="space-y-6">
            {[...activeExercises]
              .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
              .map((exercise: Exercise) => {
                const sets = exerciseSets[exercise.exerciseId] || [];
                const isFullyLogged = isExerciseFullyLogged(
                  exercise.exerciseId
                );
                const hasAnyLoggedSets = hasLoggedSets(exercise.exerciseId);
                const previousExerciseNotes = getPreviousExerciseNotes(
                  exercise.exerciseId
                );

                return (
                  <div
                    key={exercise.exerciseId}
                    className={`rounded-lg space-y-4 ${
                      isMobile ? "p-0 border-none" : "p-4 border"
                    }`}
                  >
                    <div
                      className={`flex justify-between ${
                        isMobile ? "items-center" : ""
                      }`}
                    >
                      <div className="flex flex-col flex-1 ">
                        <div
                          className={`flex items-center gap-3 ${
                            isMobile ? "justify-between" : ""
                          }`}
                        >
                          <h4 className="font-medium">
                            {exercise.exerciseName}
                          </h4>

                          {isFullyLogged && (
                            <div>
                              <Check className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 my-1">
                          <CustomBadge title={exercise.laterality} />
                          <BodyPartBadge bodyPart={exercise.bodyPart} />
                        </div>
                        <div
                          className={`text-sm ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Target: {exercise.sets} sets × {exercise.minReps}-
                          {exercise.maxReps} reps
                        </div>
                      </div>
                      {isEditing && hasLoggedSets(exercise.exerciseId) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-fit text-destructive hover:text-destructive/80"
                          onClick={() => {
                            setContext("Exercise");
                            setShowDeleteDialog(true);
                            setDeletingExerciseId(
                              getWorkoutExerciseId(exercise.exerciseId)
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <ExerciseTable
                      onSaveExerciseSets={onSaveExerciseSets}
                      exercise={exercise}
                      exerciseSets={sets}
                      updateSetData={updateSetData}
                      toggleSetLogged={toggleSetLogged}
                      isFieldInvalid={isFieldInvalid}
                      isEditing={isEditing}
                      hasLoggedSets={hasAnyLoggedSets}
                      isMobile={isMobile}
                      showPrevious={showPrevious}
                      isStartingWorkout={isStartingWorkout}
                    />
                    <ExerciseNotes
                      exerciseNotes={exerciseNotes}
                      setExerciseNotes={setExerciseNotes}
                      getExerciseNotes={getExerciseNotes}
                      getWorkoutExerciseId={getWorkoutExerciseId}
                      hasAnyLoggedSets={hasAnyLoggedSets}
                      exercise={exercise}
                      readOnly={false}
                      previousExerciseNotes={previousExerciseNotes}
                    />
                  </div>
                );
              })}
          </div>
        )}

        <DeleteDialog
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          handleDelete={handleDelete}
          isDeleting={isDeletingWorkoutLog}
          title={`Delete Workout ${context}`}
        >
          {`Are you sure you want to delete this workout ${context.toLowerCase()}? This action cannot be undone.`}
        </DeleteDialog>
        <ResponsiveMenu
          sections={editMenuSections}
          isOpen={isDrawerOpen}
          setIsOpen={setIsDrawerOpen}
          dropdownAlign="end"
          dropdownWidth="w-40"
        />

        {/* Workout Timers */}
        <WorkoutTimers
          expectedNumberOfSets={selectedDay.exercises.reduce(
            (acc: number, exercise: any) => acc + exercise.sets,
            0
          )}
          selectedDate={selectedDate}
          programId={program.programId}
          isWorkoutCompleted={workoutLog?.data[0]?.status === "completed"}
          isEditing={isEditing}
          setIsStartingWorkout={setIsStartingWorkout}
          programType={program.programType}
          title={selectedDay?.dayName || ""}
          dayId={selectedDay?.dayId || ""}
          workoutLog={workoutLog?.data[0]}
        />

        {/* Workout Summary Modal */}
        <WorkoutSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          workoutLog={workoutLog?.data[0] || null}
        />
      </div>
    </>
  );
}
