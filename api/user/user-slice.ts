import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";

interface UserWeightGoalState {
  starting_weight: number;
  starting_weight_unit: string;
  current_weight: number;
  current_weight_unit: string;
  weight_goal: number;
  weight_goal_unit: string;
  goal: string;
  bmi: number;
  bmi_category: string;
  bmi_category_color: string;
}

const initialState: UserWeightGoalState = {
  starting_weight: 0,
  starting_weight_unit: "",
  current_weight: 0,
  current_weight_unit: "",
  weight_goal: 0,
  weight_goal_unit: "",
  goal: "",
  bmi: 0,
  bmi_category: "",
  bmi_category_color: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setWeightStates: (
      state,
      action: PayloadAction<{
        starting_weight: number;
        starting_weight_unit: string;
        current_weight: number;
        current_weight_unit: string;
        weight_goal: number;
        weight_goal_unit: string;
        goal: string;
        bmi: number;
        bmi_category: string;
        bmi_category_color: string;
      }>
    ) => {
      state.starting_weight = action.payload.starting_weight;
      state.starting_weight_unit = action.payload.starting_weight_unit;
      state.current_weight = action.payload.current_weight;
      state.current_weight_unit = action.payload.current_weight_unit;
      state.weight_goal = action.payload.weight_goal;
      state.weight_goal_unit = action.payload.weight_goal_unit;
      state.goal = action.payload.goal;
      state.bmi = action.payload.bmi;
      state.bmi_category = action.payload.bmi_category;
      state.bmi_category_color = action.payload.bmi_category_color;
    },
  },
});

export const { setWeightStates } = userSlice.actions;
export const selectWeightStates = (state: RootState) => state.user;
export default userSlice.reducer;
