"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseForm } from "../../../components/form/exercise-form";
import { DaySchedule } from "./day-scheldule";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarIcon, Loader2, Plus, AlertCircle, Check } from "lucide-react";
import type {
  AllDays,
  Exercise,
  CreateWorkoutProgram,
  CreateWorkoutDay,
} from "../../../interfaces/workout-program-interfaces";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useSelector } from "react-redux";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

interface WorkoutProgramCreatorProps {
  onCreateProgram: (program: CreateWorkoutProgram) => void;
  isLoading: boolean;
  onSuccess?: () => void;
}

export function WorkoutProgramCreator({
  onCreateProgram,
  isLoading,
  onSuccess,
}: WorkoutProgramCreatorProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const workoutPrograms = useSelector(selectWorkoutProgram);
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [calendarInput, setCalendarInput] = useState<string>("");
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [exercises, setExercises] = useState<
    Record<string | AllDays, Exercise[]>
  >({});
  const [activeDay, setActiveDay] = useState<AllDays>("monday");
  const [programType, setProgramType] = useState<"dayOfWeek" | "custom">(
    "dayOfWeek"
  );
  const [dayNames, setDayNames] = useState<Record<string | AllDays, string>>(
    {}
  );
  const [customDays, setCustomDays] = useState<
    { id: string; name: string; dayName: string }[]
  >([{ id: "d1", name: "D1", dayName: "" }]);
  const [activeCustomDay, setActiveCustomDay] = useState<string>("d1");
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const STORAGE_KEY = "workout-program-creator-data";
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load persisted data from session storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProgramName(parsed.programName || "");
        setDescription(parsed.description || "");
        setExercises(parsed.exercises || {});
        setProgramType(parsed.programType || "dayOfWeek");
        setDayNames(parsed.dayNames || {});
        setCustomDays(
          parsed.customDays || [{ id: "d1", name: "D1", dayName: "" }]
        );
        setActiveDay(parsed.activeDay || "monday");
        setActiveCustomDay(parsed.activeCustomDay || "d1");
        if (parsed.calendarDate) {
          setCalendarDate(new Date(parsed.calendarDate));
        }
      } catch (error) {
        console.error("Failed to load saved program data:", error);
      }
    }
    // Mark data as loaded (whether we found saved data or not)
    setIsDataLoaded(true);
  }, []);

  // Save data to session storage whenever relevant state changes
  // Only start saving after initial data has been loaded
  useEffect(() => {
    if (!isDataLoaded) return; // Don't save until data is loaded

    const dataToSave = {
      programName,
      description,
      exercises,
      programType,
      dayNames,
      customDays,
      activeDay,
      activeCustomDay,
      calendarDate: calendarDate?.toISOString() || null,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    isDataLoaded,
    programName,
    description,
    exercises,
    programType,
    dayNames,
    customDays,
    activeDay,
    activeCustomDay,
    calendarDate,
  ]);

  // Format day name
  const formatDayName = (day: AllDays) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Add a new custom day
  const addCustomDay = () => {
    // Check if we've reached the maximum number of days (10)
    if (customDays.length >= 10) {
      return; // Don't add more days if we've reached the limit
    }

    const newDayNumber = customDays.length + 1;
    const newDayId = `d${newDayNumber}`;
    const newDayName = `D${newDayNumber}`;

    setCustomDays([
      ...customDays,
      { id: newDayId, name: newDayName, dayName: "" },
    ]);
    setActiveCustomDay(newDayId);
  };

  // Remove a custom day
  const removeCustomDay = (dayId: string) => {
    if (customDays.length <= 1) return; // Keep at least one day

    // Filter out the day to be removed
    const updatedDays = customDays.filter((day) => day.id !== dayId);

    // Create a mapping of old IDs to new IDs for renumbering
    const idMapping: Record<string, string> = {};
    updatedDays.forEach((day, index) => {
      const newDayNumber = index + 1;
      const newId = `d${newDayNumber}`;
      idMapping[day.id] = newId;
    });

    // Renumber the days
    const renumberedDays = updatedDays.map((day, index) => {
      const newDayNumber = index + 1;
      return {
        ...day,
        id: `d${newDayNumber}`,
        name: `D${newDayNumber}`,
      };
    });

    // Create new exercises object with renumbered IDs
    const updatedExercises: Record<string, Exercise[]> = {};
    Object.entries(exercises).forEach(([oldId, exercisesList]) => {
      if (oldId !== dayId) {
        // Skip the removed day
        const newId = idMapping[oldId];
        if (newId) {
          updatedExercises[newId] = exercisesList;
        }
      }
    });

    // Update both states
    setCustomDays(renumberedDays);
    setExercises(updatedExercises);

    // Update active day
    if (activeCustomDay === dayId) {
      setActiveCustomDay(renumberedDays[0].id);
    } else {
      // Update active day to its new ID
      const newActiveId = idMapping[activeCustomDay];
      if (newActiveId) {
        setActiveCustomDay(newActiveId);
      }
    }
  };

  // Update custom day name
  const updateCustomDayName = (dayId: string, newName: string) => {
    setCustomDays(
      customDays.map((day) =>
        day.id === dayId ? { ...day, dayName: newName } : day
      )
    );
  };

  // Update day name for a specific day
  const updateDayName = (dayId: string | AllDays, name: string) => {
    setDayNames((prev) => ({
      ...prev,
      [dayId]: name,
    }));
  };

  // Update exercises for a specific day
  const updateExercises = (
    dayId: string | AllDays,
    newExercises: Exercise[]
  ) => {
    setExercises((prev) => ({
      ...prev,
      [dayId]: newExercises,
    }));
  };

  // Add an exercise to the current day
  const addExercise = (exercise: Exercise) => {
    const currentDayId =
      programType === "dayOfWeek" ? activeDay : activeCustomDay;

    // Get the current number of exercises for the day
    const currentExercises = exercises[currentDayId] || [];
    const nextOrder = currentExercises.length + 1;

    // Create a new exercise with a unique ID and order
    const newExercise: Exercise = {
      ...exercise,
      exerciseId: `exercise-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      exerciseOrder: nextOrder,
    };

    // Update the exercises state
    setExercises((prevExercises) => {
      const currentDayExercises = prevExercises[currentDayId] || [];
      return {
        ...prevExercises,
        [currentDayId]: [...currentDayExercises, newExercise],
      };
    });
  };

  // Remove an exercise from the current day
  const removeExercise = (dayId: string | AllDays, exerciseId: string) => {
    setExercises((prevExercises) => {
      const currentDayExercises = prevExercises[dayId] || [];
      return {
        ...prevExercises,
        [dayId]: currentDayExercises.filter(
          (exercise) => exercise.exerciseId !== exerciseId
        ),
      };
    });
  };

  // Update an exercise in the current day
  const updateExercise = (
    dayId: string | AllDays,
    updatedExercise: Exercise
  ) => {
    setExercises((prevExercises) => {
      const currentDayExercises = prevExercises[dayId] || [];
      return {
        ...prevExercises,
        [dayId]: currentDayExercises.map((exercise) =>
          exercise.exerciseId === updatedExercise.exerciseId
            ? updatedExercise
            : exercise
        ),
      };
    });
  };

  // Reset all form data
  const resetForm = () => {
    setProgramName("");
    setDescription("");
    setExercises({});
    setActiveDay("monday");
    setProgramType("dayOfWeek");
    setDayNames({});
    setCustomDays([{ id: "d1", name: "D1", dayName: "" }]);
    setActiveCustomDay("d1");
    setCalendarDate(null);
    setCalendarInput("");
    // Clear session storage
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // Handle program submission
  const handleSubmitProgram = () => {
    if (!programName.trim()) {
      return; // Don't submit if program name is empty
    }

    // Prepare the workout days based on program type
    const workoutDays: CreateWorkoutDay[] = [];

    if (programType === "dayOfWeek") {
      // For dayOfWeek program type
      daysOfWeek.forEach((day, index) => {
        const dayExercises = exercises[day] || [];
        if (dayExercises.length > 0) {
          // Remove exerciseId from each exercise before adding to workoutDays
          const exercisesWithoutIds = dayExercises.map(
            ({ exerciseId: _, ...rest }) => rest
          );

          workoutDays.push({
            dayName: dayNames[day] || formatDayName(day as AllDays),
            dayNumber: index + 1,
            exercises: exercisesWithoutIds,
          });
        }
      });
    } else {
      // For custom program type
      customDays.forEach((day, index) => {
        const dayExercises = exercises[day.id] || [];
        if (dayExercises.length > 0) {
          // Remove exerciseId from each exercise before adding to workoutDays
          const exercisesWithoutIds = dayExercises.map(
            ({ exerciseId: _, ...rest }) => rest
          );

          workoutDays.push({
            dayName: day.dayName || day.name,
            dayNumber: index + 1,
            exercises: exercisesWithoutIds,
          });
        }
      });
    }

    // Create the program object
    const program: CreateWorkoutProgram = {
      programName,
      description,
      startingDate:
        calendarDate?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      programType,
      workoutDays,
    };

    // Call the onCreateProgram callback
    onCreateProgram(program);

    // Reset form and trigger success callback
    resetForm();
    onSuccess?.();
  };

  // Keep input in sync with calendarDate
  // (useEffect to update input if calendarDate changes externally)
  useEffect(() => {
    if (calendarDate) {
      setCalendarInput(format(calendarDate, "MM/dd/yyyy"));
    } else {
      setCalendarInput("");
    }
  }, [calendarDate]);

  if (workoutPrograms?.length === 4) {
    return (
      <Card className="shadow-none bg-background">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 shadow-lg">
            <AlertCircle className="h-10 w-10 text-zinc-600 dark:text-zinc-400" />
          </div>
          <CardTitle className="mb-3 text-2xl font-bold bg-gradient-to-t from-zinc-400 to-zinc-800 dark:from-zinc-100 dark:to-zinc-500 bg-clip-text text-transparent">
            Program Limit Reached
          </CardTitle>
          <CardDescription className="max-w-md text-base leading-relaxed mb-6">
            You&apos;ve reached the maximum limit of{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              3 active workout programs
            </span>
            .
          </CardDescription>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
            <AlertCircle className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Please delete an existing program to create a new one
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Program Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {numberLabel(1, programName, isDark)}
            <div className="flex-1">
              <CardTitle className="text-base">Program Details</CardTitle>
              <CardDescription>
                Give your program a name and description
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-name">
              Program Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="program-name"
              placeholder="e.g., Hypertrophy Program"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              maxLength={30}
              className="bg-background border-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-description">
              Description{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="program-description"
              placeholder="Describe your workout program... (100 characters max)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] bg-background"
              maxLength={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Schedule Type */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {numberLabel(2, "selected", isDark)}
            <div className="flex-1">
              <CardTitle className="text-base">Schedule Type</CardTitle>
              <CardDescription>
                Choose how you want to organize your workout days
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div
              onClick={() => setProgramType("dayOfWeek")}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-all hover:border-primary/50",
                programType === "dayOfWeek"
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card"
              )}
            >
              <div
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-1 transition-colors",
                  programType === "dayOfWeek"
                    ? "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {programType === "dayOfWeek" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">Day of Week</div>
                <div className="text-sm text-muted-foreground">
                  Organize by Monday through Sunday (best for weekly routines)
                </div>
              </div>
            </div>

            <div
              onClick={() => setProgramType("custom")}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-all hover:border-primary/50",
                programType === "custom"
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card"
              )}
            >
              <div
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-1 transition-colors",
                  programType === "custom"
                    ? "border-primary"
                    : "border-muted-foreground"
                )}
              >
                {programType === "custom" && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">Custom Schedule</div>
                <div className="text-sm text-muted-foreground">
                  Create Day 1, Day 2, etc. (best for rotation-based programs)
                </div>
              </div>
            </div>
          </div>

          {programType === "custom" && (
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Label htmlFor="program-start-date">Program Start Date</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-fit justify-start text-left font-normal",
                        !calendarDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={calendarDate || undefined}
                      onSelect={function (day) {
                        if (day) {
                          setCalendarDate(day);
                          setCalendarInput(format(day, "MM/dd/yyyy"));
                        } else {
                          setCalendarDate(null);
                          setCalendarInput("");
                        }
                      }}
                      month={visibleMonth}
                      onMonthChange={(month: Date) => setVisibleMonth(month)}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  id="date"
                  type="text"
                  pattern="\\d{2}/\\d{2}/\\d{4}"
                  placeholder="MM/DD/YYYY"
                  className="w-full"
                  value={calendarInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCalendarInput(value);
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Workout Schedule */}
      <Card className={`${isMobile ? "pb-0" : ""}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {numberLabel(
              3,
              Object.values(exercises).some(
                (dayExercises) => dayExercises.length > 0
              )
                ? "hasExercises"
                : "",
              isDark
            )}
            <div className="flex-1">
              <CardTitle className="text-base">Build Your Schedule</CardTitle>
              <CardDescription>
                Add exercises for each day of your workout program
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {programType === "dayOfWeek" ? (
            <Tabs
              value={activeDay}
              onValueChange={(value) => setActiveDay(value as AllDays)}
            >
              <div className="mb-2">
                <TabsList className="grid w-full grid-cols-7 h-auto p-1 border-b">
                  {daysOfWeek.map((day) => (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className="relative flex flex-col h-auto py-3 border-b"
                    >
                      <span className="text-xs font-medium">
                        {formatDayName(day as AllDays).slice(0, 3)}
                      </span>
                      {exercises[day] && exercises[day].length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white shadow-sm">
                          {exercises[day].length}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {daysOfWeek.map((day) => (
                <TabsContent key={day} value={day} className="space-y-4 mt-0">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="day-title"
                        className="text-sm font-medium"
                      >
                        Custom Name for {formatDayName(day as AllDays)}{" "}
                        <span className="text-xs text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="day-title"
                        type="text"
                        placeholder="e.g., Push A, Upper Body, Legs"
                        value={dayNames[day] || ""}
                        onChange={(e) => updateDayName(day, e.target.value)}
                        className="bg-background w-full"
                      />
                    </div>
                  </div>

                  {exercises[day] && exercises[day].length > 0 && (
                    <div>
                      <div className="mb-3 text-sm font-medium">
                        Exercises ({exercises[day].length}):
                      </div>
                      <DaySchedule
                        exercises={exercises[day] || []}
                        onRemoveExercise={(exerciseId) =>
                          removeExercise(day, exerciseId)
                        }
                        onUpdateExercise={(exercise) =>
                          updateExercise(day, exercise)
                        }
                        onReorderExercises={(newExercises) =>
                          updateExercises(day, newExercises)
                        }
                      />
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      <div className="font-medium">Add Exercise</div>
                    </div>
                    <ExerciseForm onAddExercise={addExercise} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-4">
              <Tabs value={activeCustomDay} onValueChange={setActiveCustomDay}>
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Your training days:
                    </div>
                    <div className="flex gap-2">
                      {customDays.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCustomDay(activeCustomDay)}
                        >
                          Remove{" "}
                          {
                            customDays.find((d) => d.id === activeCustomDay)
                              ?.name
                          }
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={addCustomDay}
                        disabled={customDays.length >= 10}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Day
                      </Button>
                    </div>
                  </div>

                  <TabsList
                    className={`grid ${
                      customDays.length <= 5
                        ? `grid-cols-${customDays.length}`
                        : "grid-cols-5"
                    } gap-2 w-full h-auto bg-card p-2 border-b`}
                  >
                    {customDays.map((day) => (
                      <TabsTrigger
                        key={day.id}
                        value={day.id}
                        className="relative h-auto py-3 bg-card border-b"
                      >
                        <span className="font-medium">{day.name}</span>
                        {exercises[day.id] && exercises[day.id].length > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-semibold text-white shadow-sm">
                            {exercises[day.id].length}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {customDays.map((day) => (
                  <TabsContent
                    key={day.id}
                    value={day.id}
                    className="space-y-4 mt-0"
                  >
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`day-title-${day.id}`}
                          className="text-sm font-medium"
                        >
                          Name for {day.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          id={`day-title-${day.id}`}
                          type="text"
                          placeholder="e.g., Push A, Upper Body, Legs"
                          value={day.dayName}
                          onChange={(e) =>
                            updateCustomDayName(day.id, e.target.value)
                          }
                          className="max-w-md bg-background"
                        />
                      </div>
                    </div>

                    {exercises[day.id] && exercises[day.id].length > 0 && (
                      <div>
                        <div className="mb-3 text-sm font-medium">
                          Exercises ({exercises[day.id].length}):
                        </div>
                        <DaySchedule
                          exercises={exercises[day.id] || []}
                          onRemoveExercise={(exerciseId) =>
                            removeExercise(day.id, exerciseId)
                          }
                          onUpdateExercise={(exercise) =>
                            updateExercise(day.id, exercise)
                          }
                          onReorderExercises={(newExercises) =>
                            updateExercises(day.id, newExercises)
                          }
                        />
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        <div className="font-medium">Add Exercise</div>
                      </div>
                      <ExerciseForm onAddExercise={addExercise} />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Section */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmitProgram}
          disabled={
            !programName.trim() ||
            !Object.values(exercises).some(
              (dayExercises) => dayExercises.length > 0
            ) ||
            isLoading
          }
          size="lg"
          className="w-full sm:w-auto min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Program"
          )}
        </Button>
      </div>
    </div>
  );
}

const numberLabel = (number: number, context: string, isDark: boolean) => {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        context.length > 0
          ? isDark
            ? "bg-green-900"
            : "bg-green-200"
          : "bg-muted-foreground"
      } font-semibold text-sm text-primary-foreground`}
    >
      {context.length > 0 ? (
        <Check
          className={`h-4 w-4 ${isDark ? "text-green-400" : "text-green-700"}`}
        />
      ) : (
        number
      )}
    </div>
  );
};
