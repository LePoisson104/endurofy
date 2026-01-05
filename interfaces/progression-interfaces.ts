import { type LucideIcon } from "lucide-react";

export type StatData = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "null";
  icon: LucideIcon;
};

export type SetData = {
  isLogged: boolean;
  weight: number;
  leftReps: number;
  rightReps: number;
  reps: number;
  previousWeight: number | null;
  previousLeftReps: number | null;
  previousRightReps: number | null;
};
