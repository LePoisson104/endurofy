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
  const user = useSelector(selectCurrentUser);
  const { data: programs, isLoading } = useGetWorkoutProgramQuery({
    userId: user?.user_id,
  });

  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);

  useEffect(() => {
    if (programs) {
      setWorkoutPrograms(programs.data.programs);
    }
  }, [programs]);

  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Handle creating a new workout program
  const handleCreateProgram = (
    program: Omit<WorkoutProgram, "programId" | "createdAt">
  ) => {
    const newProgram: WorkoutProgram = {
      ...program,
      programId: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };

    setWorkoutPrograms([...workoutPrograms, newProgram]);
    setSelectedProgram(newProgram);
    setActiveTab("my-programs");
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
    }
  };

  // Handle selecting a program
  const handleSelectProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
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
            onValueChange={setActiveTab}
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
                  onBack={() => setSelectedProgram(null)}
                  onUpdate={handleUpdateProgram}
                  onDelete={handleDeleteProgram}
                />
              ) : (
                <WorkoutProgramList
                  programs={workoutPrograms}
                  onSelectProgram={handleSelectProgram}
                  onDeleteProgram={handleDeleteProgram}
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
