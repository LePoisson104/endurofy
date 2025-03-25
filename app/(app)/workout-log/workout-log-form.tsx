"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, Plus, Minus } from "lucide-react";
import type { WorkoutProgram, DayOfWeek } from "../my-programs/page";
import type { WorkoutLog, ExerciseLog } from "./page";

interface WorkoutLogFormProps {
  program: WorkoutProgram;
  selectedDate: Date;
  existingLog: WorkoutLog | null;
  onSaveLog: (log: Omit<WorkoutLog, "id">) => void;
}

export function WorkoutLogForm({
  program,
  selectedDate,
  existingLog,
  onSaveLog,
}: WorkoutLogFormProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(!existingLog);

  // Use ref to track initialization
  const initializedRef = useRef(false);

  // Get days that have exercises
  const daysWithExercises = program.days.filter(
    (day) => day.exercises.length > 0
  );

  // Initialize form when existingLog changes
  useEffect(() => {
    if (existingLog) {
      // If there's an existing log, use its data
      setSelectedDay(existingLog.day as DayOfWeek);
      setExerciseLogs(existingLog.exercises);
      setNotes(existingLog.notes || "");
      setIsEditing(false);
    } else if (!initializedRef.current) {
      // Only initialize once if there's no existing log
      const defaultDay =
        daysWithExercises.length > 0 ? daysWithExercises[0].day : null;
      setSelectedDay(defaultDay);
      setNotes("");
      setIsEditing(true);

      // Mark as initialized
      initializedRef.current = true;
    }
  }, [existingLog]); // Only depend on existingLog

  // Initialize exercise logs when day changes and we're editing
  useEffect(() => {
    if (!selectedDay || !isEditing) return;

    // Only set exercise logs if they're empty or we're changing days
    if (
      exerciseLogs.length === 0 ||
      !exerciseLogs.some((log) =>
        program.days
          .find((day) => day.day === selectedDay)
          ?.exercises.some((ex) => ex.id === log.id)
      )
    ) {
      const dayExercises =
        program.days.find((day) => day.day === selectedDay)?.exercises || [];

      // Create initial exercise logs
      const initialExerciseLogs: ExerciseLog[] = dayExercises.map(
        (exercise) => ({
          ...exercise,
          weight: 0,
          completedReps: Array(exercise.sets).fill(0),
          notes: "",
        })
      );

      setExerciseLogs(initialExerciseLogs);
    }
  }, [selectedDay, isEditing, program.days]); // Don't include exerciseLogs in dependencies

  // Format day name
  const formatDayName = (day: DayOfWeek) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Handle updating weight for an exercise
  const handleWeightChange = (exerciseId: string, weight: number) => {
    setExerciseLogs(
      exerciseLogs.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, weight } : exercise
      )
    );
  };

  // Handle updating reps for an exercise
  const handleRepsChange = (
    exerciseId: string,
    setIndex: number,
    reps: number
  ) => {
    setExerciseLogs(
      exerciseLogs.map((exercise) => {
        if (exercise.id === exerciseId) {
          const updatedReps = [...exercise.completedReps];
          updatedReps[setIndex] = reps;
          return { ...exercise, completedReps: updatedReps };
        }
        return exercise;
      })
    );
  };

  // Handle updating notes for an exercise
  const handleExerciseNotesChange = (exerciseId: string, notes: string) => {
    setExerciseLogs(
      exerciseLogs.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, notes } : exercise
      )
    );
  };

  // Handle saving the workout log
  const handleSaveLog = () => {
    if (!selectedDay) return;

    onSaveLog({
      programId: program.id,
      programName: program.name,
      date: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss"),
      day: selectedDay,
      exercises: exerciseLogs,
      notes: notes.trim() || undefined,
    });

    setIsEditing(false);
  };

  // Handle starting to edit
  const handleStartEditing = () => {
    setIsEditing(true);
  };

  if (daysWithExercises.length === 0) {
    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This program doesn't have any exercises. Please add exercises to your
          program first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {!isEditing && existingLog ? (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">
              {formatDayName(existingLog.day as DayOfWeek)} Workout
            </h3>
            <p className="text-sm text-slate-500">
              Logged for {format(selectedDate, "MMMM d, yyyy")}
            </p>
          </div>
          <Button onClick={handleStartEditing}>Edit Log</Button>
        </div>
      ) : (
        <Tabs
          value={selectedDay || undefined}
          onValueChange={(value) => setSelectedDay(value as DayOfWeek)}
        >
          <TabsList className="mb-4 grid grid-cols-7">
            {daysWithExercises.map((day) => (
              <TabsTrigger key={day.day} value={day.day}>
                {formatDayName(day.day).slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <h1 className="text-2xl font-bold mb-3">
        {selectedDay ? `${formatDayName(selectedDay)} Workout` : "Select a day"}
      </h1>

      {selectedDay && (
        <div className="space-y-6">
          {exerciseLogs.map((exercise, exerciseIndex) => (
            <div key={exercise.id}>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{exercise.name}</h4>
                  <div className="text-sm text-slate-500">
                    Target: {exercise.sets} sets × {exercise.minReps}-
                    {exercise.maxReps} reps
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`weight-${exercise.id}`} className="w-16">
                      Weight:
                    </Label>
                    <Input
                      id={`weight-${exercise.id}`}
                      type="number"
                      min="0"
                      step="2.5"
                      value={exercise.weight}
                      onChange={(e) =>
                        handleWeightChange(
                          exercise.id,
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-24"
                      disabled={!isEditing}
                    />
                    <span className="text-sm text-slate-500">lbs</span>
                  </div>

                  <div className="space-y-2">
                    <Label>Sets:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {exercise.completedReps.map((reps, setIndex) => (
                        <div key={setIndex} className="flex items-center">
                          <span className="w-8 text-sm text-slate-500">
                            #{setIndex + 1}
                          </span>
                          {isEditing ? (
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() =>
                                  handleRepsChange(
                                    exercise.id,
                                    setIndex,
                                    Math.max(0, reps - 1)
                                  )
                                }
                                disabled={!isEditing}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                value={reps}
                                onChange={(e) =>
                                  handleRepsChange(
                                    exercise.id,
                                    setIndex,
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-12 h-8 rounded-none text-center"
                                disabled={!isEditing}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() =>
                                  handleRepsChange(
                                    exercise.id,
                                    setIndex,
                                    reps + 1
                                  )
                                }
                                disabled={!isEditing}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="ml-2 font-medium">
                              {reps} reps
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="workout-notes">Workout Notes (optional):</Label>
            <Textarea
              id="workout-notes"
              placeholder="Add notes about this workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <Button onClick={handleSaveLog} className="w-full" size="lg">
              <Save className="mr-2 h-4 w-4" />
              {existingLog ? "Update Workout Log" : "Save Workout Log"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
