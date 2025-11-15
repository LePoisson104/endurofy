"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Timer } from "lucide-react";
import { formatTime } from "./timer-helper";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { format } from "date-fns";
import { toast } from "sonner";

interface WorkoutTimerProps {
  currentDate: Date;
}

export function WorkoutTimer({ currentDate }: WorkoutTimerProps) {
  const isDark = useGetCurrentTheme();

  // Create date-specific storage key
  const dateStr = format(currentDate, "yyyy-MM-dd");
  const STORAGE_KEY = `endurofy-workout-timer-${dateStr}`;

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const hasLoadedFromStorage = useRef(false);
  const currentDateRef = useRef(dateStr);
  const isInitialMount = useRef(true);

  // Handle date changes - pause timer and save state
  useEffect(() => {
    const newDateStr = format(currentDate, "yyyy-MM-dd");

    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      currentDateRef.current = newDateStr;
      return;
    }

    // Only execute if date actually changed
    if (currentDateRef.current !== newDateStr) {
      // CRITICAL: Save timer state to OLD date's localStorage key BEFORE switching
      const oldStorageKey = `endurofy-workout-timer-${currentDateRef.current}`;
      const timerStateToSave = {
        isRunning: false, // Always save as paused when switching dates
        elapsedTime: elapsedTime,
        startTime: startTime,
      };
      localStorage.setItem(oldStorageKey, JSON.stringify(timerStateToSave));

      // Capture current timer state for notification
      const wasRunning = isRunning;
      const currentElapsed = elapsedTime;

      // Pause the timer immediately
      setIsRunning(false);

      // Show notification if timer was running
      if (wasRunning && currentElapsed > 0) {
        toast.info(
          `Timer paused: ${formatTime(currentElapsed)} on ${format(
            new Date(currentDateRef.current),
            "MMM d"
          )}`
        );
      }

      // Update the date ref
      currentDateRef.current = newDateStr;

      // Reset loading flag to load timer for new date
      hasLoadedFromStorage.current = false;
    }
  }, [currentDate, isRunning, elapsedTime, startTime]);

  // Load timer from localStorage when date changes or on mount
  useEffect(() => {
    if (hasLoadedFromStorage.current) return;

    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        if (parsedState.isRunning && parsedState.startTime) {
          const now = Date.now();
          const elapsed = Math.floor((now - parsedState.startTime) / 1000);

          setElapsedTime(elapsed);
          setStartTime(parsedState.startTime);
          setIsRunning(true);
        } else {
          // Timer was paused, restore paused state
          setElapsedTime(parsedState.elapsedTime || 0);
          setStartTime(parsedState.startTime);
          setIsRunning(false);
        }
      } else {
        // No saved state for this date, reset timer
        setElapsedTime(0);
        setStartTime(null);
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Failed to load timer state:", error);
    }

    hasLoadedFromStorage.current = true;
  }, [STORAGE_KEY]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;

    const timerState = {
      isRunning,
      elapsedTime,
      startTime,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState));
  }, [isRunning, elapsedTime, startTime, STORAGE_KEY]);

  // Timer interval - calculate elapsed time from start timestamp
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        // Calculate from start timestamp for accuracy across navigation/refresh
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  // Handle visibility change - recalculate elapsed time when user returns to tab
  // This ensures timer stays accurate even when tab is inactive or screen is off
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && startTime !== null) {
        // Recalculate elapsed time based on start timestamp
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, startTime]);

  const handleStart = () => {
    // If resuming (has elapsed time), adjust start time to account for elapsed time
    const newStartTime =
      elapsedTime > 0 ? Date.now() - elapsedTime * 1000 : Date.now();

    setStartTime(newStartTime);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 mb-4">
      <div className="bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-muted rounded-xl shadow-lg p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Timer Display */}
          <div className="flex items-center gap-3 flex-1">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <div className="text-xs text-muted-foreground">Duration</div>
              <div
                className={`text-lg font-bold tabular-nums ${
                  isRunning ? "text-primary" : ""
                }`}
              >
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                variant="default"
                size="sm"
                className={`${
                  isDark
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-blue-400 hover:bg-blue-500"
                } text-white`}
              >
                <Play className="h-4 w-4" />
                <span className="ml-2">
                  {elapsedTime > 0 ? "Resume" : "Start Workout"}
                </span>
              </Button>
            ) : (
              <Button onClick={handlePause} variant="destructive" size="sm">
                <Pause className="h-4 w-4" />
                <span className="ml-2">Pause</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
