"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutProgramList from "./workout-program-list";
import { WorkoutProgramDetail } from "./workout-program-detail";
import { WorkoutProgramCreator } from "./workout-program-creator";
import PageTitle from "@/components/global/page-title";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import {
  useCreateWorkoutProgramMutation,
  useDeleteWorkoutProgramMutation,
} from "@/api/workout-program/workout-program-api-slice";
import type {
  WorkoutProgram,
  CreateWorkoutProgram,
} from "../../../interfaces/workout-program-interfaces";
import {
  selectWorkoutProgram,
  selectIsLoading,
} from "@/api/workout-program/workout-program-slice";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSetProgramAsActiveMutation } from "@/api/workout-program/workout-program-api-slice";

export default function MyPrograms() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get("tab") || "my-programs";
  const programIdParam = searchParams.get("programId");
  const user = useSelector(selectCurrentUser);

  const programs = useSelector(selectWorkoutProgram);
  const isWorkoutProgramLoading = useSelector(selectIsLoading);

  // Track if this is an initial load to prevent flickering
  const [initialLoad, setInitialLoad] = useState(true);

  const [createWorkoutProgram, { isLoading: isCreating }] =
    useCreateWorkoutProgramMutation();
  const [deleteWorkoutProgram, { isLoading: isDeleting }] =
    useDeleteWorkoutProgramMutation();
  const [setProgramAsActive] = useSetProgramAsActiveMutation();
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  useEffect(() => {
    const notActivePrograms = programs?.filter(
      (program) => program.isActive === 0
    );
    if (notActivePrograms?.length === programs?.length) {
      const manualProgramId = programs?.find(
        (program) => program.programType === "manual"
      )?.programId;
      if (manualProgramId) {
        setProgramAsActive({
          programId: manualProgramId,
          userId: user?.user_id,
        }).unwrap();
      }
    }
  }, [programs]);

  // Sync tab state with URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") || "my-programs";
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (programs) {
      if (searchQuery) {
        setWorkoutPrograms(
          programs.filter((program) =>
            program.programName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        );
      } else {
        setWorkoutPrograms(programs);
      }
    }
  }, [programs, searchQuery]);

  useEffect(() => {
    if (programs && selectedProgram) {
      const program = programs.find(
        (p) => p.programId === selectedProgram.programId
      );
      if (program) {
        setSelectedProgram(program);
      }
    }
  }, [selectedProgram, programs]);

  // Restore selected program from URL parameter on initial load
  useEffect(() => {
    if (programIdParam && workoutPrograms.length > 0) {
      const program = workoutPrograms.find(
        (p) => p.programId === programIdParam
      );
      if (program) {
        setSelectedProgram(program);
      }
    } else {
      setSelectedProgram(null);
    }
  }, [programIdParam, workoutPrograms]);

  // Set initial load to false once data is available
  useEffect(() => {
    if (
      (programs && programs.length > 0) ||
      (!isWorkoutProgramLoading && !initialLoad)
    ) {
      setInitialLoad(false);
    }
  }, [programs, isWorkoutProgramLoading, initialLoad]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    if (value === "create-program") {
      params.delete("programId");
    }
    router.replace(`/my-programs?${params.toString()}`);
  };

  // Handle creating a new workout program
  const handleCreateProgram = async (program: CreateWorkoutProgram) => {
    try {
      await createWorkoutProgram({
        userId: user?.user_id,
        workoutProgram: program,
      }).unwrap();
      toast.success("Program created successfully");
      // Switch back to My Programs tab
      handleTabChange("my-programs");
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else if (error.status === 400) {
        toast.error(error.data?.message);
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  // Handle deleting a workout program
  const handleDeleteProgram = async (programId: string) => {
    try {
      await deleteWorkoutProgram({
        userId: user?.user_id,
        programId,
      }).unwrap();
      setSelectedProgram(null);
      toast.success("Program deleted successfully");
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else if (error.status === 400) {
        toast.error(error.data?.message);
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  // Handle selecting a program
  const handleSelectProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
    const params = new URLSearchParams(searchParams.toString());
    params.set("programId", program.programId);
    router.replace(`/my-programs?${params.toString()}`);
  };

  // Handle going back to program list
  const handleBackToProgramList = () => {
    setSelectedProgram(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("programId");
    router.replace(`/my-programs?${params.toString()}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      <header className="mb-6">
        <PageTitle
          title="Workout Programs"
          showCurrentDateAndTime={false}
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
            <div className="w-full border-b mb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-programs">My Programs</TabsTrigger>
                <TabsTrigger value="create-program">Create Program</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="my-programs" className="space-y-6">
              {selectedProgram ? (
                <WorkoutProgramDetail
                  program={selectedProgram}
                  onBack={handleBackToProgramList}
                  onDelete={handleDeleteProgram}
                  isDeleting={isDeleting}
                />
              ) : (
                <>
                  <Input
                    placeholder="Search programs"
                    onChange={handleSearch}
                  />
                  <WorkoutProgramList
                    programs={workoutPrograms}
                    onSelectProgram={handleSelectProgram}
                    onDeleteProgram={handleDeleteProgram}
                    isLoading={isWorkoutProgramLoading}
                    isDeleting={isDeleting}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="create-program">
              <WorkoutProgramCreator
                onCreateProgram={handleCreateProgram}
                isLoading={isCreating}
                onSuccess={() => {}}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
