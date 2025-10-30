"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, Timer, RotateCcw, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useCreateManualWorkoutLogMutation } from "@/api/workout-log/workout-log-api-slice";
import { usePauseTimerMutation } from "@/api/workout-log/workout-log-api-slice";
import { WorkoutLog } from "@/interfaces/workout-log-interfaces";

interface WorkoutTimersProps {
  selectedDate: Date;
  programId: string;
  isWorkoutCompleted: boolean;
  isEditing?: boolean;
  programType: string;
  title: string;
  dayId: string;
  workoutLog: WorkoutLog;
  setIsStartingWorkout: (isStartingWorkout: boolean) => void;
}

export function WorkoutTimers({
  selectedDate,
  programId,
  isWorkoutCompleted,
  isEditing = false,
  setIsStartingWorkout,
  programType,
  title,
  dayId,
  workoutLog,
}: WorkoutTimersProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const [createManualWorkoutLog, { isLoading: isCreatingWorkoutLog }] =
    useCreateManualWorkoutLogMutation();
  const [pauseTimer, { isLoading: isPausingTimer }] = usePauseTimerMutation();
  console.log("workoutLog", workoutLog);

  // Timer persistence key based on workout log date and program
  const TIMER_STORAGE_KEY = `workout-timer-${format(
    selectedDate,
    "yyyy-MM-dd"
  )}-${programId}`;

  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const prevDateRef = useRef(format(selectedDate, "yyyy-MM-dd"));
  const prevProgramRef = useRef(programId);
  // CRITICAL: This stores the workout ID that is CURRENTLY RUNNING
  // It's set when timer starts and cleared when timer stops
  // This prevents it from being overwritten when date changes
  const runningWorkoutLogIdRef = useRef<string | null>(null);
  // Force stop timer synchronously when switching dates
  const forceStopTimerRef = useRef(false);
  // Track which date the timer is currently on (source of truth)
  const currentDateRef = useRef(format(selectedDate, "yyyy-MM-dd"));
  // Track if we've loaded from localStorage yet to prevent premature workoutLog loading
  const hasLoadedFromStorage = useRef(false);
  // Track which date we've loaded workout data for to prevent double loading
  const loadedWorkoutDateRef = useRef<string | null>(null);

  // Workout Session Timer State
  const [sessionTimerRunning, setSessionTimerRunning] = useState(false);
  const [sessionElapsedTime, setSessionElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [hasWorkoutStarted, setHasWorkoutStarted] = useState(false);

  // Rest Timer State
  const [restTimerRunning, setRestTimerRunning] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(60);
  const [restDuration, setRestDuration] = useState(60);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [isEditingRestTime, setIsEditingRestTime] = useState(false);
  const [restTimeInput, setRestTimeInput] = useState("");
  const restTimeInputRef = useRef<HTMLInputElement>(null);
  const hasShownRestCompleteToast = useRef(false);
  // Rest timer end time for visibility change handler
  const restTimerEndTimeRef = useRef<number | null>(null);
  const prevRestTimerRunning = useRef(false);

  // Initialize isStartingWorkout on mount
  useEffect(() => {
    setIsStartingWorkout(true); // Disable inputs by default
  }, [setIsStartingWorkout]);

  // Track the running workout's ID - set when timer starts, cleared when it stops
  useEffect(() => {
    if (sessionTimerRunning && workoutLog?.workoutLogId) {
      // Lock in the workout ID when timer is running
      // This won't change even if workoutLog prop changes
      if (!runningWorkoutLogIdRef.current) {
        runningWorkoutLogIdRef.current = workoutLog.workoutLogId;
      }
    } else if (!sessionTimerRunning) {
      // Clear it when timer stops
      runningWorkoutLogIdRef.current = null;
    }
  }, [sessionTimerRunning, workoutLog?.workoutLogId]);

  // Load timer from localStorage on mount (for page refresh with running timer)
  useEffect(() => {
    const savedTimerState = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedTimerState) {
      try {
        const parsedState = JSON.parse(savedTimerState);

        // If timer was running, restore it
        if (parsedState.sessionStartTime && parsedState.sessionTimerRunning) {
          const now = Date.now();
          const elapsed = Math.floor(
            (now - parsedState.sessionStartTime) / 1000
          );
          setSessionElapsedTime(elapsed);
          setSessionStartTime(parsedState.sessionStartTime);
          setSessionTimerRunning(true);
          setHasWorkoutStarted(parsedState.hasWorkoutStarted || true);
          setIsStartingWorkout(false);

          // Restore rest timer
          if (parsedState.restTimerRunning && parsedState.restTimerEndTime) {
            const remaining = Math.max(
              0,
              Math.floor((parsedState.restTimerEndTime - now) / 1000)
            );

            if (remaining > 0) {
              setRestTimeRemaining(remaining);
              setRestTimerRunning(true);
              setRestDuration(parsedState.restDuration || 60);
              restTimerEndTimeRef.current = parsedState.restTimerEndTime;
              prevRestTimerRunning.current = true;
            } else {
              setRestTimeRemaining(parsedState.restDuration || 60);
              setRestTimerRunning(false);
              setRestDuration(parsedState.restDuration || 60);
              restTimerEndTimeRef.current = null;
              prevRestTimerRunning.current = false;
            }
          } else {
            setRestDuration(parsedState.restDuration || 60);
            setRestTimeRemaining(parsedState.restDuration || 60);
            restTimerEndTimeRef.current = null;
            prevRestTimerRunning.current = false;
          }
        }
      } catch (error) {
        console.error("Failed to parse saved timer state:", error);
      }
    }

    // Mark that we've checked localStorage
    hasLoadedFromStorage.current = true;
  }, [TIMER_STORAGE_KEY, setIsStartingWorkout]);

  // Load timer from workoutLog when it changes OR reset to 0 if no workout log
  useEffect(() => {
    // CRITICAL: Wait for localStorage to load first to avoid overwriting running timer
    if (!hasLoadedFromStorage.current) {
      return;
    }

    // Don't override running timer (use synchronous ref to avoid race condition)
    if (
      (sessionTimerRunning || hasWorkoutStarted) &&
      !forceStopTimerRef.current
    ) {
      return;
    }

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

    // If no workoutLog, don't do anything yet - wait for API to return data
    if (!workoutLog?.workoutDate) {
      return;
    }

    const workoutLogDateStr = workoutLog.workoutDate.split("T")[0];

    // CRITICAL: Only load if workoutLog date matches selected date
    if (workoutLogDateStr === selectedDateStr) {
      // Check if we've already loaded this exact workout log to prevent double loading
      if (loadedWorkoutDateRef.current === workoutLog.workoutLogId) {
        return; // Already loaded this specific workout log
      }

      if (workoutLog.timer !== undefined && workoutLog.timer > 0) {
        setSessionElapsedTime(workoutLog.timer);
        setSessionStartTime(Date.now() - workoutLog.timer * 1000);
      } else {
        setSessionElapsedTime(0);
        setSessionStartTime(null);
      }
      setIsStartingWorkout(true);
      // Mark this specific workoutLogId as loaded
      loadedWorkoutDateRef.current = workoutLog.workoutLogId;
    }
    // If dates don't match, don't do anything - wait for correct data
  }, [
    workoutLog,
    selectedDate,
    sessionTimerRunning,
    hasWorkoutStarted,
    setIsStartingWorkout,
  ]);

  // Save timer state to localStorage only when session timer is running
  useEffect(() => {
    if (sessionTimerRunning) {
      const timerState = {
        hasWorkoutStarted,
        sessionTimerRunning,
        sessionElapsedTime,
        sessionStartTime,
        restTimerRunning,
        restTimeRemaining,
        restDuration,
        restTimerEndTime: restTimerEndTimeRef.current,
      };

      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    }
  }, [
    hasWorkoutStarted,
    sessionTimerRunning,
    sessionElapsedTime,
    sessionStartTime,
    restTimerRunning,
    restTimeRemaining,
    restDuration,
    TIMER_STORAGE_KEY,
  ]);

  // Stop timer and save to database when workout is completed
  useEffect(() => {
    if (isWorkoutCompleted && sessionTimerRunning && workoutLog) {
      // Save timer to database before stopping
      pauseTimer({
        workoutLogId: workoutLog.workoutLogId,
        time: sessionElapsedTime,
      })
        .unwrap()
        .then(() => {
          setSessionTimerRunning(false);
          setHasWorkoutStarted(false);
          setIsStartingWorkout(true);
          runningWorkoutLogIdRef.current = null; // Clear running workout ID
          toast.success(
            `Workout completed! Duration: ${formatTime(sessionElapsedTime)}`
          );
          // Clear timer from localStorage when workout is completed
          localStorage.removeItem(TIMER_STORAGE_KEY);
        })
        .catch((error: any) => {
          console.error("Failed to save timer on completion:", error);
          // Still stop the timer even if save fails
          setSessionTimerRunning(false);
          setHasWorkoutStarted(false);
          setIsStartingWorkout(true);
          runningWorkoutLogIdRef.current = null; // Clear running workout ID
          toast.success(
            `Workout completed! Duration: ${formatTime(sessionElapsedTime)}`
          );
          localStorage.removeItem(TIMER_STORAGE_KEY);
        });
    }
  }, [
    isWorkoutCompleted,
    sessionTimerRunning,
    sessionElapsedTime,
    TIMER_STORAGE_KEY,
    workoutLog,
    pauseTimer,
  ]);

  // Session Timer Effect - Calculate from start time for accuracy across navigation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (
      sessionTimerRunning &&
      !forceStopTimerRef.current &&
      sessionStartTime !== null
    ) {
      interval = setInterval(() => {
        // Check force stop flag on every tick - prevents incrementing during date switch
        if (forceStopTimerRef.current) {
          return;
        }
        // CRITICAL: Calculate from start timestamp instead of incrementing
        // This ensures timer stays accurate even when component unmounts/remounts
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        setSessionElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionTimerRunning, sessionStartTime]);

  // Handle visibility change - recalculate elapsed time when user returns to app
  // This ensures timer stays accurate even when phone screen is off
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        !document.hidden &&
        sessionTimerRunning &&
        sessionStartTime !== null &&
        !forceStopTimerRef.current
      ) {
        // Recalculate elapsed time based on start timestamp
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        setSessionElapsedTime(elapsed);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionTimerRunning, sessionStartTime]);

  // Rest Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (restTimerRunning && restTimeRemaining > 0) {
      // Reset toast flag when timer starts
      hasShownRestCompleteToast.current = false;

      interval = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            setRestTimerRunning(false);
            // Only show toast if we haven't shown it yet
            if (!hasShownRestCompleteToast.current) {
              hasShownRestCompleteToast.current = true;
              toast.success("Rest time is up! Ready for next set?");
            }
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

  // Handle visibility change for rest timer - recalculate remaining time
  // Set rest timer end time when timer starts
  useEffect(() => {
    // Only set end time when timer STARTS (transitions from false to true)
    if (
      restTimerRunning &&
      !prevRestTimerRunning.current &&
      restTimeRemaining > 0
    ) {
      // Timer just started - set the end time
      restTimerEndTimeRef.current = Date.now() + restTimeRemaining * 1000;
    } else if (!restTimerRunning) {
      // Timer stopped - clear the end time
      restTimerEndTimeRef.current = null;
    }

    // Update the previous state
    prevRestTimerRunning.current = restTimerRunning;
  }, [restTimerRunning, restTimeRemaining]);

  useEffect(() => {
    const handleRestVisibilityChange = () => {
      if (
        !document.hidden &&
        restTimerRunning &&
        restTimerEndTimeRef.current !== null
      ) {
        // Recalculate remaining time based on end timestamp
        const now = Date.now();
        const remaining = Math.max(
          0,
          Math.floor((restTimerEndTimeRef.current - now) / 1000)
        );

        if (remaining === 0) {
          setRestTimerRunning(false);
          setRestTimeRemaining(0);
          // Show toast if rest time completed while phone was off
          if (!hasShownRestCompleteToast.current) {
            hasShownRestCompleteToast.current = true;
            toast.success("Rest time is up! Ready for next set?");
          }
        } else {
          setRestTimeRemaining(remaining);
        }
      }
    };

    document.addEventListener("visibilitychange", handleRestVisibilityChange);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleRestVisibilityChange
      );
    };
  }, [restTimerRunning]);

  // EFFECT 1: Stop timer when date changes (runs ONLY on date change)
  useEffect(() => {
    const currentDate = format(selectedDate, "yyyy-MM-dd");
    const currentProgram = programId;

    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevDateRef.current = currentDate;
      prevProgramRef.current = currentProgram;
      currentDateRef.current = currentDate;
      return;
    }

    // Only execute if date or program actually changed
    if (
      prevDateRef.current !== currentDate ||
      prevProgramRef.current !== currentProgram
    ) {
      // STEP 0: Set force stop flag IMMEDIATELY (synchronous)
      forceStopTimerRef.current = true;

      // STEP 1: Update current date ref (source of truth)
      currentDateRef.current = currentDate;

      // STEP 2: Capture current timer state BEFORE any state changes
      const wasTimerRunning = sessionTimerRunning;
      const currentElapsedTime = sessionElapsedTime;
      // CRITICAL: Use the locked running workout ID, not the current workoutLog prop
      const currentWorkoutLogId = runningWorkoutLogIdRef.current;

      // STEP 3: IMMEDIATELY stop the timer (synchronous state updates)
      setSessionTimerRunning(false);
      setHasWorkoutStarted(false);
      setIsStartingWorkout(true);

      // STEP 4: Reset rest timer immediately
      setRestTimerRunning(false);
      setRestTimeRemaining(restDuration);
      setShowRestTimerModal(false);

      // STEP 5: Reset timer display, clear running workout ID and loaded date ref
      setSessionElapsedTime(0);
      setSessionStartTime(null);
      runningWorkoutLogIdRef.current = null;
      loadedWorkoutDateRef.current = null; // Allow new date to load

      // STEP 6: Save timer to database in background if it was running AND has workoutLogId
      if (wasTimerRunning && currentElapsedTime > 0) {
        if (currentWorkoutLogId) {
          pauseTimer({
            workoutLogId: currentWorkoutLogId,
            time: currentElapsedTime,
          })
            .unwrap()
            .then(() => {
              toast.info(
                `Workout paused and saved: ${formatTime(currentElapsedTime)}`
              );
            })
            .catch((error: any) => {
              console.error(
                "Failed to save timer when switching dates:",
                error
              );
              toast.error("Failed to save timer");
            });
        } else {
          // Timer was running but no workout log exists yet - just notify user
          toast.info(
            `Timer paused: ${formatTime(
              currentElapsedTime
            )} (start workout to save)`
          );
          console.warn(
            "Timer was running but no workout log ID available - timer not saved"
          );
        }
      }

      // STEP 7: Clear localStorage for BOTH old and new dates
      const oldKey = `workout-timer-${prevDateRef.current}-${prevProgramRef.current}`;
      const newKey = `workout-timer-${currentDate}-${currentProgram}`;
      localStorage.removeItem(oldKey);
      localStorage.removeItem(newKey); // Prevent loading stale data from previous session

      // STEP 8: Update refs for next date change
      prevDateRef.current = currentDate;
      prevProgramRef.current = currentProgram;

      // STEP 9: Reset force stop flag after a brief delay to allow workoutLog effect to load new data
      setTimeout(() => {
        forceStopTimerRef.current = false;
      }, 100);
    }
  }, [selectedDate, programId, restDuration, setIsStartingWorkout, pauseTimer]);

  // Reset force stop flag when workoutLog loads (cleanup only)
  useEffect(() => {
    if (workoutLog?.workoutDate) {
      setTimeout(() => {
        forceStopTimerRef.current = false;
      }, 100);
    }
  }, [workoutLog]);

  // Keep cursor at the end of input
  useEffect(() => {
    if (isEditingRestTime && restTimeInputRef.current) {
      const input = restTimeInputRef.current;
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [restTimeInput, isEditingRestTime]);

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

  const handleStartSessionTimer = async () => {
    // Only create workout log if it doesn't exist yet
    if (programType !== "manual" && sessionElapsedTime === 0 && !workoutLog) {
      try {
        const payload = {
          title: title.trim(),
          workoutDate: format(selectedDate, "yyyy-MM-dd"),
        };

        const result = await createManualWorkoutLog({
          userId: user?.user_id,
          programId: programId,
          dayId: dayId,
          payload,
        }).unwrap();

        // CRITICAL: Capture the workoutLogId immediately after creation
        // This ensures we can save the timer even before RTK Query refetches
        if (result?.workoutLogId) {
          runningWorkoutLogIdRef.current = result.workoutLogId;
        }
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else {
          toast.error("Failed to create workout log. Please try again.");
        }
        return; // Don't start timer if creation failed
      }
    }

    // Reset force stop flag when user manually starts timer
    forceStopTimerRef.current = false;

    setSessionTimerRunning(true);
    setHasWorkoutStarted(true);
    setIsStartingWorkout(false); // Enable inputs when workout starts
    // If resuming (has elapsed time), adjust start time to account for elapsed time
    if (sessionElapsedTime > 0) {
      setSessionStartTime(Date.now() - sessionElapsedTime * 1000);
    } else {
      setSessionStartTime(Date.now());
    }
  };

  const handlePauseSession = async () => {
    if (!workoutLog) return;
    if (workoutLog.status === "completed") return;
    if (workoutLog.timer === sessionElapsedTime) return;

    try {
      await pauseTimer({
        workoutLogId: workoutLog.workoutLogId,
        time: sessionElapsedTime,
      }).unwrap();

      // Remove from localStorage after successfully updating timer
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to pause workout log. Please try again.");
      }
    }
    // Stop button now acts as pause - keeps the elapsed time
    setSessionTimerRunning(false);
    setHasWorkoutStarted(false); // Reset workout started state
    setIsStartingWorkout(true); // Disable inputs when paused
    // Clear the running workout ID
    runningWorkoutLogIdRef.current = null;
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

  // Don't show timers if editing or workout is completed
  if (isEditing || isWorkoutCompleted) {
    return null;
  }

  return (
    <>
      {/* Fixed Bottom Timer Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 mb-4">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-muted rounded-xl shadow-lg p-3">
          <div className="flex items-center justify-between gap-4">
            {/* Session Timer */}
            <div className="flex items-center gap-3 flex-1">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <div className="text-xs text-muted-foreground">Duration</div>
                <div
                  className={`text-lg font-bold tabular-nums ${
                    sessionTimerRunning ? "text-primary" : ""
                  }`}
                >
                  {formatTime(sessionElapsedTime)}
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2">
              {!sessionTimerRunning ? (
                <Button
                  onClick={handleStartSessionTimer}
                  variant="default"
                  size="sm"
                  className={`${
                    isDark
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-blue-400 hover:bg-blue-500"
                  }`}
                  disabled={
                    isCreatingWorkoutLog ||
                    (workoutLog && sessionElapsedTime === 0)
                  }
                >
                  {isCreatingWorkoutLog ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Play className="h-4 w-4 text-white" />
                  )}
                  {!isMobile && (
                    <span className="ml-2 text-white">
                      {sessionElapsedTime > 0 ? "Resume" : "Start Workout"}
                    </span>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePauseSession}
                  variant="destructive"
                  size="sm"
                >
                  {isPausingTimer ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                  {!isMobile && <span className="ml-2">Pause</span>}
                </Button>
              )}

              {/* Rest Timer Button */}
              <Button
                onClick={() => setShowRestTimerModal(true)}
                variant={restTimerRunning ? "default" : "outline"}
                size="sm"
                className={
                  restTimerRunning && restTimeRemaining <= 10
                    ? "bg-destructive hover:bg-destructive/90"
                    : restTimerRunning
                    ? "bg-green-500 hover:bg-green-600"
                    : ""
                }
              >
                <Timer className="h-4 w-4" />
                {!isMobile && (
                  <span className="ml-2">
                    {restTimerRunning
                      ? formatTime(restTimeRemaining)
                      : "Rest Timer"}
                  </span>
                )}
                {isMobile && restTimerRunning && (
                  <span className="ml-1 text-xs">
                    {formatTime(restTimeRemaining)}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest Timer Modal */}
      <Dialog
        open={showRestTimerModal}
        onOpenChange={(open) => {
          setShowRestTimerModal(open);
          if (!open) {
            setIsEditingRestTime(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" closeXButton={true}>
          <DialogTitle className="sr-only">Rest Timer</DialogTitle>
          <div className={`rounded-lg p-4`}>
            <div className="space-y-4">
              {/* Timer Display */}
              <div className="text-center">
                {isEditingRestTime ? (
                  <Input
                    ref={restTimeInputRef}
                    value={restTimeInput}
                    onChange={(e) => handleRestTimeInputChange(e.target.value)}
                    onFocus={handleRestTimeInputFocus}
                    onBlur={handleRestTimeInputBlur}
                    onKeyDown={handleRestTimeInputKeyDown}
                    placeholder="00:00"
                    className="text-6xl font-bold tabular-nums text-center h-24 border-2"
                    autoFocus
                    inputMode="numeric"
                  />
                ) : (
                  <div
                    onClick={handleEditRestTime}
                    className={`text-6xl font-bold tabular-nums cursor-pointer hover:opacity-80 transition-opacity ${
                      restTimerRunning
                        ? restTimeRemaining <= 10
                          ? "text-destructive"
                          : "text-green-500"
                        : "hover:text-primary"
                    }`}
                  >
                    {formatTime(restTimeRemaining)}
                  </div>
                )}
              </div>

              {/* Duration Presets */}
              {!restTimerRunning && !isEditingRestTime && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {[30, 60, 120, 180].map((duration) => (
                    <Button
                      key={duration}
                      variant={
                        restDuration === duration ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setRestDuration(duration);
                        setRestTimeRemaining(duration);
                      }}
                    >
                      {duration < 60 ? `${duration}s` : `${duration / 60}m`}
                    </Button>
                  ))}
                </div>
              )}

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-2">
                {!restTimerRunning && restTimeRemaining === restDuration ? (
                  <Button
                    onClick={handleStartRestTimer}
                    variant="default"
                    className={`w-[230px] text-white ${
                      isDark
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-blue-400 hover:bg-blue-500"
                    }`}
                    disabled={isEditingRestTime}
                  >
                    <Play className="h-4 w-4 mr-2" />
                  </Button>
                ) : (
                  <>
                    {restTimerRunning ? (
                      <Button
                        onClick={handlePauseRestTimer}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        onClick={handleResumeRestTimer}
                        variant="default"
                        className={`flex-1 text-white ${
                          isDark
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-blue-400 hover:bg-blue-500"
                        }`}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button
                      onClick={handleResetRestTimer}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
