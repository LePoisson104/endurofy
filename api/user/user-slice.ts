import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";

interface UserWeightGoalState {
  weight: number;
  weight_goal: number;
  weight_goal_unit: string;
  weight_unit: string;
  goal: string;
}

const initialState: UserWeightGoalState = {
  weight: 0,
  weight_goal: 0,
  weight_goal_unit: "",
  weight_unit: "",
  goal: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setWeightStates: (
      state,
      action: PayloadAction<{
        weight: number;
        weight_goal: number;
        weight_goal_unit: string;
        weight_unit: string;
        goal: string;
      }>
    ) => {
      state.weight = action.payload.weight;
      state.weight_goal = action.payload.weight_goal;
      state.weight_goal_unit = action.payload.weight_goal_unit;
      state.weight_unit = action.payload.weight_unit;
      state.goal = action.payload.goal;
    },
  },
});

export const { setWeightStates } = userSlice.actions;
export const selectWeightStates = (state: RootState) => state.user;
export default userSlice.reducer;
