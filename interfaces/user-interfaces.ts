// share accross multiple files
export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserInfo {
  data: {
    BMR: number;
    activity_level: number;
    birth_date: string;
    email: string;
    first_name: string;
    gender: string;
    goal: string;
    height: number;
    height_unit: string;
    last_name: string;
    profile_status: string;
    user_profile_updated_at: string;
    user_updated_at: string;
    weight: number;
    weight_goal: number;
    weight_goal_unit: string;
    weight_unit: string;
  };
}
