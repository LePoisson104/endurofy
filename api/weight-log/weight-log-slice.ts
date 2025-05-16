import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";

interface WeightLogState {
  weeklyRate: number;
}

const initialState: WeightLogState = {
  weeklyRate: 0,
};

const weightLogSlice = createSlice({
  name: "weightLog",
  initialState,
  reducers: {
    setWeeklyRate: (state, action: PayloadAction<number>) => {
      state.weeklyRate = action.payload;
    },
    resetWeeklyRate: (state) => {
      state.weeklyRate = initialState.weeklyRate;
    },
  },
});

export const { setWeeklyRate, resetWeeklyRate } = weightLogSlice.actions;
export const selectWeeklyRate = (state: RootState) =>
  state.weightLog.weeklyRate;
export default weightLogSlice.reducer;
