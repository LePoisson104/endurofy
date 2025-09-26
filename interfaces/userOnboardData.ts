export type UserData = {
  // Legacy fields for backward compatibility with existing steps
  birthdate?: Date;
  weight?: number;
  weight_unit?: "lb" | "kg";
  goalWeight?: number;
  activityLevel?:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";

  // New fields matching FormData structure
  gender?: "male" | "female";
  birth_date?: string;
  height?: number;
  height_unit?: "ft" | "cm";
  current_weight?: number;
  current_weight_unit?: "lb" | "kg";
  starting_weight?: number;
  starting_weight_unit?: "lb" | "kg";
  weight_goal?: number;
  weight_goal_unit?: "lb" | "kg";
  activity_level?:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";
  goal?: "lose" | "gain" | "maintain";
  profile_status?: string;
};
