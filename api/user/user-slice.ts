import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";
import type { UserInfo } from "@/interfaces/user-interfaces";
import type { UserMacrosGoals } from "@/interfaces/user-interfaces";

const initialState: UserInfo = {
  email: "",
  first_name: "",
  last_name: "",
  profile_status: "",
  birth_date: "",
  current_weight: 0,
  current_weight_unit: "",
  starting_weight: 0,
  starting_weight_unit: "",
  weight_goal: 0,
  weight_goal_unit: "",
  height: 0,
  height_unit: "",
  gender: "",
  goal: "",
  activity_level: "",
  user_updated_at: "",
  user_profile_updated_at: "",
  bmi: 0,
  bmi_category: "",
  bmi_category_color: "",
  pending_email: "",
  bmr: 0,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  macros_goals_updated_at: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      Object.assign(state, action.payload);
    },
    setUserMacrosGoals: (state, action: PayloadAction<UserMacrosGoals>) => {
      Object.assign(state, action.payload);
    },
    resetUserInfo: (state) => {
      Object.assign(state, initialState);
    },
    calculateAndSetBMR: (state) => {
      if (
        !state.birth_date ||
        !state.gender ||
        !state.current_weight ||
        !state.height
      )
        return;

      const today = new Date();
      const birthDateObj = new Date(state.birth_date);

      const age = today.getFullYear() - birthDateObj.getFullYear();

      // Convert weight to kg if in lbs
      const weightKg =
        state.current_weight_unit === "lb"
          ? state.current_weight * 0.453592
          : state.current_weight;

      // Convert height to cm if in ft
      const heightCm =
        state.height_unit === "ft" ? state.height * 2.54 : state.height;

      const genderFactor = state.gender === "male" ? 5 : -161;
      const BMR = Math.round(
        10 * weightKg + 6.25 * heightCm - 5 * age + genderFactor
      );

      state.bmr = BMR;
    },
  },
});

export const {
  setUserInfo,
  setUserMacrosGoals,
  resetUserInfo,
  calculateAndSetBMR,
} = userSlice.actions;
export const selectUserInfo = (state: RootState) => state.user;

export default userSlice.reducer;
