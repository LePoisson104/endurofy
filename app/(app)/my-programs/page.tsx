"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutProgramList from "./workout-program-list";
import { WorkoutProgramCreator } from "./workout-program-creator";
import { WorkoutProgramDetail } from "./workout-program-detail";
import PageTitle from "@/components/global/page-title";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useGetWorkoutProgramQuery } from "@/api/workout-program/workout-program-slice";
import type { WorkoutProgram } from "../../../interfaces/workout-program-interfaces";

export default function MyPrograms() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "my-programs";
  const programIdParam = searchParams.get("programId");
  const user = useSelector(selectCurrentUser);
  const { data: programs, isLoading } = useGetWorkoutProgramQuery({
    userId: user?.user_id,
  });

  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    if (programs) {
      setWorkoutPrograms(programs.data.programs);
    }
  }, [programs]);

  // Restore selected program from URL parameter on initial load
  useEffect(() => {
    if (programIdParam && workoutPrograms.length > 0) {
      const program = workoutPrograms.find(
        (p) => p.programId === programIdParam
      );
      if (program) {
        setSelectedProgram(program);
      }
    }
  }, [programIdParam, workoutPrograms]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without refreshing the page
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    window.history.pushState({}, "", url.toString());
  };

  // Handle creating a new workout program
  const handleCreateProgram = (
    program: Omit<WorkoutProgram, "programId" | "createdAt" | "updatedAt">
  ) => {
    const newProgram: WorkoutProgram = {
      ...program,
      programId: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWorkoutPrograms([...workoutPrograms, newProgram]);
    setSelectedProgram(newProgram);
    setActiveTab("my-programs");
    // Update URL to reflect the new tab and selected program
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "my-programs");
    url.searchParams.set("programId", newProgram.programId);
    window.history.pushState({}, "", url.toString());
  };

  // Handle updating a workout program
  const handleUpdateProgram = (updatedProgram: WorkoutProgram) => {
    setWorkoutPrograms(
      workoutPrograms.map((program) =>
        program.programId === updatedProgram.programId
          ? updatedProgram
          : program
      )
    );
    setSelectedProgram(updatedProgram);
  };

  // Handle deleting a workout program
  const handleDeleteProgram = (programId: string) => {
    setWorkoutPrograms(
      workoutPrograms.filter((program) => program.programId !== programId)
    );
    if (selectedProgram?.programId === programId) {
      setSelectedProgram(null);
      // Remove programId from URL when program is deleted
      const url = new URL(window.location.href);
      url.searchParams.delete("programId");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Handle selecting a program
  const handleSelectProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
    // Update URL to include the selected program ID
    const url = new URL(window.location.href);
    url.searchParams.set("programId", program.programId);
    window.history.pushState({}, "", url.toString());
  };

  // Handle going back to program list
  const handleBackToProgramList = () => {
    setSelectedProgram(null);
    // Remove programId from URL when going back to list
    const url = new URL(window.location.href);
    url.searchParams.delete("programId");
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      <header className="mb-6">
        <PageTitle
          title="Workout Programs"
          subTitle="Create personalize workout plans and progress tracking"
        />
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-programs">My Programs</TabsTrigger>
              <TabsTrigger value="create-program">Create Program</TabsTrigger>
            </TabsList>

            <TabsContent value="my-programs" className="space-y-6">
              {selectedProgram ? (
                <WorkoutProgramDetail
                  program={selectedProgram}
                  onBack={handleBackToProgramList}
                  onUpdate={handleUpdateProgram}
                  onDelete={handleDeleteProgram}
                />
              ) : (
                <WorkoutProgramList
                  programs={workoutPrograms}
                  onSelectProgram={handleSelectProgram}
                  onDeleteProgram={handleDeleteProgram}
                  isLoading={isLoading}
                />
              )}
            </TabsContent>

            <TabsContent value="create-program">
              <WorkoutProgramCreator onCreateProgram={handleCreateProgram} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
