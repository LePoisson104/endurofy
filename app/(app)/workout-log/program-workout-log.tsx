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

  // Timer persistence key based on workout log date and program
  const timerStorageKey = `workout-timer-${format(
    selectedDate,
    "yyyy-MM-dd"
  )}-${program.programId}`;

  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const prevDateRef = useRef(format(selectedDate, "yyyy-MM-dd"));
  const prevProgramRef = useRef(program.programId);

  // Workout Session Timer State
  const [sessionTimerRunning, setSessionTimerRunning] = useState(false);
  const [sessionElapsedTime, setSessionElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Rest Timer State
  const [restTimerRunning, setRestTimerRunning] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(60);
  const [restDuration, setRestDuration] = useState(60);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [isEditingRestTime, setIsEditingRestTime] = useState(false);
  const [restTimeInput, setRestTimeInput] = useState("");
  const restTimeInputRef = useRef<HTMLInputElement>(null);

  const [updateWorkoutLogStatus] = useUpdateWorkoutLogStatusMutation();
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
  } = useExerciseSets(workoutLog, [program], selectedDay, previousWorkoutLog);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedTimerState = localStorage.getItem(timerStorageKey);
    if (savedTimerState) {
      try {
        const parsedState = JSON.parse(savedTimerState);

        // Restore session timer
        if (parsedState.sessionStartTime && parsedState.sessionTimerRunning) {
          const now = Date.now();
          const elapsed = Math.floor(
            (now - parsedState.sessionStartTime) / 1000
          );
          setSessionElapsedTime(elapsed);
          setSessionStartTime(parsedState.sessionStartTime);
          setSessionTimerRunning(true);
        } else if (parsedState.sessionElapsedTime) {
          setSessionElapsedTime(parsedState.sessionElapsedTime);
          setSessionStartTime(parsedState.sessionStartTime);
          setSessionTimerRunning(false);
        }

        // Restore rest timer
        if (parsedState.restTimerRunning && parsedState.restTimerEndTime) {
          const now = Date.now();
          const remaining = Math.max(
            0,
            Math.floor((parsedState.restTimerEndTime - now) / 1000)
          );

          if (remaining > 0) {
            setRestTimeRemaining(remaining);
            setRestTimerRunning(true);
            setRestDuration(parsedState.restDuration || 60);
          } else {
            // Timer has expired while away
            setRestTimeRemaining(parsedState.restDuration || 60);
            setRestTimerRunning(false);
            setRestDuration(parsedState.restDuration || 60);
          }
        } else {
          setRestDuration(parsedState.restDuration || 60);
          setRestTimeRemaining(parsedState.restDuration || 60);
        }
      } catch (error) {
        console.error("Failed to parse saved timer state:", error);
      }
    }
  }, [timerStorageKey]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    const timerState = {
      sessionTimerRunning,
      sessionElapsedTime,
      sessionStartTime,
      restTimerRunning,
      restTimeRemaining,
      restDuration,
      restTimerEndTime: restTimerRunning
        ? Date.now() + restTimeRemaining * 1000
        : null,
    };

    localStorage.setItem(timerStorageKey, JSON.stringify(timerState));
  }, [
    sessionTimerRunning,
    sessionElapsedTime,
    sessionStartTime,
    restTimerRunning,
    restTimeRemaining,
    restDuration,
    timerStorageKey,
  ]);

  useEffect(() => {
    if (!selectedDay || !workoutLog?.data[0]) return;
    if (selectedDay.dayId !== workoutLog.data[0].dayId) return;

    const currentWorkout = workoutLog.data[0];

    const logged = currentWorkout.workoutExercises.reduce(
      (acc: number, exercise: any) => acc + exercise.workoutSets.length,
      0
    );

    const totalSets = selectedDay.exercises.reduce(
      (acc: number, exercise: any) => acc + exercise.sets,
      0
    );

    if (totalSets === 0) return;

    // Use local variables for comparison to avoid double request
    if (logged === totalSets && currentWorkout.status === "incomplete") {
      updateWorkoutLogStatus({
        workoutLogId: currentWorkout.workoutLogId,
        status: "completed",
      }).unwrap();
      // Stop session timer when all sets are logged
      if (sessionTimerRunning) {
        setSessionTimerRunning(false);
        toast.success(
          `Workout completed! Duration: ${formatTime(sessionElapsedTime)}`
        );
        // Clear timer from localStorage when workout is completed
        localStorage.removeItem(timerStorageKey);
      }
    } else if (logged !== totalSets && currentWorkout.status === "completed") {
      updateWorkoutLogStatus({
        workoutLogId: currentWorkout.workoutLogId,
        status: "incomplete",
      }).unwrap();
    }
  }, [
    selectedDay,
    workoutLog,
    selectedDate,
    sessionTimerRunning,
    sessionElapsedTime,
    timerStorageKey,
    updateWorkoutLogStatus,
  ]);

  // Session Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (sessionTimerRunning) {
      interval = setInterval(() => {
        setSessionElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionTimerRunning]);

  // Rest Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (restTimerRunning && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            setRestTimerRunning(false);
            // Play a notification sound or show toast
            toast.success("Rest time is up! Ready for next set?");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restTimerRunning, restTimeRemaining]);

  // Reset timers when date or workout changes (but not on initial mount)
  useEffect(() => {
    const currentDate = format(selectedDate, "yyyy-MM-dd");
    const currentProgram = program.programId;

    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevDateRef.current = currentDate;
      prevProgramRef.current = currentProgram;
      return;
    }

    // Only reset if date or program actually changed
    if (
      prevDateRef.current !== currentDate ||
      prevProgramRef.current !== currentProgram
    ) {
      // Clear localStorage for old timer data
      const oldKey = `workout-timer-${prevDateRef.current}-${prevProgramRef.current}`;
      localStorage.removeItem(oldKey);

      // Reset session timer when switching to a different date/program
      setSessionTimerRunning(false);
      setSessionElapsedTime(0);
      setSessionStartTime(null);

      // Reset rest timer
      setRestTimerRunning(false);
      setRestTimeRemaining(restDuration);
      setShowRestTimerModal(false);

      // Update refs
      prevDateRef.current = currentDate;
      prevProgramRef.current = currentProgram;
    }
  }, [selectedDate, program.programId, restDuration]);

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
    }
  }, [selectedDay, workoutLog]); // Remove function dependencies

  // Timer Helper Functions
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartSessionTimer = () => {
    setSessionTimerRunning(true);
    setSessionStartTime(Date.now());
  };

  const handlePauseSessionTimer = () => {
    setSessionTimerRunning(false);
  };

  const handleResumeSessionTimer = () => {
    setSessionTimerRunning(true);
  };

  const handleStopSessionTimer = () => {
    setSessionTimerRunning(false);
    setSessionElapsedTime(0);
    setSessionStartTime(null);
    // Clear timer from localStorage when manually stopped
    localStorage.removeItem(timerStorageKey);
  };

  const handleStartRestTimer = () => {
    setRestTimeRemaining(restDuration);
    setRestTimerRunning(true);
  };

  const handlePauseRestTimer = () => {
    setRestTimerRunning(false);
  };

  const handleResumeRestTimer = () => {
    setRestTimerRunning(true);
  };

  const handleResetRestTimer = () => {
    setRestTimerRunning(false);
    setRestTimeRemaining(restDuration);
  };

  const handleEditRestTime = () => {
    if (!restTimerRunning) {
      setIsEditingRestTime(true);
      // Start with empty input for calculator-style entry
      setRestTimeInput("00:00");
    }
  };

  const handleRestTimeInputChange = (value: string) => {
    // Extract only numbers from the input
    const numbers = value.replace(/\D/g, "");

    // Get current numbers (without formatting)
    const currentNumbers = restTimeInput.replace(/\D/g, "");

    // Determine if user is adding or removing digits
    if (numbers.length > currentNumbers.length) {
      // User is adding a digit - shift left and add new digit at the end
      const newNumbers = (currentNumbers + numbers.slice(-1)).slice(-4);
      setRestTimeInput(formatTimeInput(newNumbers));
    } else if (numbers.length < currentNumbers.length) {
      // User is removing a digit (backspace) - shift right
      const newNumbers = currentNumbers.slice(0, -1).padStart(1, "0");
      setRestTimeInput(formatTimeInput(newNumbers));
    }
  };

  const formatTimeInput = (numbers: string): string => {
    // Pad with leading zeros to always have at least 4 digits for display
    const padded = numbers.padStart(4, "0");
    // Format as MM:SS
    return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
  };

  const handleRestTimeInputBlur = () => {
    if (restTimeInput) {
      // Parse MM:SS format
      const parts = restTimeInput.split(":");
      const mins = parseInt(parts[0] || "0", 10);
      const secs = parseInt(parts[1] || "0", 10);

      // Calculate total seconds
      let totalSeconds = mins * 60 + secs;

      // Validate: between 1 second and 99 minutes (5940 seconds)
      totalSeconds = Math.max(1, Math.min(totalSeconds, 5940));

      setRestDuration(totalSeconds);
      setRestTimeRemaining(totalSeconds);
    }
    setIsEditingRestTime(false);
  };

  const handleRestTimeInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Position cursor at the end for calculator-style entry
    const input = e.target;
    setTimeout(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  };

  const handleRestTimeInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleRestTimeInputBlur();
    } else if (e.key === "Escape") {
      setIsEditingRestTime(false);
    }
  };

  // Keep cursor at the end of input
  useEffect(() => {
    if (isEditingRestTime && restTimeInputRef.current) {
      const input = restTimeInputRef.current;
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [restTimeInput, isEditingRestTime]);

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

    console.log(workoutLogPayload);

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
    <div
      className={`space-y-6 ${
        !isEditing && workoutLog?.data[0]?.status !== "completed" ? "pb-15" : ""
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
            <div className="text-sm text-slate-500">
              {format(selectedDate, "MMMM d, yyyy")}
            </div>
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
          {[...selectedDay.exercises]
            .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
            .map((exercise: Exercise) => {
              const sets = exerciseSets[exercise.exerciseId] || [];
              const isFullyLogged = isExerciseFullyLogged(exercise.exerciseId);
              const hasAnyLoggedSets = hasLoggedSets(exercise.exerciseId);

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
                        <h4 className="font-medium">{exercise.exerciseName}</h4>
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
                  />
                  <ExerciseNotes
                    exerciseNotes={exerciseNotes}
                    setExerciseNotes={setExerciseNotes}
                    getExerciseNotes={getExerciseNotes}
                    getWorkoutExerciseId={getWorkoutExerciseId}
                    hasAnyLoggedSets={hasAnyLoggedSets}
                    exercise={exercise}
                    readOnly={false}
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
        selectedDate={selectedDate}
        programId={program.programId}
        isWorkoutCompleted={workoutLog?.data[0]?.status === "completed"}
        isEditing={isEditing}
      />
    </div>
  );
}
