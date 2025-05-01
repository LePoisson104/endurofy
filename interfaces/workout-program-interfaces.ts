export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Exercise {
  exerciseId: string;
  exerciseName: string;
  bodyPart: string;
  laterality: "bilateral" | "unilateral";
  sets: number;
  minReps: number;
  maxReps: number;
  exerciseOrder: number;
}

export interface WorkoutDay {
  dayId: string;
  dayName: string;
  dayNumber: number;
  exercises: Exercise[];
}

export interface WorkoutProgram {
  programId: string;
  programName: string;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  workoutDays: WorkoutDay[];
}

export interface CreateWorkoutProgram {
  programName: string;
  description?: string;
  workoutDays: CreateWorkoutDay[];
}

export interface CreateWorkoutDay {
  dayName: string;
  dayNumber: number;
  exercises: CreateExercise[];
}

export interface CreateExercise {
  exerciseName: string;
  bodyPart: string;
  laterality: "bilateral" | "unilateral";
  sets: number;
  minReps: number;
  maxReps: number;
  exerciseOrder: number;
}
