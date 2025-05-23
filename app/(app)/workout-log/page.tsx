"use client";

import { useState, useEffect, useRef } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutLogForm } from "./workout-log-form";
import { WorkoutLogHistory } from "./workout-log-history";
import { WorkoutCalendar } from "./workout-calendar";
import { ProgramSelector } from "./program-selector";
import PageTitle from "@/components/global/page-title";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import type { WorkoutProgram } from "../../../interfaces/workout-program-interfaces";

export interface WorkoutLog {
  id: string;
  programId: string;
  programName: string;
  date: string; // ISO date string
  day: string;
  exercises: any[];
  notes?: string;
}

export default function WorkoutLogManager() {
  const programs = useSelector(selectWorkoutProgram);

  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState("log");

  useEffect(() => {
    if (programs) {
      const program = programs.filter((program) => program.isActive === 1);
      setSelectedProgram(program[0]);
    }
  }, [programs]);

  const handleProgramSelect = (programId: string) => {};
  // Handle date selection
  const handleDateSelect = (date: Date) => {};

  const toggleCalendar = () => {};

  const handleSaveWorkoutLog = () => {};

  const handleDeleteWorkoutLog = () => {};

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
          programs={programs as WorkoutProgram[]}
          selectedProgramId={selectedProgram?.programId}
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
