import type { SetData } from "@/interfaces/workout-log-interfaces";
import { estimateOneRepMax } from "./get-progression-color";

export const getRecommendedProgressionValues = (setData: SetData): string => {
  // Return empty if already logged or no previous data
  if (setData.isLogged) return "";
  if (!setData.previousWeight || setData.previousWeight === 0) return "-";

  const previousReps =
    ((setData.previousLeftReps || 0) + (setData.previousRightReps || 0)) / 2;
  const previousWeight = setData.previousWeight || 0;
  const prev1RM = estimateOneRepMax(previousWeight, previousReps);

  // Case 1: User entered weight first, recommend reps to beat previous 1RM
  if (setData.weight > 0 && setData.reps === 0) {
    // Solve: newWeight * (1 + newReps/30) > prev1RM
    // Rearrange: newReps > 30 * (prev1RM/newWeight - 1)
    const minReps = 30 * (prev1RM / setData.weight - 1);
    const recommendedReps = Math.ceil(minReps);

    // Only recommend if it's a valid positive number
    if (recommendedReps > 0 && recommendedReps <= 100) {
      return String(recommendedReps);
    }
    // If the entered weight is too heavy, suggest maintaining reps
    if (recommendedReps <= 0) {
      return String(Math.ceil(previousReps));
    }
    return "-";
  }

  // Case 2: User entered reps first, recommend weight to beat previous 1RM
  if (setData.reps > 0 && setData.weight === 0) {
    // Solve: newWeight * (1 + newReps/30) > prev1RM
    // Rearrange: newWeight > prev1RM / (1 + newReps/30)
    const minWeight = prev1RM / (1 + setData.reps / 30);

    // Round up to the nearest 2.5 increment (common plate increment)
    const roundedMinWeight = Math.ceil(minWeight / 2.5) * 2.5;

    // Start from the higher of: calculated minimum or previous weight
    let recommendedWeight = Math.max(roundedMinWeight, previousWeight);

    // Verify that this weight actually beats the previous 1RM
    let new1RM = estimateOneRepMax(recommendedWeight, setData.reps);

    // If it doesn't beat, increment in 2.5 increments until it does
    while (new1RM <= prev1RM && recommendedWeight <= previousWeight * 3) {
      recommendedWeight += 2.5;
      new1RM = estimateOneRepMax(recommendedWeight, setData.reps);
    }

    // Return the recommendation if it's reasonable
    if (new1RM > prev1RM && recommendedWeight <= previousWeight * 3) {
      return String(recommendedWeight);
    }

    return "-";
  }

  // Case 3: Both weight and reps are entered - no recommendation needed
  // Case 4: Neither is entered - no recommendation
  return "-";
};
