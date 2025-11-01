"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Timer, Loader2, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { format } from "date-fns";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useCreateManualWorkoutLogMutation } from "@/api/workout-log/workout-log-api-slice";
import { usePauseTimerMutation } from "@/api/workout-log/workout-log-api-slice";
import { WorkoutLog } from "@/interfaces/workout-log-interfaces";
import { formatTime } from "./timer-helper";
import { RestTimer } from "./rest-timer";
import { flattenBy } from "@tanstack/react-table";

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

  const TIMER_STORAGE_KEY = `workout-timer-${format(
    selectedDate,
    "yyyy-MM-dd"
  )}-${programId}`;

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

  const REST_TIMER_STORAGE_KEY = `rest-timer-${format(
    selectedDate,
    "yyyy-MM-dd"
  )}-${programId}`;

  // Rest Timer State - Initialize from localStorage to prevent flash
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [restDuration, setRestDuration] = useState(() => {
    if (typeof window === "undefined") return 60;

    try {
      const savedRestTimerState = localStorage.getItem(REST_TIMER_STORAGE_KEY);
      if (savedRestTimerState) {
        const parsedState = JSON.parse(savedRestTimerState);
        return parsedState.restDuration || 60;
      }
    } catch (error) {
      console.error("Failed to parse saved rest timer state:", error);
    }
    return 60;
  });

  const [restTimeRemaining, setRestTimeRemaining] = useState(() => {
    if (typeof window === "undefined") return 60;

    try {
      const savedRestTimerState = localStorage.getItem(REST_TIMER_STORAGE_KEY);
      if (savedRestTimerState) {
        const parsedState = JSON.parse(savedRestTimerState);

        // If rest timer was running, calculate current remaining time
        if (parsedState.restStartTime && parsedState.restTimerRunning) {
          const now = Date.now();
          const elapsed = Math.floor((now - parsedState.restStartTime) / 1000);
          const remaining = parsedState.restDuration - elapsed;

          if (remaining > 0) {
            return remaining;
          } else {
            return parsedState.restDuration;
          }
        }
        return parsedState.restTimeRemaining || parsedState.restDuration || 60;
      }
    } catch (error) {
      console.error("Failed to parse saved rest timer state:", error);
    }
    return 60;
  });

  const [restTimerRunning, setRestTimerRunning] = useState(() => {
    if (typeof window === "undefined") return false;

    try {
      const savedRestTimerState = localStorage.getItem(REST_TIMER_STORAGE_KEY);
      if (savedRestTimerState) {
        const parsedState = JSON.parse(savedRestTimerState);

        // If rest timer was running, check if time is still remaining
        if (parsedState.restStartTime && parsedState.restTimerRunning) {
          const now = Date.now();
          const elapsed = Math.floor((now - parsedState.restStartTime) / 1000);
          const remaining = parsedState.restDuration - elapsed;
          return remaining > 0;
        }
      }
    } catch (error) {
      console.error("Failed to parse saved rest timer state:", error);
    }
    return false;
  });

  const [restStartTime, setRestStartTime] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;

    try {
      const savedRestTimerState = localStorage.getItem(REST_TIMER_STORAGE_KEY);
      if (savedRestTimerState) {
        const parsedState = JSON.parse(savedRestTimerState);

        // If rest timer was running and time is still remaining
        if (parsedState.restStartTime && parsedState.restTimerRunning) {
          const now = Date.now();
          const elapsed = Math.floor((now - parsedState.restStartTime) / 1000);
          const remaining = parsedState.restDuration - elapsed;

          if (remaining > 0) {
            return parsedState.restStartTime;
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse saved rest timer state:", error);
    }
    return null;
  });

  const hasShownRestCompletionToast = useRef(false);

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
        }
      } catch (error) {
        console.error("Failed to parse saved timer state:", error);
      }
    }

    // Mark that we've checked localStorage
    hasLoadedFromStorage.current = true;
  }, [TIMER_STORAGE_KEY, setIsStartingWorkout]);

  // Show completion toast if timer completed while away (only once on mount)
  useEffect(() => {
    if (!hasShownRestCompletionToast.current) {
      const savedRestTimerState = localStorage.getItem(REST_TIMER_STORAGE_KEY);
      if (savedRestTimerState) {
        try {
          const parsedState = JSON.parse(savedRestTimerState);

          // Check if timer was running and has now completed
          if (parsedState.restStartTime && parsedState.restTimerRunning) {
            const now = Date.now();
            const elapsed = Math.floor(
              (now - parsedState.restStartTime) / 1000
            );
            const remaining = parsedState.restDuration - elapsed;

            if (remaining <= 0) {
              // Timer completed while away - show toast
              toast.success("Rest time is up! Ready for your next set?", {
                duration: 4000,
              });
              hasShownRestCompletionToast.current = true;
              localStorage.removeItem(REST_TIMER_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error("Failed to check rest timer completion:", error);
        }
      }
    }
  }, [REST_TIMER_STORAGE_KEY]);

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

    // If loadedWorkoutDateRef is null, we're switching dates - reset timer to 0 immediately
    // This prevents showing stale timer from previous date while waiting for new data
    if (
      loadedWorkoutDateRef.current === null &&
      !sessionTimerRunning &&
      !hasWorkoutStarted
    ) {
      setSessionElapsedTime(0);
      setSessionStartTime(null);
    }

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
      };

      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    }
  }, [
    hasWorkoutStarted,
    sessionTimerRunning,
    sessionElapsedTime,
    sessionStartTime,
    TIMER_STORAGE_KEY,
  ]);

  // Save rest timer state to localStorage
  useEffect(() => {
    const restTimerState = {
      restDuration,
      restTimeRemaining,
      restTimerRunning,
      restStartTime,
    };

    localStorage.setItem(
      REST_TIMER_STORAGE_KEY,
      JSON.stringify(restTimerState)
    );
  }, [
    restDuration,
    restTimeRemaining,
    restTimerRunning,
    restStartTime,
    REST_TIMER_STORAGE_KEY,
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

      // STEP 5: Clear running workout ID and loaded date ref to allow new date to load
      // NOTE: We don't reset sessionElapsedTime to 0 here - let the workoutLog effect
      // set the correct timer value when new data arrives to prevent showing 0 briefly
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

      // STEP 7b: Clear rest timer localStorage for BOTH old and new dates
      const oldRestKey = `rest-timer-${prevDateRef.current}-${prevProgramRef.current}`;
      const newRestKey = `rest-timer-${currentDate}-${currentProgram}`;
      localStorage.removeItem(oldRestKey);
      localStorage.removeItem(newRestKey);

      // STEP 7c: Reset rest timer state
      setRestTimerRunning(false);
      setRestTimeRemaining(restDuration);
      setRestStartTime(null);
      hasShownRestCompletionToast.current = false; // Allow toast to show again for new date

      // STEP 8: Update refs for next date change
      prevDateRef.current = currentDate;
      prevProgramRef.current = currentProgram;

      // STEP 9: Reset force stop flag after a brief delay to allow workoutLog effect to load new data
      setTimeout(() => {
        forceStopTimerRef.current = false;
      }, 100);
    }
  }, [selectedDate, programId, setIsStartingWorkout, pauseTimer]);

  // Reset force stop flag when workoutLog loads (cleanup only)
  useEffect(() => {
    if (workoutLog?.workoutDate) {
      setTimeout(() => {
        forceStopTimerRef.current = false;
      }, 100);
    }
  }, [workoutLog]);

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

  // Don't show timers if editing or workout is completed
  if (isEditing || isWorkoutCompleted) {
    return null;
  }

  return (
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
                  (workoutLog &&
                    sessionElapsedTime === 0 &&
                    programType !== "manual")
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
          </div>
          {/* Rest Timer Button */}
          <Button
            onClick={() => setShowRestTimerModal(true)}
            variant={restTimerRunning ? "default" : "outline"}
            size="sm"
            className={
              restTimerRunning
                ? restTimeRemaining <= 10
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-green-500 hover:bg-green-600"
                : "border-muted"
            }
          >
            {restTimerRunning ? (
              <>
                <span className="tabular-nums font-semibold">
                  {formatTime(restTimeRemaining)}
                </span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Rest Timer</span>}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Rest Timer Modal */}
      <RestTimer
        showRestTimerModal={showRestTimerModal}
        setShowRestTimerModal={setShowRestTimerModal}
        restDuration={restDuration}
        setRestDuration={setRestDuration}
        restTimeRemaining={restTimeRemaining}
        setRestTimeRemaining={setRestTimeRemaining}
        restTimerRunning={restTimerRunning}
        setRestTimerRunning={setRestTimerRunning}
        restStartTime={restStartTime}
        setRestStartTime={setRestStartTime}
      />
    </div>
  );
}
