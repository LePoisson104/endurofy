import type { SetData } from "@/interfaces/workout-log-interfaces";
import { estimateOneRepMax } from "./get-progression-color";

export const getRecommendedProgressionValues = (
  setData: SetData,
  laterality?: "bilateral" | "unilateral"
): string => {
  if (setData.isLogged) return "";
  if (!setData.previousWeight || setData.previousWeight === 0) return "-";

  const previousWeight = setData.previousWeight || 0;

  // Handle bilateral exercises
  if (!laterality || laterality === "bilateral") {
    const previousReps =
      ((setData.previousLeftReps || 0) + (setData.previousRightReps || 0)) / 2;
    const prev1RM = estimateOneRepMax(previousWeight, previousReps);

    // Calculate recommended reps when weight is set
    if (setData.weight > 0 && setData.reps === 0) {
      // If using same weight (within 0.5 lbs tolerance), just add 1 rep
      if (Math.abs(setData.weight - previousWeight) < 0.5) {
        return String(Math.ceil(previousReps) + 1);
      }

      // Calculate reps needed to match previous 1RM
      const repsToMatch = 30 * (prev1RM / setData.weight - 1);

      // Add 1 rep to beat the previous 1RM
      const recommendedReps = Math.floor(repsToMatch) + 1;

      // Ensure we always recommend at least 1 more rep than previous if using similar weight
      const minRecommendedReps = Math.ceil(previousReps) + 1;

      if (recommendedReps > 0 && recommendedReps <= 100) {
        // If weight is very close to previous, ensure we beat previous reps
        if (
          setData.weight >= previousWeight * 0.95 &&
          recommendedReps <= previousReps
        ) {
          return String(minRecommendedReps);
        }
        return String(recommendedReps);
      }

      // If calculation gives invalid result, default to previous reps + 1
      if (recommendedReps <= 0) {
        return String(minRecommendedReps);
      }

      return "-";
    }

    // Calculate recommended weight when reps is set
    if (setData.reps > 0 && setData.weight === 0) {
      // Calculate weight needed to match previous 1RM
      const weightToMatch = prev1RM / (1 + setData.reps / 30);
      // Add small increment (2.5 lbs) to beat it
      const targetWeight = weightToMatch + 2.5;
      // Round to nearest 2.5 increment
      const roundedWeight = Math.round(targetWeight / 2.5) * 2.5;

      if (roundedWeight > 0 && roundedWeight <= previousWeight * 3) {
        return String(roundedWeight);
      }

      return "-";
    }
  }

  // Handle unilateral exercises
  if (laterality === "unilateral") {
    // Use the weaker side (lower reps) as the baseline for progression
    const previousLeftReps = setData.previousLeftReps || 0;
    const previousRightReps = setData.previousRightReps || 0;
    const weakerSideReps = Math.min(previousLeftReps, previousRightReps);

    const prev1RM = estimateOneRepMax(previousWeight, weakerSideReps);

    // Calculate recommended reps when weight is set
    if (
      setData.weight > 0 &&
      (setData.leftReps === 0 || setData.rightReps === 0)
    ) {
      // If using same weight (within 0.5 lbs tolerance), just add 1 rep
      if (Math.abs(setData.weight - previousWeight) < 0.5) {
        return String(Math.ceil(weakerSideReps) + 1);
      }

      // Calculate reps needed to match previous 1RM
      const repsToMatch = 30 * (prev1RM / setData.weight - 1);

      // Add 1 rep to beat the previous 1RM
      const recommendedReps = Math.floor(repsToMatch) + 1;

      // Ensure we always recommend at least 1 more rep than previous if using similar weight
      const minRecommendedReps = Math.ceil(weakerSideReps) + 1;

      if (recommendedReps > 0 && recommendedReps <= 100) {
        // If weight is very close to previous, ensure we beat previous reps
        if (
          setData.weight >= previousWeight * 0.95 &&
          recommendedReps <= weakerSideReps
        ) {
          return String(minRecommendedReps);
        }
        return String(recommendedReps);
      }

      // If calculation gives invalid result, default to previous reps + 1
      if (recommendedReps <= 0) {
        return String(minRecommendedReps);
      }

      return "-";
    }

    // Calculate recommended weight when reps are set
    if (
      (setData.leftReps > 0 || setData.rightReps > 0) &&
      setData.weight === 0
    ) {
      // Use the reps that were entered
      const currentReps =
        setData.leftReps > 0 && setData.rightReps > 0
          ? Math.min(setData.leftReps, setData.rightReps)
          : setData.leftReps > 0
          ? setData.leftReps
          : setData.rightReps;

      // Calculate weight needed to match previous 1RM
      const weightToMatch = prev1RM / (1 + currentReps / 30);
      // Add small increment (2.5 lbs) to beat it
      const targetWeight = weightToMatch + 2.5;
      // Round to nearest 2.5 increment
      const roundedWeight = Math.round(targetWeight / 2.5) * 2.5;

      if (roundedWeight > 0 && roundedWeight <= previousWeight * 3) {
        return String(roundedWeight);
      }

      return "-";
    }
  }

  return "-";
};
