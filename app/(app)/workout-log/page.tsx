"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutLogForm } from "./workout-log-form";
import { WorkoutLogHistory } from "./workout-log-history";
import { WorkoutCalendar } from "./workout-calendar";
import { ProgramSelector } from "./program-selector";
import { WeeklyVolume } from "./weekly-volume";
import PageTitle from "@/components/global/page-title";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useSetProgramAsActiveMutation } from "@/api/workout-program/workout-program-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import {
  getCurrentDate,
  getCurrentTime,
} from "@/helper/get-current-date-n-time";
import ErrorAlert from "@/components/alerts/error-alert";

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
  const user = useSelector(selectCurrentUser);

  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState("log");
  const [error, setError] = useState<string | null>(null);

  const [setProgramAsActive] = useSetProgramAsActiveMutation();

  useEffect(() => {
    if (programs) {
      const program = programs.filter((program) => program.isActive === 1);
      setSelectedProgram(program[0]);
    }
  }, [programs]);

  // Reset selectedDate to current date when program changes
  useEffect(() => {
    if (selectedProgram) {
      setSelectedDate(new Date());
    }
  }, [selectedProgram?.programId]);

  const handleSetProgramAsActive = async (programId: string) => {
    if (programId === "without-program") {
      setSelectedProgram(null);
      return;
    }
    try {
      await setProgramAsActive({
        programId: programId,
        userId: user?.user_id,
      }).unwrap();
    } catch (error: any) {
      if (error.data.message) {
        setError(error.data.message);
      } else {
        setError("Internal server error. Failed to set program as inactive");
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false); // Hide calendar on mobile after selection
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleSaveWorkoutLog = () => {};

  const handleDeleteWorkoutLog = () => {};

  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      <ErrorAlert error={error} setError={setError} />
      <header>
        <PageTitle title="Workout Log" />
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
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>
        </Tabs>
        {selectedTab === "log" && (
          <ProgramSelector
            programs={programs as WorkoutProgram[]}
            selectedProgramId={selectedProgram?.programId}
            onSelectProgram={handleSetProgramAsActive}
          />
        )}
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
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                    program={selectedProgram as WorkoutProgram | undefined}
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
              ) : selectedTab === "history" ? (
                <WorkoutLogHistory
                  logs={workoutLogs}
                  onDeleteLog={handleDeleteWorkoutLog}
                  onSelectDate={handleDateSelect}
                />
              ) : (
                <WeeklyVolume workoutLogs={workoutLogs} />
              )}
            </div>

            {/* Right side - Calendar (visible only on desktop) */}
            <div className="hidden lg:block space-y-6">
              <Card>
                <CardContent>
                  <WorkoutCalendar
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                    program={selectedProgram as WorkoutProgram | undefined}
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
