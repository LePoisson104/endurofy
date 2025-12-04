import { type LucideIcon } from "lucide-react";

export interface StatData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "null";
  icon: LucideIcon;
}
