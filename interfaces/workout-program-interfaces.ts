export type AllDays =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D5"
  | "D6"
  | "D7"
  | "D8"
  | "D9"
  | "D10";

export type Exercise = {
  exerciseId: string;
  exerciseName: string;
  notes?: string;
  previousNotes?: string;
  bodyPart: string;
  laterality: "bilateral" | "unilateral";
  sets: number;
  minReps: number;
  maxReps: number;
  exerciseOrder: number;
};

export type WorkoutDay = {
  dayId: string;
  dayName: string;
  dayNumber: number;
  exercises: Exercise[];
};

export type WorkoutProgram = {
  programId: string;
  programName: string;
  description?: string;
  programType: "dayOfWeek" | "custom" | "manual";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isActive: number;
  startingDate: string; // ISO date string
  workoutDays: WorkoutDay[];
};

export type CreateWorkoutProgram = {
  programName: string;
  description?: string;
  programType: "dayOfWeek" | "custom" | "manual";
  startingDate?: string; // ISO date string
  workoutDays: CreateWorkoutDay[];
};

export type CreateWorkoutDay = {
  dayName: string;
  dayNumber: number;
  exercises: CreateExercise[];
};

export type CreateExercise = {
  exerciseName: string;
  bodyPart: string;
  laterality: "bilateral" | "unilateral";
  sets: number;
  minReps: number;
  maxReps: number;
  exerciseOrder: number;
};
