import { ChevronDown, ChevronUp } from "lucide-react";

const handleWeightUnit = (weight_unit: string, rateChange: number) => {
  if (weight_unit === "lb" && Math.abs(rateChange) > 1) {
    return " lbs";
  } else if (weight_unit === "lb" && Math.abs(rateChange) <= 1) {
    return " lb";
  } else {
    return " kg";
  }
};

export default function handleRateChangeColor(
  rateChange: number,
  goal: string,
  weight_unit: string,
  children?: string,
  isDark?: boolean
) {
  if (goal === "lose" && rateChange < 0) {
    return (
      <span
        className={`${
          isDark ? "text-green-400" : "text-green-500"
        } flex items-center justify-center gap-1`}
      >
        <ChevronDown className="h-4 w-4" />
        {Math.abs(rateChange)}
        {handleWeightUnit(weight_unit, rateChange)}
        {children}
      </span>
    );
  } else if (goal === "lose" && rateChange > 0) {
    return (
      <span
        className={`${
          isDark ? "text-red-400" : "text-red-500"
        } flex items-center justify-center gap-1`}
      >
        <ChevronUp className="h-4 w-4" />
        {Math.abs(rateChange)}
        {handleWeightUnit(weight_unit, rateChange)}
        {children}
      </span>
    );
  } else if (goal === "gain" && rateChange < 0) {
    return (
      <span
        className={`${
          isDark ? "text-red-400" : "text-red-500"
        } flex items-center justify-center gap-1`}
      >
        <ChevronDown className="h-4 w-4" />
        {Math.abs(rateChange)}
        {handleWeightUnit(weight_unit, rateChange)}
        {children}
      </span>
    );
  } else if (goal === "gain" && rateChange > 0) {
    return (
      <span
        className={`${
          isDark ? "text-green-400" : "text-green-500"
        } flex items-center justify-center gap-1`}
      >
        <ChevronUp className="h-4 w-4" />
        {Math.abs(rateChange)}
        {handleWeightUnit(weight_unit, rateChange)}
        {children}
      </span>
    );
  } else {
    return (
      <span
        className={`${
          isDark ? "text-gray-400" : "text-gray-500"
        } flex items-center justify-center gap-1`}
      >
        {Math.abs(rateChange)}
        {handleWeightUnit(weight_unit, rateChange)}
        {children}
      </span>
    );
  }
}
