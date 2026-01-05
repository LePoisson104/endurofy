import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";
import { RootState } from "@/lib/store";

interface WorkoutProgramState {
  workoutProgram: WorkoutProgram[] | null;
  isLoading: boolean;
}

const initialState: WorkoutProgramState = {
  workoutProgram: null,
  isLoading: true,
};

const workoutProgramSlice = createSlice({
  name: "workoutProgram",
  initialState,
  reducers: {
    setWorkoutProgram: (
      state,
      action: PayloadAction<WorkoutProgram[] | null>
    ) => {
      state.workoutProgram = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetWorkoutProgram: (state) => {
      state.workoutProgram = initialState.workoutProgram;
      state.isLoading = initialState.isLoading;
    },
  },
});

export const { setWorkoutProgram, setIsLoading, resetWorkoutProgram } =
  workoutProgramSlice.actions;
export const selectWorkoutProgram = (state: RootState) =>
  state.workoutProgram.workoutProgram;
export const selectIsLoading = (state: RootState) =>
  state.workoutProgram.isLoading;
export default workoutProgramSlice.reducer;
