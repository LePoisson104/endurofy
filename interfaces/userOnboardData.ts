export type UserData = {
  birthdate?: Date;
  gender?: "male" | "female";
  height?: number;
  height_unit?: "ft" | "cm";
  weight?: number;
  weight_unit?: "lb" | "kg";
  goal?: "lose_weight" | "gain_weight" | "maintain_weight" | "build_muscle";
  goalWeight?: number;
  activityLevel?:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";
};
