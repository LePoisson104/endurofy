"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgramWorkoutLog } from "./program-workout-log";
import { WorkoutLogHistory } from "./workout-log-history";
import { WorkoutCalendar } from "./workout-calendar";
import { ProgramSelector } from "./program-selector";
import PageTitle from "@/components/global/page-title";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useSetProgramAsActiveMutation } from "@/api/workout-program/workout-program-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "next/navigation";
import WithoutProgramLog from "./without-program-log";
import { toast } from "sonner";

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
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState("log");

  const [setProgramAsActive] = useSetProgramAsActiveMutation();

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
    try {
      await setProgramAsActive({
        programId: programId,
        userId: user?.user_id,
      }).unwrap();
    } catch (error: any) {
      if (error.data.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to set program as inactive");
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
            selectedProgramId={selectedProgram?.programId || ""}
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
                    {selectedProgram &&
                    selectedProgram.programType !== "manual" ? (
                      <ProgramWorkoutLog
                        program={selectedProgram}
                        selectedDate={selectedDate}
                      />
                    ) : (
                      <WithoutProgramLog selectedDate={selectedDate} />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <WorkoutLogHistory
                  selectedProgram={selectedProgram as WorkoutProgram}
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
