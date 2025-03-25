"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutProgramList from "./workout-program-list";
import { WorkoutProgramCreator } from "./workout-program-creator";
import { WorkoutProgramDetail } from "./workout-program-detail";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  minReps: number;
  maxReps: number;
  notes?: string;
}

export interface WorkoutDay {
  day: DayOfWeek;
  exercises: Exercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO date string
  days: WorkoutDay[];
}

// Sample workout programs
const initialWorkoutPrograms: WorkoutProgram[] = [
  {
    id: "1",
    name: "Beginner Strength Program",
    description: "A simple 3-day full body program for beginners",
    createdAt: "2023-04-10T12:00:00Z",
    days: [
      {
        day: "monday",
        exercises: [
          { id: "e1", name: "Squat", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e2", name: "Bench Press", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e3", name: "Bent Over Row", sets: 3, minReps: 8, maxReps: 12 },
        ],
      },
      {
        day: "wednesday",
        exercises: [
          { id: "e4", name: "Deadlift", sets: 3, minReps: 6, maxReps: 10 },
          {
            id: "e5",
            name: "Overhead Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          { id: "e6", name: "Pull-ups", sets: 3, minReps: 5, maxReps: 10 },
        ],
      },
      {
        day: "friday",
        exercises: [
          { id: "e7", name: "Squat", sets: 3, minReps: 8, maxReps: 12 },
          {
            id: "e8",
            name: "Incline Bench Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          { id: "e9", name: "Barbell Row", sets: 3, minReps: 8, maxReps: 12 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Push Pull Legs",
    description: "Classic 6-day PPL split for intermediate lifters",
    createdAt: "2023-05-15T14:30:00Z",
    days: [
      {
        day: "monday",
        exercises: [
          { id: "e10", name: "Bench Press", sets: 4, minReps: 6, maxReps: 10 },
          {
            id: "e11",
            name: "Overhead Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          {
            id: "e12",
            name: "Incline Dumbbell Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          {
            id: "e13",
            name: "Tricep Pushdowns",
            sets: 3,
            minReps: 10,
            maxReps: 15,
          },
        ],
      },
      {
        day: "tuesday",
        exercises: [
          { id: "e14", name: "Deadlift", sets: 3, minReps: 5, maxReps: 8 },
          { id: "e15", name: "Pull-ups", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e16", name: "Barbell Row", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e17", name: "Bicep Curls", sets: 3, minReps: 10, maxReps: 15 },
        ],
      },
      {
        day: "wednesday",
        exercises: [
          { id: "e18", name: "Squat", sets: 4, minReps: 6, maxReps: 10 },
          {
            id: "e19",
            name: "Romanian Deadlift",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          { id: "e20", name: "Leg Press", sets: 3, minReps: 10, maxReps: 15 },
          { id: "e21", name: "Calf Raises", sets: 4, minReps: 12, maxReps: 20 },
        ],
      },
      {
        day: "thursday",
        exercises: [
          {
            id: "e22",
            name: "Incline Bench Press",
            sets: 4,
            minReps: 6,
            maxReps: 10,
          },
          {
            id: "e23",
            name: "Dumbbell Shoulder Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          { id: "e24", name: "Cable Flyes", sets: 3, minReps: 10, maxReps: 15 },
          {
            id: "e25",
            name: "Skull Crushers",
            sets: 3,
            minReps: 10,
            maxReps: 15,
          },
        ],
      },
      {
        day: "friday",
        exercises: [
          { id: "e26", name: "Barbell Row", sets: 4, minReps: 6, maxReps: 10 },
          { id: "e27", name: "Lat Pulldown", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e28", name: "Face Pulls", sets: 3, minReps: 12, maxReps: 15 },
          {
            id: "e29",
            name: "Hammer Curls",
            sets: 3,
            minReps: 10,
            maxReps: 15,
          },
        ],
      },
      {
        day: "saturday",
        exercises: [
          { id: "e30", name: "Front Squat", sets: 4, minReps: 6, maxReps: 10 },
          { id: "e31", name: "Lunges", sets: 3, minReps: 8, maxReps: 12 },
          {
            id: "e32",
            name: "Leg Extensions",
            sets: 3,
            minReps: 10,
            maxReps: 15,
          },
          {
            id: "e33",
            name: "Seated Calf Raises",
            sets: 4,
            minReps: 12,
            maxReps: 20,
          },
        ],
      },
    ],
  },
];

export default function MyPrograms() {
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>(
    initialWorkoutPrograms
  );
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>("my-programs");

  // Handle creating a new workout program
  const handleCreateProgram = (
    program: Omit<WorkoutProgram, "id" | "createdAt">
  ) => {
    const newProgram: WorkoutProgram = {
      ...program,
      id: Math.random().toString(36).substring(2, 9),
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
        program.id === updatedProgram.id ? updatedProgram : program
      )
    );
    setSelectedProgram(updatedProgram);
  };

  // Handle deleting a workout program
  const handleDeleteProgram = (programId: string) => {
    setWorkoutPrograms(
      workoutPrograms.filter((program) => program.id !== programId)
    );
    if (selectedProgram?.id === programId) {
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
        <div className="text-2xl font-bold">Workout Programs</div>
        <p className="text-sm text-muted-foreground">
          Create personalize workout plans and progress tracking
        </p>
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
