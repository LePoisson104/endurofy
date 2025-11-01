"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Pause, Play, RotateCcw } from "lucide-react";
import { formatTime, formatTimeInput } from "./timer-helper";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { toast } from "sonner";

interface RestTimerProps {
  showRestTimerModal: boolean;
  setShowRestTimerModal: (showRestTimerModal: boolean) => void;
  restDuration: number;
  setRestDuration: (duration: number) => void;
  restTimeRemaining: number;
  setRestTimeRemaining: (time: number) => void;
  restTimerRunning: boolean;
  setRestTimerRunning: (running: boolean) => void;
  restStartTime: number | null;
  setRestStartTime: (time: number | null) => void;
}

export function RestTimer({
  showRestTimerModal,
  setShowRestTimerModal,
  restDuration,
  setRestDuration,
  restTimeRemaining,
  setRestTimeRemaining,
  restTimerRunning,
  setRestTimerRunning,
  restStartTime,
  setRestStartTime,
}: RestTimerProps) {
  const isDark = useGetCurrentTheme();
  const [isEditingRestTime, setIsEditingRestTime] = useState(false);
  const [restTimeInput, setRestTimeInput] = useState("");
  const restTimeInputRef = useRef<HTMLInputElement>(null);

  // Keep cursor at the end of input
  useEffect(() => {
    if (isEditingRestTime && restTimeInputRef.current) {
      const input = restTimeInputRef.current;
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [restTimeInput, isEditingRestTime]);

  // Handle visibility change - recalculate remaining time when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && restTimerRunning && restStartTime !== null) {
        // Recalculate remaining time based on start timestamp
        const now = Date.now();
        const elapsed = Math.floor((now - restStartTime) / 1000);
        const remaining = restDuration - elapsed;

        if (remaining <= 0) {
          setRestTimerRunning(false);
          setRestTimeRemaining(restDuration);
          setRestStartTime(null);
          toast.success("Rest time is up! Ready for your next set?", {
            duration: 4000,
          });
        } else {
          setRestTimeRemaining(remaining);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    restTimerRunning,
    restStartTime,
    restDuration,
    setRestTimerRunning,
    setRestTimeRemaining,
    setRestStartTime,
  ]);

  // Rest timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (restTimerRunning && restStartTime !== null) {
      interval = setInterval(() => {
        // Calculate from start timestamp for accuracy across navigation/refresh
        const now = Date.now();
        const elapsed = Math.floor((now - restStartTime) / 1000);
        const remaining = restDuration - elapsed;

        if (remaining <= 0) {
          setRestTimerRunning(false);
          setRestTimeRemaining(restDuration); // Reset to original duration
          setRestStartTime(null);
          toast.success("Rest time is up! Ready for your next set?", {
            duration: 4000,
          });
        } else {
          setRestTimeRemaining(remaining);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    restTimerRunning,
    restStartTime,
    restDuration,
    setRestTimerRunning,
    setRestTimeRemaining,
    setRestStartTime,
  ]);

  const handleStartRestTimer = () => {
    setRestTimeRemaining(restDuration);
    setRestTimerRunning(true);
    setRestStartTime(Date.now());
  };

  const handlePauseRestTimer = () => {
    setRestTimerRunning(false);
    // Keep the current time remaining for resume
  };

  const handleResumeRestTimer = () => {
    // Calculate new start time based on remaining time
    const newStartTime = Date.now() - (restDuration - restTimeRemaining) * 1000;
    setRestStartTime(newStartTime);
    setRestTimerRunning(true);
  };

  const handleResetRestTimer = () => {
    setRestTimerRunning(false);
    setRestTimeRemaining(restDuration);
    setRestStartTime(null);
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

  return (
    <Dialog
      open={showRestTimerModal}
      onOpenChange={(open) => {
        setShowRestTimerModal(open);
        if (!open) {
          setIsEditingRestTime(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
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
                    variant={restDuration === duration ? "default" : "outline"}
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
  );
}
