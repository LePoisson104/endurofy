"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import Badge from "@/components/badges/custom-badge";
import { UnifiedFilterWrapper } from "@/components/filters/unified-filter-wrapper";
import { RotateCcw } from "lucide-react";
import type { Exercise } from "@/interfaces/workout-program-interfaces";
import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";
import { format } from "date-fns";

interface ProgressionFiltersWrapperProps {
  programs: WorkoutProgram[] | null;
  selectedProgram: WorkoutProgram | null;
  selectedExercise: Exercise | null;
  selectedPeriod: string;
  startDate?: Date;
  endDate?: Date;
  exercisesByBodyPart: Record<string, Exercise[]>;
  onProgramChange: (value: string) => void;
  onExerciseChange: (exercise: Exercise | null) => void;
  onPeriodChange: (value: string) => void;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  onReset: () => void;
}

// Exercise Select Component - Custom filter for progression
function ExerciseSelect({
  selectedExercise,
  exercisesByBodyPart,
  onExerciseChange,
}: {
  selectedExercise: Exercise | null;
  exercisesByBodyPart: Record<string, Exercise[]>;
  onExerciseChange: (exercise: Exercise | null) => void;
  startDate?: Date;
  endDate?: Date;
}) {
  const exercises = Object.values(exercisesByBodyPart).flat();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Exercise
      </label>
      <Select
        value={selectedExercise?.exerciseId || ""}
        onValueChange={(value) =>
          onExerciseChange(
            exercises.find(
              (exercise: Exercise) => exercise.exerciseId === value
            ) || null
          )
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={selectedExercise?.exerciseName || "Select exercise"}
          />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(exercisesByBodyPart).map((bodyPart) => (
            <SelectGroup key={bodyPart}>
              <SelectLabel>{bodyPart}</SelectLabel>
              {exercisesByBodyPart[bodyPart].map((exercise: Exercise) => (
                <SelectItem
                  key={exercise.exerciseId}
                  value={exercise.exerciseId}
                >
                  {exercise.exerciseName}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ProgressionFiltersWrapper(
  props: ProgressionFiltersWrapperProps
) {
  const {
    selectedProgram,
    selectedExercise,
    exercisesByBodyPart,
    onExerciseChange,
    startDate,
    endDate,
  } = props;

  return (
    <UnifiedFilterWrapper
      programs={props.programs}
      selectedProgram={selectedProgram}
      selectedPeriod={props.selectedPeriod}
      startDate={props.startDate}
      endDate={props.endDate}
      onProgramChange={props.onProgramChange}
      onPeriodChange={props.onPeriodChange}
      onStartDateChange={props.onStartDateChange}
      onEndDateChange={props.onEndDateChange}
      onReset={props.onReset}
      title="Select Program & Exercise"
      description="Choose program, exercise, and time period"
      useCard={true}
      useHorizontalLayout={true}
      customFilterSection={
        <ExerciseSelect
          selectedExercise={selectedExercise}
          exercisesByBodyPart={exercisesByBodyPart}
          onExerciseChange={onExerciseChange}
        />
      }
      customMobileSecondaryLabel={selectedExercise?.exerciseName}
      customMobileBadge={
        selectedExercise?.laterality ? (
          <Badge title={selectedExercise.laterality} />
        ) : undefined
      }
      customDesktopSummary={
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              <span>{selectedProgram?.programName || ""}</span>{" "}
              {selectedExercise?.exerciseName && (
                <>
                  {" "}
                  •{" "}
                  <span className="text-sm text-muted-foreground">
                    {selectedExercise?.exerciseName || ""}
                  </span>{" "}
                  <Badge title={selectedExercise?.laterality || ""} />
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
            onClick={props.onReset}
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
