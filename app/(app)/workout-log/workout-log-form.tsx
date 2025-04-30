"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import type { WorkoutProgram, DayOfWeek } from "../my-programs/page";
import type { WorkoutLog, ExerciseLog } from "./page";

interface WorkoutLogFormProps {
  program: WorkoutProgram;
  selectedDate: Date;
  existingLog: WorkoutLog | null;
  onSaveLog: (log: Omit<WorkoutLog, "id">) => void;
  workoutLogs?: WorkoutLog[];
}

export function WorkoutLogForm({
  program,
  selectedDate,
  existingLog,
  onSaveLog,
  workoutLogs = [],
}: WorkoutLogFormProps) {
  const isMobile = useIsMobile();
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
          weights: Array(exercise.sets).fill(0),
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

  // Get previous week's workout data for comparison
  const getPreviousWeekData = (exerciseName: string, setIndex: number) => {
    // Find logs from previous weeks for the same program and day
    const previousLogs = workoutLogs.filter(
      (log) =>
        log.programId === program.id &&
        log.day === selectedDay &&
        new Date(log.date).getTime() < selectedDate.getTime()
    );

    // Sort by date (newest first)
    const sortedLogs = previousLogs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get the most recent log
    const previousLog = sortedLogs[0];

    if (!previousLog) return { weight: null, reps: null };

    // Find the exercise in the previous log
    const previousExercise = previousLog.exercises.find(
      (ex) => ex.name === exerciseName
    );

    if (
      !previousExercise ||
      setIndex >= previousExercise.weights.length ||
      setIndex >= previousExercise.completedReps.length
    ) {
      return { weight: null, reps: null };
    }

    return {
      weight: previousExercise.weights[setIndex],
      reps: previousExercise.completedReps[setIndex],
    };
  };

  // Handle updating weight for an exercise set
  const handleWeightChange = (
    exerciseId: string,
    setIndex: number,
    weight: number
  ) => {
    setExerciseLogs(
      exerciseLogs.map((exercise) => {
        if (exercise.id === exerciseId) {
          const updatedWeights = [...exercise.weights];
          updatedWeights[setIndex] = weight;
          return { ...exercise, weights: updatedWeights };
        }
        return exercise;
      })
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

  // Render comparison indicators
  const renderComparisonIndicator = (
    current: number,
    previous: number | null
  ) => {
    if (previous === null || previous === 0) return null;

    if (current > previous) {
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    } else if (current < previous) {
      return <ArrowDown className="h-3 w-3 text-red-500" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
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
    <div className="space-y-6">
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
          <TabsList className={`mb-4 flex`}>
            {daysWithExercises.map((day) => (
              <TabsTrigger key={day.day} value={day.day}>
                {formatDayName(day.day).slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {selectedDay && (
        <div>
          <h2 className="text-xl font-bold">
            {program.days.find((day) => day.day === selectedDay)?.title}
          </h2>
        </div>
      )}

      {selectedDay && (
        <div className="space-y-6">
          {exerciseLogs.map((exercise) => (
            <div
              key={exercise.id}
              className={`rounded-lg space-y-4 ${
                isMobile ? "p-0 border-none" : "p-4 border"
              }`}
            >
              <div className="flex flex-col">
                <h4 className="font-medium">{exercise.name}</h4>
                <div className="text-sm text-slate-500">
                  Target: {exercise.sets} sets × {exercise.minReps}-
                  {exercise.maxReps} reps
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Set #</TableHead>
                    <TableHead className="w-[120px]">Weight (lbs)</TableHead>
                    <TableHead className="w-[120px]">Reps</TableHead>
                    <TableHead className="w-[120px]">Prev Weight</TableHead>
                    <TableHead className="w-[120px]">Prev Reps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: exercise.sets }).map((_, setIndex) => {
                    const prevData = getPreviousWeekData(
                      exercise.name,
                      setIndex
                    );
                    const currentWeight = exercise.weights[setIndex];
                    const currentReps = exercise.completedReps[setIndex];

                    return (
                      <TableRow key={setIndex}>
                        <TableCell className="font-medium">
                          {setIndex + 1}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              step="2.5"
                              value={exercise.weights[setIndex]}
                              onChange={(e) =>
                                handleWeightChange(
                                  exercise.id,
                                  setIndex,
                                  Number.parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              {exercise.weights[setIndex]}
                              {renderComparisonIndicator(
                                exercise.weights[setIndex],
                                prevData.weight
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={currentReps}
                              onChange={(e) =>
                                handleRepsChange(
                                  exercise.id,
                                  setIndex,
                                  Number.parseInt(e.target.value) || 0
                                )
                              }
                              className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              {currentReps}
                              {renderComparisonIndicator(
                                currentReps,
                                prevData.reps
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {prevData.weight !== null ? prevData.weight : "-"}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {prevData.reps !== null ? prevData.reps : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="workout-notes">Workout Notes:</Label>
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
            <div className="flex justify-end">
              <Button onClick={handleSaveLog} className="w-fit" size="lg">
                <Save className="mr-2 h-4 w-4" />
                {existingLog ? "Update Workout Log" : "Save Workout Log"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
