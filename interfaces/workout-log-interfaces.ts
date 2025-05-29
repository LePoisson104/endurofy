import type { WorkoutProgram } from "./workout-program-interfaces";

export interface SetData {
  weight: string;
  reps: string;
  leftReps: string;
  rightReps: string;
  isLogged: boolean;
}

export interface WorkoutLogFormProps {
  program: WorkoutProgram;
  selectedDate: Date;
  onSaveLog: (log: any) => void;
  workoutLogs?: any[];
}
