import type { SetData } from "@/interfaces/workout-log-interfaces";
import { estimateOneRepMax } from "./get-progression-color";

export const getRecommendedProgressionBilateralValues = (
  setData: SetData
): string => {
  if (setData.isLogged) return "";
  if (!setData.previousWeight || setData.previousWeight === 0) return "-";

  const previousReps =
    ((setData.previousLeftReps || 0) + (setData.previousRightReps || 0)) / 2;
  const previousWeight = setData.previousWeight || 0;
  const prev1RM = estimateOneRepMax(previousWeight, previousReps);

  if (setData.weight > 0 && setData.reps === 0) {
    const minReps = 30 * (prev1RM / setData.weight - 1);
    const recommendedReps = Math.ceil(minReps);

    if (recommendedReps > 0 && recommendedReps <= 100) {
      return String(recommendedReps);
    }

    if (recommendedReps <= 0) {
      return String(Math.ceil(previousReps));
    }
    return "-";
  }

  if (setData.reps > 0 && setData.weight === 0) {
    const minWeight = prev1RM / (1 + setData.reps / 30);

    const roundedMinWeight = Math.ceil(minWeight / 2.5) * 2.5;

    let recommendedWeight = Math.max(roundedMinWeight, previousWeight);

    let new1RM = estimateOneRepMax(recommendedWeight, setData.reps);

    while (new1RM <= prev1RM && recommendedWeight <= previousWeight * 3) {
      recommendedWeight += 2.5;
      new1RM = estimateOneRepMax(recommendedWeight, setData.reps);
    }

    if (new1RM > prev1RM && recommendedWeight <= previousWeight * 3) {
      return String(recommendedWeight);
    }

    return "-";
  }

  return "-";
};
