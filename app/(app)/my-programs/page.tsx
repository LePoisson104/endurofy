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
import {
  useGetWorkoutProgramQuery,
  useCreateWorkoutProgramMutation,
  useDeleteWorkoutProgramMutation,
} from "@/api/workout-program/workout-program-slice";
import type {
  WorkoutProgram,
  CreateWorkoutProgram,
} from "../../../interfaces/workout-program-interfaces";
import ErrorAlert from "@/components/alerts/error-alert";
import SuccessAlert from "@/components/alerts/success-alert";

export default function MyPrograms() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "my-programs";
  const programIdParam = searchParams.get("programId");
  const user = useSelector(selectCurrentUser);
  const { data: programs, isLoading } = useGetWorkoutProgramQuery({
    userId: user?.user_id,
  });

  const [createWorkoutProgram, { isLoading: isCreating }] =
    useCreateWorkoutProgramMutation();
  const [deleteWorkoutProgram, { isLoading: isDeleting }] =
    useDeleteWorkoutProgramMutation();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
  const handleCreateProgram = async (program: CreateWorkoutProgram) => {
    try {
      await createWorkoutProgram({
        userId: user?.user_id,
        workoutProgram: program,
      }).unwrap();
      setSuccess("Program created successfully");
    } catch (error: any) {
      if (!error.status) {
        setError("No Server Response");
      } else if (error.status === 400) {
        setError(error.data?.message);
      } else {
        setError(error.data?.message);
      }
    }
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
  const handleDeleteProgram = async (programId: string) => {
    try {
      await deleteWorkoutProgram({
        userId: user?.user_id,
        programId,
      }).unwrap();
      setSuccess("Program deleted successfully");
    } catch (error: any) {
      if (!error.status) {
        setError("No Server Response");
      } else if (error.status === 400) {
        setError(error.data?.message);
      } else {
        setError(error.data?.message);
      }
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
      <ErrorAlert error={error} setError={setError} />
      <SuccessAlert success={success} setSuccess={setSuccess} />
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
              <WorkoutProgramCreator
                onCreateProgram={handleCreateProgram}
                isLoading={isCreating}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
