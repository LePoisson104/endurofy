"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getDayRange } from "@/helper/get-day-range";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { UnifiedAnalyticsOverview } from "@/components/analytics/unified-analytics-overview";
import { AnalyticsSkeleton } from "@/components/skeletons/analytics-skeleton";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useGetWeightLogByDateQuery } from "@/api/weight-log/weight-log-api-slice";
import { format } from "date-fns";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useWorkoutLogsAnalyticsQuery } from "@/api/analytics/analytics-api-slice";
import { useMacrosNutrientsAnalyticsQuery } from "@/api/analytics/analytics-api-slice";
import { useGetConsistencyQuery } from "@/api/analytics/analytics-api-slice";

const STORAGE_KEYS = {
  SELECTED_PROGRAM: "analytics_selectedProgram",
  SELECTED_DAY: "analytics_selectedDay",
  SELECTED_PERIOD: "analytics_selectedPeriod",
  START_DATE: "analytics_startDate",
  END_DATE: "analytics_endDate",
};

export default function AnalyticsPage() {
  const user = useSelector(selectCurrentUser);
  const programs = useSelector(selectWorkoutProgram);
  const [selectedPeriod, setSelectedPeriod] = useState("30day");
  const [startDate, setStartDate] = useState<Date | undefined>(
    getDayRange({ options: "30d" }).startDate || undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    getDayRange({ options: "30d" }).endDate || undefined
  );
  const [selectedProgram, setSelectedProgram] = useState<string | undefined>(
    undefined
  );
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: weightLog, isLoading: isWeightLogLoading } =
    useGetWeightLogByDateQuery({
      userId: user?.user_id || "",
      startDate: format(startDate || "", "yyyy-MM-dd"),
      endDate: format(endDate || "", "yyyy-MM-dd"),
      options: "date",
      withRates: false,
    });
  const { data: workoutLogAnalytics, isLoading: isWorkoutAnalyticsLoading } =
    useWorkoutLogsAnalyticsQuery({
      userId: user?.user_id || "",
      programId: selectedProgram || "",
      programDayId: selectedDay || "",
      startDate: format(startDate || "", "yyyy-MM-dd"),
      endDate: format(endDate || "", "yyyy-MM-dd"),
    });
  const {
    data: macrosNutrientsAnalytics,
    isLoading: isNutritionAnalyticsLoading,
  } = useMacrosNutrientsAnalyticsQuery({
    startDate: format(startDate || "", "yyyy-MM-dd"),
    endDate: format(endDate || "", "yyyy-MM-dd"),
  });
  const { data: consistencyData, isLoading: isConsistencyLoading } =
    useGetConsistencyQuery({
      startDate: format(startDate || "", "yyyy-MM-dd"),
      endDate: format(endDate || "", "yyyy-MM-dd"),
    });

  const isLoading =
    isWeightLogLoading ||
    isWorkoutAnalyticsLoading ||
    isNutritionAnalyticsLoading ||
    isConsistencyLoading;

  // Initialize with active program on mount
  useEffect(() => {
    if (programs && programs.length > 0 && !isInitialized) {
      try {
        const savedProgramId = localStorage.getItem(
          STORAGE_KEYS.SELECTED_PROGRAM
        );
        const savedDayId = localStorage.getItem(STORAGE_KEYS.SELECTED_DAY);
        const savedPeriod = localStorage.getItem(STORAGE_KEYS.SELECTED_PERIOD);

        let programToUse: string | undefined = undefined;

        // Try to find saved program, fallback to active program
        if (savedProgramId) {
          const savedProgram = programs.find(
            (p) => p.programId === savedProgramId
          );
          if (savedProgram) {
            programToUse = savedProgramId;
          }
        }

        // If no saved program or saved program not found, use active program
        if (!programToUse) {
          const activeProgram = programs.find(
            (program) => program.isActive === 1
          );
          if (activeProgram) {
            programToUse = activeProgram.programId;
          }
        }

        if (programToUse) {
          setSelectedProgram(programToUse);

          const program = programs.find((p) => p.programId === programToUse);

          // Try to restore saved day if it exists in the program
          if (savedDayId && programToUse === savedProgramId) {
            const dayExists = program?.workoutDays.some(
              (day) => day.dayId === savedDayId
            );
            if (dayExists) {
              setSelectedDay(savedDayId);
            } else if (program?.workoutDays.length) {
              // If saved day doesn't exist, set to first day
              setSelectedDay(program.workoutDays[0].dayId);
            }
          } else if (program?.workoutDays.length) {
            // No saved day, set to first day of program
            setSelectedDay(program.workoutDays[0].dayId);
          }
        }

        // Restore period
        if (savedPeriod) {
          setSelectedPeriod(savedPeriod);

          // Restore dates if period is "day range"
          if (savedPeriod === "day range") {
            const savedStartDate = localStorage.getItem(
              STORAGE_KEYS.START_DATE
            );
            const savedEndDate = localStorage.getItem(STORAGE_KEYS.END_DATE);

            if (savedStartDate) {
              setStartDate(new Date(savedStartDate));
            }
            if (savedEndDate) {
              setEndDate(new Date(savedEndDate));
            }
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading persisted values:", error);
        // Fallback to default behavior
        const activeProgram = programs.find(
          (program) => program.isActive === 1
        );
        if (activeProgram) {
          setSelectedProgram(activeProgram.programId);
        }
        setIsInitialized(true);
      }
    }
  }, [programs, isInitialized]);

  // Persist selectedProgram
  useEffect(() => {
    if (isInitialized && selectedProgram) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PROGRAM, selectedProgram);
    }
  }, [selectedProgram, isInitialized]);

  // Persist selectedDay
  useEffect(() => {
    if (isInitialized && selectedDay) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_DAY, selectedDay);
    } else if (isInitialized && !selectedDay) {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_DAY);
    }
  }, [selectedDay, isInitialized]);

  // Persist selectedPeriod
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PERIOD, selectedPeriod);
    }
  }, [selectedPeriod, isInitialized]);

  // Persist startDate (only when period is "day range")
  useEffect(() => {
    if (isInitialized && selectedPeriod === "day range") {
      if (startDate) {
        localStorage.setItem(STORAGE_KEYS.START_DATE, startDate.toISOString());
      } else {
        localStorage.removeItem(STORAGE_KEYS.START_DATE);
      }
    }
  }, [startDate, selectedPeriod, isInitialized]);

  // Persist endDate (only when period is "day range")
  useEffect(() => {
    if (isInitialized && selectedPeriod === "day range") {
      if (endDate) {
        localStorage.setItem(STORAGE_KEYS.END_DATE, endDate.toISOString());
      } else {
        localStorage.removeItem(STORAGE_KEYS.END_DATE);
      }
    }
  }, [endDate, selectedPeriod, isInitialized]);

  useEffect(() => {
    if (selectedPeriod === "7day") {
      setStartDate(getDayRange({ options: "7d" }).startDate || undefined);
      setEndDate(getDayRange({ options: "7d" }).endDate || undefined);
    } else if (selectedPeriod === "14day") {
      setStartDate(getDayRange({ options: "14d" }).startDate || undefined);
      setEndDate(getDayRange({ options: "14d" }).endDate || undefined);
    } else if (selectedPeriod === "30day") {
      setStartDate(getDayRange({ options: "30d" }).startDate || undefined);
      setEndDate(getDayRange({ options: "30d" }).endDate || undefined);
    } else if (selectedPeriod === "90day") {
      setStartDate(getDayRange({ options: "90d" }).startDate || undefined);
      setEndDate(getDayRange({ options: "90d" }).endDate || undefined);
    } else if (selectedPeriod === "day range") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [selectedPeriod]);

  const handleReset = () => {
    // Reset to active program and first day
    if (programs) {
      const activeProgram = programs.find((program) => program.isActive === 1);
      if (activeProgram) {
        setSelectedProgram(activeProgram.programId);
        // Set to first day of active program
        if (activeProgram.workoutDays.length) {
          setSelectedDay(activeProgram.workoutDays[0].dayId);
        }
      } else {
        setSelectedProgram(undefined);
        setSelectedDay(undefined);
      }
    }

    setSelectedPeriod("30day");
    setStartDate(getDayRange({ options: "30d" }).startDate || undefined);
    setEndDate(getDayRange({ options: "30d" }).endDate || undefined);

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PROGRAM);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_DAY);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PERIOD);
    localStorage.removeItem(STORAGE_KEYS.START_DATE);
    localStorage.removeItem(STORAGE_KEYS.END_DATE);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <AnalyticsFilters
        selectedPeriod={selectedPeriod}
        startDate={startDate}
        endDate={endDate}
        selectedProgram={selectedProgram}
        selectedDay={selectedDay}
        onPeriodChange={setSelectedPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onProgramChange={(programId) => {
          setSelectedProgram(programId);
          // Set to first day of new program
          if (programId && programs) {
            const program = programs.find((p) => p.programId === programId);
            if (program?.workoutDays.length) {
              setSelectedDay(program.workoutDays[0].dayId);
            }
          } else {
            setSelectedDay(undefined);
          }
        }}
        onDayChange={setSelectedDay}
        onReset={handleReset}
      />

      {/* Unified Overview */}
      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <UnifiedAnalyticsOverview
          startDate={startDate || new Date()}
          endDate={endDate || new Date()}
          weightAndCaloriesData={weightLog?.data}
          workoutAnalytics={workoutLogAnalytics?.data}
          nutritionAnalytics={macrosNutrientsAnalytics?.data}
          consistencyData={consistencyData?.data}
        />
      )}
    </div>
  );
}
