import type { SetData } from "@/interfaces/workout-log-interfaces";
import { estimateOneRepMax } from "./get-progression-color";

export const getRecommendedProgressionValues = (
  setData: SetData,
  laterality?: "bilateral" | "unilateral"
): string => {
  if (setData.isLogged) return "";
  if (!setData.previousWeight || setData.previousWeight === 0) return "-";

  const previousWeight = setData.previousWeight || 0;

  if (!laterality || laterality === "bilateral") {
    const previousReps =
      ((setData.previousLeftReps || 0) + (setData.previousRightReps || 0)) / 2;
    const prev1RM = estimateOneRepMax(previousWeight, previousReps);

    if (setData.weight > 0 && setData.reps === 0) {
      // If weight is the same or very close (within 2.5 lbs), just add 1 rep
      if (Math.abs(setData.weight - previousWeight) <= 2.5) {
        return String(Math.ceil(previousReps) + 1);
      }

      // Calculate reps needed to match previous 1RM
      const repsToMatch = 30 * (prev1RM / setData.weight - 1);

      // Beat the previous by 1 rep
      const recommendedReps = Math.floor(repsToMatch) + 1;

      // Ensure we get a valid number
      if (recommendedReps > 0 && recommendedReps <= 100) {
        return String(recommendedReps);
      }

      return "-";
    }

    // Calculate recommended weight when reps is set
    if (setData.reps > 0 && setData.weight === 0) {
      // If reps are the same or within 1, add 2.5 lbs
      if (Math.abs(setData.reps - previousReps) <= 1) {
        const recommendedWeight = previousWeight + 2.5;
        const roundedWeight = Math.round(recommendedWeight / 2.5) * 2.5;
        return String(roundedWeight);
      }

      // Calculate weight needed to match previous 1RM
      const weightToMatch = prev1RM / (1 + setData.reps / 30);

      // Beat the previous by 2.5 lbs
      const recommendedWeight = weightToMatch + 2.5;
      const roundedWeight = Math.round(recommendedWeight / 2.5) * 2.5;

      if (roundedWeight > 0 && roundedWeight <= previousWeight * 2) {
        return String(roundedWeight);
      }

      return "-";
    }
  }

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
      // If weight is the same or very close (within 2.5 lbs), just add 1 rep
      if (Math.abs(setData.weight - previousWeight) <= 2.5) {
        return String(Math.ceil(weakerSideReps) + 1);
      }

      // Calculate reps needed to match previous 1RM
      const repsToMatch = 30 * (prev1RM / setData.weight - 1);

      // Beat the previous by 1 rep
      const recommendedReps = Math.floor(repsToMatch) + 1;

      // Ensure we get a valid number
      if (recommendedReps > 0 && recommendedReps <= 100) {
        return String(recommendedReps);
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

      // If reps are the same or within 1, add 2.5 lbs
      if (Math.abs(currentReps - weakerSideReps) <= 1) {
        const recommendedWeight = previousWeight + 2.5;
        const roundedWeight = Math.round(recommendedWeight / 2.5) * 2.5;
        return String(roundedWeight);
      }

      // Calculate weight needed to match previous 1RM
      const weightToMatch = prev1RM / (1 + currentReps / 30);

      // Beat the previous by 2.5 lbs
      const recommendedWeight = weightToMatch + 2.5;
      const roundedWeight = Math.round(recommendedWeight / 2.5) * 2.5;

      if (roundedWeight > 0 && roundedWeight <= previousWeight * 2) {
        return String(roundedWeight);
      }

      return "-";
    }
  }

  return "-";
};
