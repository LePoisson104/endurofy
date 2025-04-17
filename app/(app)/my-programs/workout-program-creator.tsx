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

import type { WorkoutProgram, WorkoutDay, DayOfWeek, Exercise } from "./page";

interface WorkoutProgramCreatorProps {
  onCreateProgram: (program: Omit<WorkoutProgram, "id" | "createdAt">) => void;
}

export function WorkoutProgramCreator({
  onCreateProgram,
}: WorkoutProgramCreatorProps) {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeDay, setActiveDay] = useState<DayOfWeek>("monday");
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    { day: "monday", exercises: [], title: "" },
    { day: "tuesday", exercises: [], title: "" },
    { day: "wednesday", exercises: [], title: "" },
    { day: "thursday", exercises: [], title: "" },
    { day: "friday", exercises: [], title: "" },
    { day: "saturday", exercises: [], title: "" },
    { day: "sunday", exercises: [], title: "" },
  ]);

  // Handle adding a new exercise to a day
  const handleAddExercise = (exercise: Omit<Exercise, "id">) => {
    const newExercise: Exercise = {
      ...exercise,
      id: Math.random().toString(36).substring(2, 9),
    };

    setWorkoutDays(
      workoutDays.map((day) =>
        day.day === activeDay
          ? {
              ...day,
              exercises: [...day.exercises, newExercise],
            }
          : day
      )
    );
  };

  // Handle removing an exercise from a day
  const handleRemoveExercise = (day: DayOfWeek, exerciseId: string) => {
    setWorkoutDays(
      workoutDays.map((workoutDay) =>
        workoutDay.day === day
          ? {
              ...workoutDay,
              exercises: workoutDay.exercises.filter(
                (exercise) => exercise.id !== exerciseId
              ),
            }
          : workoutDay
      )
    );
  };

  // Handle updating an exercise
  const handleUpdateExercise = (day: DayOfWeek, updatedExercise: Exercise) => {
    setWorkoutDays(
      workoutDays.map((workoutDay) =>
        workoutDay.day === day
          ? {
              ...workoutDay,
              exercises: workoutDay.exercises.map((exercise) =>
                exercise.id === updatedExercise.id ? updatedExercise : exercise
              ),
            }
          : workoutDay
      )
    );
  };

  // Handle creating the workout program
  const handleCreateProgram = () => {
    if (!name.trim()) return;

    // Filter out days with no exercises
    const daysWithExercises = workoutDays.filter(
      (day) => day.exercises.length > 0
    );

    onCreateProgram({
      name: name.trim(),
      description: description.trim() || undefined,
      days: daysWithExercises,
    });

    // Reset form
    setName("");
    setDescription("");
    setWorkoutDays([
      { day: "monday", exercises: [], title: "" },
      { day: "tuesday", exercises: [], title: "" },
      { day: "wednesday", exercises: [], title: "" },
      { day: "thursday", exercises: [], title: "" },
      { day: "friday", exercises: [], title: "" },
      { day: "saturday", exercises: [], title: "" },
      { day: "sunday", exercises: [], title: "" },
    ]);
  };

  // Format day name
  const formatDayName = (day: DayOfWeek) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Get exercises for the active day
  const getExercisesForActiveDay = () => {
    const activeWorkoutDay = workoutDays.find((day) => day.day === activeDay);
    return activeWorkoutDay ? activeWorkoutDay.exercises : [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Workout Program</CardTitle>
          <CardDescription>
            Create a new workout program by adding exercises for each day of the
            week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-name">Program Name</Label>
            <Input
              id="program-name"
              placeholder="e.g., Hypertrophy Program"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-description">Description (optional)</Label>
            <Textarea
              id="program-description"
              placeholder="Describe your workout program... (50 characters max)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout Schedule</CardTitle>
          <CardDescription>
            Add exercises for each day of your workout program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeDay}
            onValueChange={(value) => setActiveDay(value as DayOfWeek)}
          >
            <TabsList className="mb-4 grid w-full grid-cols-7">
              {workoutDays.map((day) => (
                <TabsTrigger key={day.day} value={day.day} className="relative">
                  {formatDayName(day.day).slice(0, 3)}
                  {day.exercises.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                      {day.exercises.length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {workoutDays.map((day) => (
              <TabsContent key={day.day} value={day.day} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {formatDayName(day.day)}
                  </h3>
                </div>

                <DaySchedule
                  exercises={day.exercises}
                  onRemoveExercise={(exerciseId) =>
                    handleRemoveExercise(day.day, exerciseId)
                  }
                  onUpdateExercise={(exercise) =>
                    handleUpdateExercise(day.day, exercise)
                  }
                />

                <Card className={`${isMobile ? "border-none" : ""}`}>
                  <CardHeader className={`${isMobile ? "p-0" : ""}`}>
                    <CardTitle className="text-base">Add Exercise</CardTitle>
                  </CardHeader>
                  <CardContent className={`${isMobile ? "p-0" : ""}`}>
                    <ExerciseForm onAddExercise={handleAddExercise} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleCreateProgram} disabled={!name.trim()}>
          Create Workout Program
        </Button>
      </div>
    </div>
  );
}
