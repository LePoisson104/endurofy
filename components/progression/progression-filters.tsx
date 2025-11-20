"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Badge from "@/components/badges/custom-badge";
import type { Exercise } from "@/interfaces/workout-program-interfaces";
import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";

interface ProgressionFiltersProps {
  programs: WorkoutProgram[] | null;
  selectedProgram: string;
  selectedExercise: Exercise | null;
  selectedPeriod: string;
  exercisesByBodyPart: Record<string, Exercise[]>;
  onProgramChange: (value: string) => void;
  onExerciseChange: (exercise: Exercise | null) => void;
  onPeriodChange: (value: string) => void;
}

const PERIODS = [
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "3months", label: "Last 3 Months" },
  { value: "day range", label: "Day Range" },
];

export function ProgressionFilters({
  programs,
  selectedProgram,
  selectedExercise,
  selectedPeriod,
  exercisesByBodyPart,
  onProgramChange,
  onExerciseChange,
  onPeriodChange,
}: ProgressionFiltersProps) {
  const exercises = Object.values(exercisesByBodyPart).flat();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Select Program & Exercise
        </CardTitle>
        <CardDescription>
          Choose a program and exercise to view detailed progression analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Program</Label>
            <Select value={selectedProgram} onValueChange={onProgramChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedProgram} />
              </SelectTrigger>
              <SelectContent>
                {programs?.map((program) => (
                  <SelectItem
                    key={program.programId}
                    value={program.programName}
                  >
                    {program.programName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Exercise</Label>
            <Select
              value={selectedExercise?.exerciseName || ""}
              onValueChange={(value) =>
                onExerciseChange(
                  exercises.find(
                    (exercise: Exercise) => exercise.exerciseName === value
                  ) || null
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={selectedExercise?.exerciseName || ""}
                />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(exercisesByBodyPart).map((bodyPart) => (
                  <SelectGroup key={bodyPart}>
                    <SelectLabel>{bodyPart}</SelectLabel>
                    {exercisesByBodyPart[bodyPart].map((exercise: Exercise) => (
                      <SelectItem
                        key={exercise.exerciseId}
                        value={exercise.exerciseName}
                      >
                        {exercise.exerciseName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Period</Label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="border-t" />
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{selectedProgram}</span> •{" "}
            {selectedExercise?.exerciseName || ""}
          </p>
          <Badge title={selectedExercise?.laterality || ""} />
        </div>
      </CardContent>
    </Card>
  );
}

