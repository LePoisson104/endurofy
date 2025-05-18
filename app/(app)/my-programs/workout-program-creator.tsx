"use client";

import { useState } from "react";
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
import { ExerciseForm } from "./exercise-form";
import { DaySchedule } from "./day-scheldule";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Plus } from "lucide-react";

import type {
  AllDays,
  Exercise,
  CreateWorkoutProgram,
  CreateWorkoutDay,
} from "../../../interfaces/workout-program-interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorAlert from "@/components/alerts/error-alert";

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
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
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
  const [error, setError] = useState<string>("");
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

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

    // Renumber the remaining days sequentially
    const renumberedDays = updatedDays.map((day, index) => {
      const newDayNumber = index + 1;
      return {
        ...day,
        id: `d${newDayNumber}`,
        name: `D${newDayNumber}`,
      };
    });

    setCustomDays(renumberedDays);

    // If we're removing the active day, set the active day to the first available day
    if (activeCustomDay === dayId) {
      setActiveCustomDay(renumberedDays[0].id);
    } else {
      // Update the active day ID if it's one of the days that was renumbered
      const activeDayIndex = updatedDays.findIndex(
        (day) => day.id === activeCustomDay
      );
      if (activeDayIndex !== -1) {
        setActiveCustomDay(`d${activeDayIndex + 1}`);
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
            ({ exerciseId, ...rest }) => rest
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
            ({ exerciseId, ...rest }) => rest
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
      programType,
      workoutDays,
    };

    // Call the onCreateProgram callback
    onCreateProgram(program);

    // Reset form and trigger success callback
    resetForm();
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      <ErrorAlert error={error} setError={setError} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Workout Program</CardTitle>
          <CardDescription>
            Customize your program to your needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-name">Program Name</Label>
            <Input
              id="program-name"
              placeholder="e.g., Hypertrophy Program"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="text-sm"
              maxLength={30}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-description">Description (optional)</Label>
            <Textarea
              id="program-description"
              placeholder="Describe your workout program... (100 characters max)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] text-sm"
              maxLength={100}
            />
          </div>
        </CardContent>
      </Card>

      <Card className={`${isMobile ? "pb-0" : ""}`}>
        <CardHeader>
          <CardTitle className="text-base">Workout Schedule</CardTitle>
          <CardDescription>
            Add exercises for each day of your workout program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select
              value={programType}
              onValueChange={(value) =>
                setProgramType(value as "dayOfWeek" | "custom")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dayOfWeek">Day of week</SelectItem>
                <SelectItem value="custom">custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {programType === "dayOfWeek" ? (
            <Tabs
              value={activeDay}
              onValueChange={(value) => setActiveDay(value as AllDays)}
            >
              <TabsList className="mb-4 grid w-full grid-cols-7">
                {daysOfWeek.map((day) => (
                  <TabsTrigger key={day} value={day} className="relative">
                    {formatDayName(day as AllDays).slice(0, 3)}
                    {exercises[day] && exercises[day].length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                        {exercises[day].length}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {daysOfWeek.map((day) => (
                <TabsContent key={day} value={day} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="day-title">Day Name</Label>
                    <Input
                      id="day-title"
                      type="text"
                      placeholder="e.g., Push A"
                      value={dayNames[day] || ""}
                      onChange={(e) => updateDayName(day, e.target.value)}
                      className="text-sm w-fit"
                    />
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
                    setError={setError}
                  />

                  <Card className={`${isMobile ? "border-none" : "border"}`}>
                    <CardHeader className={`${isMobile ? "p-0" : ""}`}>
                      <CardTitle className="text-base">Add Exercise</CardTitle>
                    </CardHeader>
                    <CardContent className={`${isMobile ? "p-0" : ""}`}>
                      <ExerciseForm onAddExercise={addExercise} />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-4">
              <Tabs value={activeCustomDay} onValueChange={setActiveCustomDay}>
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex justify-end mb-2 gap-2">
                    {customDays.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomDay(activeCustomDay)}
                        className="text-destructive"
                      >
                        Remove Day
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCustomDay}
                      disabled={customDays.length >= 10}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Day
                    </Button>
                  </div>
                  <TabsList className="grid grid-cols-6 gap-1 w-full mb-8 bg-muted p-1 rounded-md">
                    {customDays.map((day) => (
                      <TabsTrigger
                        key={day.id}
                        value={day.id}
                        className="relative data-[state=active]:bg-background"
                      >
                        {day.name}
                        {exercises[day.id] && exercises[day.id].length > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
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
                    className="space-y-4"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`day-title-${day.id}`}>Day Name</Label>
                      </div>
                      <Input
                        id={`day-title-${day.id}`}
                        type="text"
                        placeholder="e.g., Push A"
                        value={day.dayName}
                        onChange={(e) =>
                          updateCustomDayName(day.id, e.target.value)
                        }
                        className="text-sm w-fit"
                      />
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
                      setError={setError}
                    />

                    <Card className={`${isMobile ? "border-none" : ""}`}>
                      <CardHeader className={`${isMobile ? "p-0" : ""}`}>
                        <CardTitle className="text-base">
                          Add Exercise
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={`${isMobile ? "p-0" : ""}`}>
                        <ExerciseForm onAddExercise={addExercise} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSubmitProgram}
          disabled={
            !programName.trim() ||
            Object.keys(exercises).length === 0 ||
            isLoading
          }
          className="w-[200px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            "Create Workout Program"
          )}
        </Button>
      </div>
    </div>
  );
}
