import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";
import { UserInfo } from "@/interfaces/user-interfaces";

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
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfo>) => {
      state.email = action.payload.email;
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
      state.profile_status = action.payload.profile_status;
      state.birth_date = action.payload.birth_date;
      state.current_weight = action.payload.current_weight;
      state.current_weight_unit = action.payload.current_weight_unit;
      state.starting_weight = action.payload.starting_weight;
      state.starting_weight_unit = action.payload.starting_weight_unit;
      state.weight_goal = action.payload.weight_goal;
      state.weight_goal_unit = action.payload.weight_goal_unit;
      state.height = action.payload.height;
      state.height_unit = action.payload.height_unit;
      state.gender = action.payload.gender;
      state.goal = action.payload.goal;
      state.activity_level = action.payload.activity_level;
      state.user_updated_at = action.payload.user_updated_at;
      state.user_profile_updated_at = action.payload.user_profile_updated_at;
      state.bmi = action.payload.bmi;
      state.bmi_category = action.payload.bmi_category;
      state.bmi_category_color = action.payload.bmi_category_color;
      state.pending_email = action.payload.pending_email;
    },
    resetUserInfo: (state) => {
      state.email = "";
      state.first_name = "";
      state.last_name = "";
      state.profile_status = "";
      state.birth_date = "";
      state.current_weight = 0;
      state.current_weight_unit = "";
      state.starting_weight = 0;
      state.starting_weight_unit = "";
      state.weight_goal = 0;
      state.weight_goal_unit = "";
      state.height = 0;
      state.height_unit = "";
      state.gender = "";
      state.goal = "";
      state.activity_level = "";
      state.user_updated_at = "";
      state.user_profile_updated_at = "";
      state.bmi = 0;
      state.bmi_category = "";
      state.bmi_category_color = "";
      state.pending_email = "";
    },
  },
});

export const { setUserInfo, resetUserInfo } = userSlice.actions;
export const selectUserInfo = (state: RootState) => state.user;

export default userSlice.reducer;
