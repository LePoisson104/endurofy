import type { WorkoutProgram } from "./workout-program-interfaces";

export interface SetData {
  weight: number;
  weightUnit: string;
  leftReps: number;
  rightReps: number;
  reps: number;
  isLogged: boolean;
}

export interface WorkoutLogFormProps {
  program: WorkoutProgram;
  selectedDate: Date;
  onSaveLog: (log: any) => void;
  workoutLogs?: any[];
}

export interface WorkoutLogPayload extends ExercisePayload {
  workoutName: string;
  workoutDate: string;
}

export interface ExercisePayload {
  exerciseNotes: string;
  exerciseName: string;
  bodyPart: string;
  laterality: string;
  setNumber: number;
  repsLeft: number;
  repsRight: number;
  weight: number;
  weightUnit: "kg" | "lb";
  programExerciseId: string;
  exerciseOrder: number;
}
