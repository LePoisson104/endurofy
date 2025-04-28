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
  action: string;
  sets: number;
  minReps: number;
  maxReps: number;
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
  workoutDays: WorkoutDay[];
}
