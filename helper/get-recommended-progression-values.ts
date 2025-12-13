import type { SetData } from "@/interfaces/workout-log-interfaces";
import { estimateOneRepMax } from "./get-progression-color";

export const getRecommendedProgressionValues = (
  setData: SetData,
  laterality?: "bilateral" | "unilateral"
): string => {
  if (setData.isLogged) return "";
  if (!setData.previousWeight || setData.previousWeight === 0) return "-";

  const previousWeight = setData.previousWeight || 0;
  const progressionFactor = 1.025; // 2.5% progression target

  // Handle bilateral exercises
  if (!laterality || laterality === "bilateral") {
    const previousReps =
      ((setData.previousLeftReps || 0) + (setData.previousRightReps || 0)) / 2;
    const prev1RM = estimateOneRepMax(previousWeight, previousReps);
    const target1RM = prev1RM * progressionFactor;

    // Calculate recommended reps when weight is set
    if (setData.weight > 0 && setData.reps === 0) {
      const minReps = 30 * (target1RM / setData.weight - 1);
      const recommendedReps = Math.ceil(minReps);

      if (recommendedReps > 0 && recommendedReps <= 100) {
        return String(recommendedReps);
      }

      if (recommendedReps <= 0) {
        return String(Math.ceil(previousReps) + 1);
      }
      return "-";
    }

    // Calculate recommended weight when reps is set
    if (setData.reps > 0 && setData.weight === 0) {
      const matchingWeight = target1RM / (1 + setData.reps / 30);
      // Round to nearest 2.5 increment
      const roundedWeight = Math.round(matchingWeight / 2.5) * 2.5;

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
    const target1RM = prev1RM * progressionFactor;

    // Calculate recommended reps when weight is set
    if (
      setData.weight > 0 &&
      (setData.leftReps === 0 || setData.rightReps === 0)
    ) {
      const minReps = 30 * (target1RM / setData.weight - 1);
      const recommendedReps = Math.ceil(minReps);

      if (recommendedReps > 0 && recommendedReps <= 100) {
        return String(recommendedReps);
      }

      if (recommendedReps <= 0) {
        return String(Math.ceil(weakerSideReps) + 1);
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

      const matchingWeight = target1RM / (1 + currentReps / 30);
      // Round to nearest 2.5 increment
      const roundedWeight = Math.round(matchingWeight / 2.5) * 2.5;

      if (roundedWeight > 0 && roundedWeight <= previousWeight * 3) {
        return String(roundedWeight);
      }

      return "-";
    }
  }

  return "-";
};
