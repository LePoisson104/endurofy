"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import Badge from "@/components/badges/custom-badge";
import {
  ListFilterPlus,
  Calendar as CalendarIcon,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/interfaces/workout-program-interfaces";
import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";

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

const PERIODS = [
  { value: "7day", label: "Last 7 Days" },
  { value: "14day", label: "Last 14 Days" },
  { value: "30day", label: "Last 30 Days" },
  { value: "90day", label: "Last 3 months" },
  { value: "day range", label: "Day Range" },
];

function FilterContent({
  programs,
  selectedProgram,
  selectedExercise,
  selectedPeriod,
  startDate,
  endDate,
  exercisesByBodyPart,
  onProgramChange,
  onExerciseChange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
}: ProgressionFiltersWrapperProps) {
  const exercises = Object.values(exercisesByBodyPart).flat();
  const isDayRange = selectedPeriod === "day range";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label>Program</Label>
        <Select
          value={selectedProgram?.programName || ""}
          onValueChange={(value) =>
            onProgramChange(
              programs?.find((program) => program.programName === value)
                ?.programId || ""
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={selectedProgram?.programName || ""} />
          </SelectTrigger>
          <SelectContent>
            {programs?.map((program) => (
              <SelectItem key={program.programId} value={program.programName}>
                {program.programName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Exercise</Label>
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
            <SelectValue placeholder={selectedExercise?.exerciseName || ""} />
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

      {/* Date Range Pickers */}
      {isDayRange && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => onStartDateChange?.(date || undefined)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => onEndDateChange?.(date || undefined)}
                  disabled={(date) => (startDate ? date < startDate : false)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProgressionFiltersWrapper(
  props: ProgressionFiltersWrapperProps
) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const {
    selectedProgram,
    selectedExercise,
    selectedPeriod,
    startDate,
    endDate,
  } = props;

  const getPeriodDisplay = () => {
    if (selectedPeriod === "day range" && startDate && endDate) {
      return `${format(startDate, "MMM d")} - ${format(
        endDate,
        "MMM d, yyyy"
      )}`;
    }
    return PERIODS.find((p) => p.value === selectedPeriod)?.label;
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Summary Card */}
        <Card>
          <CardContent className="px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <ListFilterPlus className="h-4 w-4" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="standalone:pb-10">
                    <DrawerHeader className="text-left">
                      <DrawerTitle>Filter Settings</DrawerTitle>
                      <DrawerDescription>
                        Choose program, exercise, and time period
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                      <FilterContent {...props} />
                    </div>
                    <DrawerFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          props.onReset();
                          setOpen(false);
                        }}
                        className="w-full"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Filters
                      </Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-muted-foreground truncate">
                      <span className="font-medium text-foreground">
                        {selectedProgram?.programName || ""}
                      </span>{" "}
                      • {selectedExercise?.exerciseName || ""}
                    </p>
                    <Badge title={selectedExercise?.laterality || ""} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getPeriodDisplay()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Desktop view - original card
  const {
    programs,
    exercisesByBodyPart,
    onProgramChange,
    onExerciseChange,
    onPeriodChange,
    onStartDateChange,
    onEndDateChange,
  } = props;
  const exercises = Object.values(exercisesByBodyPart).flat();
  const isDayRange = selectedPeriod === "day range";

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
            <Select
              value={selectedProgram?.programName || ""}
              onValueChange={(value) =>
                onProgramChange(
                  programs?.find((program) => program.programName === value)
                    ?.programId || ""
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedProgram?.programName || ""} />
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

        {/* Date Range Pickers for Desktop */}
        {isDayRange && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={onStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={onEndDateChange}
                    disabled={(date) => (startDate ? date < startDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <div className="border-t" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">
                {selectedProgram?.programName || ""}
              </span>{" "}
              • {selectedExercise?.exerciseName || ""}
            </p>
            <Badge title={selectedExercise?.laterality || ""} />
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
      </CardContent>
    </Card>
  );
}
