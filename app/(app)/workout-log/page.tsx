"use client";

import { useState, useEffect, useRef } from "react";
import { format, parseISO, isToday, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutLogForm } from "./workout-log-form";
import { WorkoutLogHistory } from "./workout-log-history";
import { WorkoutCalendar } from "./workout-calendar";
import { ProgramSelector } from "./program-selector";
import PageTitle from "@/components/global/page-title";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkoutProgram, Exercise } from "../my-programs/page";

// Import sample workout programs
import { sampleWorkoutPrograms } from "./sample-data";

export interface ExerciseLog extends Exercise {
  weights: number[];
  completedReps: number[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  programId: string;
  programName: string;
  date: string; // ISO date string
  day: string;
  exercises: ExerciseLog[];
  notes?: string;
}

export default function WorkoutLogManager() {
  const [workoutPrograms] = useState(sampleWorkoutPrograms);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [activeLog, setActiveLog] = useState<WorkoutLog | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState("log");

  // Use ref to track initialization
  const initializedRef = useRef(false);

  // Initialize with the first program only once
  useEffect(() => {
    if (
      !initializedRef.current &&
      workoutPrograms.length > 0 &&
      !selectedProgram
    ) {
      setSelectedProgram(workoutPrograms[0] as WorkoutProgram);
      initializedRef.current = true;
    }
  }, [workoutPrograms, selectedProgram]);

  // Find workout log for the selected date if it exists
  useEffect(() => {
    const existingLog = workoutLogs.find((log) =>
      isSameDay(parseISO(log.date), selectedDate)
    );

    setActiveLog(existingLog || null);
  }, [selectedDate, workoutLogs]);

  // Handle program selection
  const handleProgramSelect = (programId: string) => {
    const program = workoutPrograms.find((p) => p.id === programId);
    if (program) {
      setSelectedProgram(program as WorkoutProgram);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Auto-hide calendar on mobile after date selection
    setShowCalendar(false);
  };

  // Handle saving a workout log
  const handleSaveWorkoutLog = (log: Omit<WorkoutLog, "id">) => {
    // Check if we're updating an existing log
    const existingLogIndex = workoutLogs.findIndex((l) =>
      isSameDay(parseISO(l.date), parseISO(log.date))
    );

    if (existingLogIndex >= 0) {
      // Update existing log
      const updatedLogs = [...workoutLogs];
      updatedLogs[existingLogIndex] = {
        ...log,
        id: workoutLogs[existingLogIndex].id,
      };
      setWorkoutLogs(updatedLogs);
      setActiveLog(updatedLogs[existingLogIndex]);
    } else {
      // Create new log
      const newLog: WorkoutLog = {
        ...log,
        id: Math.random().toString(36).substring(2, 9),
      };
      setWorkoutLogs([...workoutLogs, newLog]);
      setActiveLog(newLog);
    }
  };

  // Handle deleting a workout log
  const handleDeleteWorkoutLog = (logId: string) => {
    setWorkoutLogs(workoutLogs.filter((log) => log.id !== logId));
    if (activeLog?.id === logId) {
      setActiveLog(null);
    }
  };

  // Toggle calendar visibility
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      <header>
        <PageTitle
          title="Workout Log"
          subTitle="Mar 25, 2025 (today) | 10:00 AM"
        />
      </header>

      <main className="flex-1 pt-6">
        <Tabs
          className="mb-4"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <TabsList>
            <TabsTrigger value="log">Log</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
        <ProgramSelector
          programs={workoutPrograms as WorkoutProgram[]}
          selectedProgramId={selectedProgram?.id}
          onSelectProgram={handleProgramSelect}
        />
        <div>
          {/* Mobile Calendar Toggle Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={toggleCalendar}
            >
              <CalendarIcon className="h-4 w-4" />
              {showCalendar ? "Hide Calendar" : "Show Calendar"}
            </Button>
          </div>

          {/* Mobile Calendar - Shows only when toggle is on */}
          {showCalendar && (
            <div className="lg:hidden mb-[1rem]">
              <Card>
                <CardContent>
                  <WorkoutCalendar
                    workoutLogs={workoutLogs}
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 gap-[1rem] lg:grid-cols-4">
            {/* Left side - Workout Log */}

            <div className="lg:col-span-3 space-y-6">
              {selectedTab === "log" ? (
                <Card>
                  <CardContent>
                    {selectedProgram && (
                      <WorkoutLogForm
                        program={selectedProgram}
                        selectedDate={selectedDate}
                        existingLog={activeLog}
                        onSaveLog={handleSaveWorkoutLog}
                      />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <WorkoutLogHistory
                  logs={workoutLogs}
                  onDeleteLog={handleDeleteWorkoutLog}
                  onSelectDate={handleDateSelect}
                />
              )}
            </div>

            {/* Right side - Calendar (visible only on desktop) */}
            <div className="hidden lg:block space-y-6">
              <Card>
                <CardContent>
                  <WorkoutCalendar
                    workoutLogs={workoutLogs}
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-slate-500">
                        Total Workouts
                      </div>
                      <div className="text-2xl font-bold">
                        {workoutLogs.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-500">
                        This Month
                      </div>
                      <div className="text-2xl font-bold">
                        {
                          workoutLogs.filter((log) => {
                            const logDate = parseISO(log.date);
                            return (
                              logDate.getMonth() === new Date().getMonth() &&
                              logDate.getFullYear() === new Date().getFullYear()
                            );
                          }).length
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-500">
                        Last Workout
                      </div>
                      <div className="text-lg font-medium">
                        {workoutLogs.length > 0
                          ? format(
                              parseISO(
                                workoutLogs.sort(
                                  (a, b) =>
                                    new Date(b.date).getTime() -
                                    new Date(a.date).getTime()
                                )[0].date
                              ),
                              "MMM d, yyyy"
                            )
                          : "No workouts yet"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
