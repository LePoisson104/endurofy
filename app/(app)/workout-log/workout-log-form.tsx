"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Save,
  ArrowUp,
  ArrowDown,
  Minus,
  History,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  WorkoutDay,
  Exercise,
  WorkoutProgram,
  AllDays,
} from "../../../interfaces/workout-program-interfaces";

interface WorkoutLogFormProps {
  program: WorkoutProgram;
  selectedDate: Date;
  onSaveLog: (log: any) => void;
  workoutLogs?: any[];
}

export function WorkoutLogForm({
  program,
  selectedDate,
  onSaveLog,
}: WorkoutLogFormProps) {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null);
  const [allDays, setAllDays] = useState<Record<number, AllDays>>({});
  const [showPrevious, setShowPrevious] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");

  const maxDays =
    program.programType === "dayOfWeek" ? 7 : program.workoutDays?.length;

  // Set initial selected day when program or selectedDate changes
  useEffect(() => {
    if (program.workoutDays && program.workoutDays.length > 0) {
      // Get the day of week (1-7, where 1 is Monday)
      const dayOfWeek = selectedDate.getDay() || 7; // Convert Sunday (0) to 7

      // Find the workout day that matches the selected date's day of week
      const matchingDay = program.workoutDays.find(
        (day) => day.dayNumber === dayOfWeek
      );

      setSelectedDay(matchingDay || null);
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
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No workout scheduled for this day. This is a rest day.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{selectedDay?.dayName}</h2>
          <div className="text-sm text-slate-500">
            {format(selectedDate, "MMMM d, yyyy")}
          </div>
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrevious(!showPrevious)}
              className="border"
            >
              <History className="h-4 w-4 mr-2" />
              {showPrevious ? "Hide Previous" : "Show Previous"}
            </Button>
          )}
        </div>
      </div>

      {selectedDay && (
        <div className="space-y-6">
          {[...selectedDay.exercises]
            .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
            .map((exercise: Exercise) => (
              <div
                key={exercise.exerciseId}
                className={`rounded-lg space-y-4 ${
                  isMobile ? "p-0 border-none" : "p-4 border"
                }`}
              >
                <div className="flex flex-col">
                  <h4 className="font-medium">{exercise.exerciseName}</h4>
                  <div className="text-sm text-slate-500">
                    Target: {exercise.sets} sets × {exercise.minReps}-
                    {exercise.maxReps} reps
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px] text-center">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: exercise.sets }).map(
                      (_, setIndex) => {
                        return (
                          <TableRow key={setIndex}>
                            <TableCell className="font-medium text-center">
                              {setIndex + 1}
                            </TableCell>
                            <TableCell className="text-center">
                              <Input
                                placeholder="-"
                                type="number"
                                min="0"
                                step="2.5"
                                className="w-20 mx-auto text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Input
                                placeholder="-"
                                type="number"
                                min="0"
                                className="w-20 mx-auto text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </div>
            ))}

          <div className="space-y-2">
            <Label htmlFor="workout-notes">Workout Notes:</Label>
            <Textarea
              id="workout-notes"
              placeholder="Add notes about this workout..."
              className="min-h-[100px]"
              onChange={(e) => setWorkoutNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button className="w-[170px]">Complete Workout</Button>
          </div>
        </div>
      )}
    </div>
  );
}
