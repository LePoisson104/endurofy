"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, StopCircle, Timer, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

interface WorkoutTimersProps {
  selectedDate: Date;
  programId: string;
  isWorkoutCompleted: boolean;
  isEditing?: boolean;
}

export function WorkoutTimers({
  selectedDate,
  programId,
  isWorkoutCompleted,
  isEditing = false,
}: WorkoutTimersProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();

  // Timer persistence key based on workout log date and program
  const timerStorageKey = `workout-timer-${format(
    selectedDate,
    "yyyy-MM-dd"
  )}-${programId}`;

  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const prevDateRef = useRef(format(selectedDate, "yyyy-MM-dd"));
  const prevProgramRef = useRef(programId);

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

  // Stop timer when workout is completed
  useEffect(() => {
    if (isWorkoutCompleted && sessionTimerRunning) {
      setSessionTimerRunning(false);
      toast.success(
        `Workout completed! Duration: ${formatTime(sessionElapsedTime)}`
      );
      // Clear timer from localStorage when workout is completed
      localStorage.removeItem(timerStorageKey);
    }
  }, [
    isWorkoutCompleted,
    sessionTimerRunning,
    sessionElapsedTime,
    timerStorageKey,
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
    const currentProgram = programId;

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
  }, [selectedDate, programId, restDuration]);

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
    localStorage.removeItem(timerStorageKey);
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
              {!sessionTimerRunning && sessionElapsedTime === 0 ? (
                <Button
                  onClick={handleStartSessionTimer}
                  variant="default"
                  size="sm"
                >
                  <Play className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Start Workout</span>}
                </Button>
              ) : (
                <>
                  {sessionTimerRunning ? (
                    <Button
                      onClick={handlePauseSessionTimer}
                      variant="outline"
                      size="sm"
                    >
                      <Pause className="h-4 w-4" />
                      {!isMobile && <span className="ml-2">Pause</span>}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleResumeSessionTimer}
                      variant="default"
                      size="sm"
                    >
                      <Play className="h-4 w-4" />
                      {!isMobile && <span className="ml-2">Resume</span>}
                    </Button>
                  )}
                  <Button
                    onClick={handleStopSessionTimer}
                    variant="destructive"
                    size="sm"
                  >
                    <StopCircle className="h-4 w-4" />
                    {!isMobile && <span className="ml-2">Stop</span>}
                  </Button>
                </>
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
                        variant="default"
                        className="flex-1 text-destructive border-red-500 bg-card"
                      >
                        <Pause className="h-4 w-4 mr-2 text-destructive" />
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
