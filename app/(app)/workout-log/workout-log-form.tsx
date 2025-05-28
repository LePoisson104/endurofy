"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Check,
  ArrowUp,
  ArrowDown,
  Minus,
  History,
  SquarePen,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  WorkoutDay,
  Exercise,
  WorkoutProgram,
  AllDays,
} from "../../../interfaces/workout-program-interfaces";
import Image from "next/image";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

interface WorkoutLogFormProps {
  program: WorkoutProgram;
  selectedDate: Date;
  onSaveLog: (log: any) => void;
  workoutLogs?: any[];
}

interface SetData {
  weight: string;
  reps: string;
  isLogged: boolean;
}

export function WorkoutLogForm({
  program,
  selectedDate,
  onSaveLog,
}: WorkoutLogFormProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [allDays, setAllDays] = useState<Record<number, AllDays>>({});
  const [showPrevious, setShowPrevious] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");

  // Track set data for each exercise
  const [exerciseSets, setExerciseSets] = useState<Record<string, SetData[]>>(
    {}
  );

  const maxDays =
    program.programType === "dayOfWeek" ? 7 : program.workoutDays?.length;

  // Initialize exercise sets when selectedDay changes
  useEffect(() => {
    if (selectedDay) {
      const initialSets: Record<string, SetData[]> = {};
      selectedDay.exercises.forEach((exercise) => {
        initialSets[exercise.exerciseId] = Array.from(
          { length: exercise.sets },
          (_, index) => ({
            weight: "",
            reps: "",
            isLogged: Math.random() > 0.7, // 30% chance of being logged for demo
          })
        );
      });
      setExerciseSets(initialSets);
    }
  }, [selectedDay]);

  // Set initial selected day when program or selectedDate changes
  useEffect(() => {
    if (program.workoutDays && program.workoutDays.length > 0) {
      let matchingDay: WorkoutDay | null = null;

      if (program.programType === "custom") {
        // For custom programs, calculate the cycle day based on starting date
        const startingDate = new Date(program.startingDate);
        const daysDifference = Math.floor(
          (selectedDate.getTime() - startingDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        // Get the maximum day number to determine the cycle length (accounts for rest days)
        const maxDayNumber = Math.max(
          ...program.workoutDays.map((workoutDay) => workoutDay.dayNumber)
        );

        if (maxDayNumber > 0) {
          // Calculate which day in the cycle this date represents (1-based)
          // Handle both positive and negative daysDifference (before and after start date)
          let cycleDay;
          if (daysDifference >= 0) {
            cycleDay = (daysDifference % maxDayNumber) + 1;
          } else {
            // For days before start date, calculate backwards
            const positiveDays = Math.abs(daysDifference);
            const remainder = positiveDays % maxDayNumber;
            cycleDay =
              remainder === 0 ? maxDayNumber : maxDayNumber - remainder + 1;
          }

          // Find the workout day that matches this cycle day
          matchingDay =
            program.workoutDays.find((day) => day.dayNumber === cycleDay) ||
            null;
        }
      } else {
        // Original logic for dayOfWeek programs
        const dayOfWeek = selectedDate.getDay() || 7; // Convert Sunday (0) to 7

        // Find the workout day that matches the selected date's day of week
        matchingDay =
          program.workoutDays.find((day) => day.dayNumber === dayOfWeek) ||
          null;
      }

      setSelectedDay(matchingDay);
    }

    setAllDays(
      program.programType === "dayOfWeek"
        ? {
            1: "monday",
            2: "tuesday",
            3: "wednesday",
            4: "thursday",
            5: "friday",
            6: "saturday",
            7: "sunday",
          }
        : {
            1: "D1",
            2: "D2",
            3: "D3",
            4: "D4",
            5: "D5",
            6: "D6",
            7: "D7",
            8: "D8",
            9: "D9",
            10: "D10",
          }
    );
  }, [program, selectedDate]);

  // Update set data
  const updateSetData = (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, index) =>
        index === setIndex ? { ...set, [field]: value } : set
      ),
    }));
  };

  // Toggle set logged status
  const toggleSetLogged = (exerciseId: string, setIndex: number) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, index) =>
        index === setIndex ? { ...set, isLogged: !set.isLogged } : set
      ),
    }));
  };

  // Check if all sets in an exercise are logged
  const isExerciseFullyLogged = (exerciseId: string): boolean => {
    const sets = exerciseSets[exerciseId] || [];
    return sets.length > 0 && sets.every((set) => set.isLogged);
  };

  // Check if exercise has any logged sets
  const hasLoggedSets = (exerciseId: string): boolean => {
    const sets = exerciseSets[exerciseId] || [];
    return sets.some((set) => set.isLogged);
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

  if (!selectedDay) {
    return (
      <>
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workout scheduled for this day. This is a rest day.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center items-center w-full mt-4 border rounded-lg h-[400px]">
          <Image
            src={
              isDark ? "/images/darksnorlax.png" : "/images/lightsnorlax.png"
            }
            alt="Rest Day"
            width={150}
            height={150}
          />
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="space-y-2 flex justify-between items-center w-full">
          <div className="flex">
            <div>
              <h2 className="text-xl font-bold">{selectedDay?.dayName}</h2>
              <div className="text-sm text-slate-500">
                {format(selectedDate, "MMMM d, yyyy")}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <SquarePen className="h-4 w-4" />
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPrevious(!showPrevious)}
            className="border3 w-fit"
          >
            <History className="h-4 w-4 mr-2" />
            {showPrevious ? "Hide Previous" : "Show Previous"}
          </Button>
        )}
      </div>

      {selectedDay && (
        <div className="space-y-6">
          {[...selectedDay.exercises]
            .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
            .map((exercise: Exercise) => {
              const sets = exerciseSets[exercise.exerciseId] || [];
              const isFullyLogged = isExerciseFullyLogged(exercise.exerciseId);
              const hasAnyLoggedSets = hasLoggedSets(exercise.exerciseId);

              return (
                <div
                  key={exercise.exerciseId}
                  className={`rounded-lg space-y-4 ${
                    isMobile ? "p-0 border-none" : "p-4 border"
                  } ${
                    isFullyLogged
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{exercise.exerciseName}</h4>
                        {isFullyLogged && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">Logged</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">
                        Target: {exercise.sets} sets × {exercise.minReps}-
                        {exercise.maxReps} reps
                      </div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px]">
                          <Check className="h-4 w-4 mx-auto" />
                        </TableHead>
                        <TableHead className="w-[60px] text-center">
                          Set #
                        </TableHead>
                        <TableHead className="w-[120px] text-center">
                          Weight (lbs)
                        </TableHead>
                        <TableHead className="w-[120px] text-center">
                          Reps
                        </TableHead>
                        {(!isMobile || showPrevious) && (
                          <>
                            <TableHead className="w-[120px] text-center">
                              Prev Weight
                            </TableHead>
                            <TableHead className="w-[120px] text-center">
                              Prev Reps
                            </TableHead>
                          </>
                        )}
                        {/* Show Actions column only when in edit mode and exercise has logged sets */}
                        {isEditing && hasAnyLoggedSets && (
                          <TableHead className="w-[120px] text-center">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: exercise.sets }).map(
                        (_, setIndex) => {
                          const setData = sets[setIndex] || {
                            weight: "",
                            reps: "",
                            isLogged: false,
                          };

                          return (
                            <TableRow key={setIndex}>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={setData.isLogged}
                                  onCheckedChange={() =>
                                    toggleSetLogged(
                                      exercise.exerciseId,
                                      setIndex
                                    )
                                  }
                                  className="h-4 w-4"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-center">
                                {setIndex + 1}
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  placeholder="-"
                                  type="number"
                                  min="0"
                                  step="2.5"
                                  value={setData.weight}
                                  onChange={(e) =>
                                    updateSetData(
                                      exercise.exerciseId,
                                      setIndex,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  disabled={setData.isLogged}
                                  className={`w-20 mx-auto text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                    setData.isLogged ? "bg-muted/50" : ""
                                  }`}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  placeholder="-"
                                  type="number"
                                  min="0"
                                  value={setData.reps}
                                  onChange={(e) =>
                                    updateSetData(
                                      exercise.exerciseId,
                                      setIndex,
                                      "reps",
                                      e.target.value
                                    )
                                  }
                                  disabled={setData.isLogged}
                                  className={`w-20 mx-auto text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                    setData.isLogged ? "bg-muted/50" : ""
                                  }`}
                                />
                              </TableCell>
                              {(!isMobile || showPrevious) && (
                                <>
                                  <TableCell className="text-slate-500 text-center">
                                    -
                                  </TableCell>
                                  <TableCell className="text-slate-500 text-center">
                                    -
                                  </TableCell>
                                </>
                              )}
                              {/* Show edit/delete buttons only for logged sets when in edit mode */}
                              {isEditing && hasAnyLoggedSets && (
                                <TableCell className="text-center">
                                  {setData.isLogged ? (
                                    <div className="flex justify-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">
                                          Edit set
                                        </span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">
                                          Delete set
                                        </span>
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-sm">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </div>
              );
            })}

          <div className="space-y-2">
            <Label htmlFor="workout-notes">Workout Notes:</Label>
            <Textarea
              id="workout-notes"
              placeholder="Add notes about this workout..."
              className="min-h-[100px]"
              value={workoutNotes}
              disabled={!isEditing}
              onChange={(e) => setWorkoutNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button className="w-[170px]" disabled={!isEditing}>
              Complete Workout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
