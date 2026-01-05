export type SetData = {
  workoutLogId: string | null;
  weight: number;
  weightUnit: string;
  leftReps: number;
  rightReps: number;
  reps: number;
  isLogged: boolean;
  workoutSetId: string | null;
  workoutExerciseId: string | null;
  setNumber: number;
  previousLeftReps: number | null;
  previousRightReps: number | null;
  previousWeight: number | null;
};

export interface WorkoutLogPayload extends ExercisePayload {
  workoutName: string;
  workoutDate: string;
}

export interface ExercisePayload {
  exerciseNotes: string;
  exerciseName: string;
  bodyPart: string;
  laterality: "bilateral" | "unilateral";
  setNumber: number;
  repsLeft: number;
  repsRight: number;
  weight: number;
  weightUnit: "kg" | "lb";
  programExerciseId?: string;
  workoutExerciseId?: string;
  exerciseOrder: number;
}

export type WorkoutLog = {
  userId: string;
  workoutLogId: string;
  programId: string;
  dayId: string;
  workoutDate: string;
  title: string;
  status: string;
  timer: number;
  workoutExercises: WorkoutExercise[];
};

export type WorkoutExercise = {
  workoutExerciseId: string;
  programExerciseId: string;
  workoutLogId: string;
  exerciseOrder: number;
  exerciseName: string;
  bodyPart: string;
  laterality: string;
  notes: string;
  workoutSets: WorkoutSet[];
};

export type WorkoutSet = {
  workoutSetId: string;
  workoutExerciseId: string;
  setNumber: number;
  repsLeft: number;
  repsRight: number;
  weight: number;
  weightUnit: string;
  previousLeftReps: number | null;
  previousRightReps: number | null;
  previousWeight: number | null;
  previousWeightUnit: string | null;
};

export type WorkoutLogPagination = {
  hasMoreData: boolean;
  limit: number;
  offset: number;
  nextOffset: number;
  workoutLogsData: WorkoutLog[];
};

export type WorkoutLogResponse = {
  data: WorkoutLog[];
};
