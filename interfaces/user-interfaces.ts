// share accross multiple files
export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_status: string;
}

export interface UserInfo extends UserMacrosGoals {
  email: string;
  first_name: string;
  last_name: string;
  profile_status: string;
  birth_date?: string;
  current_weight?: number;
  current_weight_unit?: string;
  starting_weight?: number;
  starting_weight_unit?: string;
  weight_goal?: number;
  weight_goal_unit?: string;
  height?: number;
  height_unit?: string;
  gender?: string;
  goal?: string;
  activity_level?: string;
  user_updated_at?: string;
  user_profile_updated_at?: string;
  bmi?: number;
  bmi_category?: string;
  bmi_category_color?: string;
  pending_email?: string;
  bmr?: number;
}

export interface UserMacrosGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  macros_goals_updated_at: string;
}

export interface UpdateUserInfo {
  gender: string;
  birth_date: string;
  height: number;
  height_unit: string;
  current_weight: number;
  current_weight_unit: string;
  starting_weight: number;
  starting_weight_unit: string;
  weight_goal: number;
  weight_goal_unit: string;
  goal: string;
  activity_level: string;
  profile_status: string;
}
