"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  useSetProgramAsActiveMutation,
  useSetProgramAsInactiveMutation,
} from "@/api/workout-program/workout-program-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import ErrorAlert from "@/components/alerts/error-alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "next/navigation";
import WithoutProgramForm from "./without-program-form";

import type { WorkoutProgram } from "../../../interfaces/workout-program-interfaces";
import type { WorkoutLog as WorkoutLogInterface } from "../../../interfaces/workout-log-interfaces";

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
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogInterface[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState("log");
  const [error, setError] = useState<string | null>(null);

  const [setProgramAsActive] = useSetProgramAsActiveMutation();
  const [setProgramAsInactive] = useSetProgramAsInactiveMutation();

  // Load selectedDate from localStorage on component mount
  useEffect(() => {
    const savedDate = localStorage.getItem("selectedDate");

    if (savedDate) {
      setSelectedDate(new Date(savedDate));
    }

    const savedTab = localStorage.getItem("selectedTab");
    if (savedTab) {
      setSelectedTab(savedTab);
    }
  }, []);

  useEffect(() => {
    const date = searchParams.get("date");
    const tab = searchParams.get("tab");

    if (date && tab) {
      setSelectedDate(new Date(date + "T00:00:00"));
      setSelectedTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (programs) {
      const program = programs.filter((program) => program.isActive === 1);
      setSelectedProgram(program[0]);
    }
  }, [programs]);

  const handleSetProgramAsActive = async (programId: string) => {
    if (programId === "without-program") {
      try {
        await setProgramAsInactive({
          programId: selectedProgram?.programId,
          userId: user?.user_id,
        }).unwrap();
      } catch (error: any) {
        if (error.data.message) {
          setError(error.data.message);
        } else {
          setError("Internal server error. Failed to set program as inactive");
        }
      }
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
    localStorage.setItem("selectedDate", date.toISOString());
    setShowCalendar(false); // Hide calendar on mobile after selection
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    localStorage.setItem("selectedTab", value);
  };

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
          onValueChange={handleTabChange}
        >
          <TabsList className={`${isMobile ? "w-full" : ""}`}>
            <TabsTrigger
              value="log"
              className={`${isMobile ? "w-full" : "w-[150px]"}`}
            >
              Log
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className={`${isMobile ? "w-full" : "w-[150px]"}`}
            >
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {selectedTab === "log" && (
          <ProgramSelector
            programs={programs as WorkoutProgram[]}
            selectedProgramId={selectedProgram?.programId || "without-program"}
            onSelectProgram={handleSetProgramAsActive}
          />
        )}
        <div>
          {/* Mobile Calendar Toggle Button */}
          {selectedTab === "log" && (
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
          )}

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

          <div
            className={`grid grid-cols-1 gap-[1rem] ${
              selectedTab === "log" ? "lg:grid-cols-4" : "lg:grid-cols-1"
            }`}
          >
            {/* Left side - Workout Log */}
            <div className="lg:col-span-3 space-y-6">
              {selectedTab === "log" ? (
                <Card>
                  <CardContent>
                    {selectedProgram ? (
                      <WorkoutLogForm
                        program={selectedProgram}
                        selectedDate={selectedDate}
                      />
                    ) : (
                      <WithoutProgramForm selectedDate={selectedDate} />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <WorkoutLogHistory
                  selectedProgram={selectedProgram || "without-program"}
                />
              )}
            </div>

            {/* Right side - Calendar (visible only on desktop) */}
            {selectedTab === "log" && (
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
