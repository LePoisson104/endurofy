"use client";

import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnifiedFilterWrapper } from "@/components/filters/unified-filter-wrapper";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { WorkoutProgram } from "@/interfaces/workout-program-interfaces";
import { RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { format } from "date-fns";

interface AnalyticsFiltersProps {
  selectedPeriod: string;
  startDate?: Date;
  endDate?: Date;
  selectedProgram?: string;
  selectedDay?: string;
  onPeriodChange: (period: string) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onProgramChange?: (programId: string | undefined) => void;
  onDayChange?: (dayId: string | undefined) => void;
  onReset: () => void;
}

// Day Select Component - Custom filter for analytics
function DaySelect({
  selectedProgram,
  selectedDay,
  onDayChange,
  workoutPrograms,
}: {
  selectedProgram?: string;
  selectedDay?: string;
  onDayChange?: (dayId: string | undefined) => void;
  workoutPrograms: WorkoutProgram[];
}) {
  // Get available days for selected program
  const availableDays = selectedProgram
    ? workoutPrograms
        .find((p) => p.programId === selectedProgram)
        ?.workoutDays.map((day) => ({
          value: day.dayId,
          label: day.dayName,
        })) || []
    : [];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Day
      </label>
      <Select
        value={selectedDay || ""}
        onValueChange={(value) => onDayChange?.(value || undefined)}
        disabled={!selectedProgram}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              selectedProgram ? "Select day" : "Select a program first"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {availableDays.map((day) => (
            <SelectItem key={day.value} value={day.value}>
              {day.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AnalyticsFilters({
  selectedPeriod,
  startDate,
  endDate,
  selectedProgram,
  selectedDay,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onProgramChange,
  onDayChange,
  onReset,
}: AnalyticsFiltersProps) {
  // Fetch workout programs from Redux
  const workoutPrograms = useSelector(selectWorkoutProgram) || [];

  // Get display names
  const selectedDayName = selectedProgram
    ? workoutPrograms
        .find((p) => p.programId === selectedProgram)
        ?.workoutDays.find((d) => d.dayId === selectedDay)?.dayName
    : undefined;

  return (
    <UnifiedFilterWrapper
      programs={workoutPrograms}
      selectedProgram={selectedProgram || ""}
      selectedPeriod={selectedPeriod}
      startDate={startDate}
      endDate={endDate}
      onProgramChange={(value) => onProgramChange?.(value || undefined)}
      onPeriodChange={onPeriodChange}
      onStartDateChange={onStartDateChange}
      onEndDateChange={onEndDateChange}
      onReset={onReset}
      title="Select Program & Day"
      description="Choose program, workout day, and time period"
      useCard={true}
      useHorizontalLayout={true}
      customFilterSection={
        <DaySelect
          selectedProgram={selectedProgram}
          selectedDay={selectedDay}
          onDayChange={onDayChange}
          workoutPrograms={workoutPrograms}
        />
      }
      customMobileSecondaryLabel={selectedDayName}
      customDesktopSummary={
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              {selectedProgram
                ? workoutPrograms.find((p) => p.programId === selectedProgram)
                    ?.programName || ""
                : ""}
              {selectedDayName && (
                <>
                  {" "}
                  •{" "}
                  <span className="text-sm text-muted-foreground">
                    {selectedDayName || ""}
                  </span>
                </>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(startDate || new Date(), "MMMM d, yyyy")} -{" "}
              {format(endDate || new Date(), "MMMM d, yyyy")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="shrink-0"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      }
    />
  );
}
