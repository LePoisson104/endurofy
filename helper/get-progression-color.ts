interface SetData {
  isLogged: boolean;
  weight: number;
  leftReps: number;
  rightReps: number;
  reps: number;
  previousWeight: number | null;
  previousLeftReps: number | null;
  previousRightReps: number | null;
}

const estimateOneRepMax = (weight: number, reps: number): number => {
  return Number((weight * (1 + reps / 30)).toFixed(2));
};

export const getProgressionColor = (
  setData: SetData,
  isDark: boolean
): string => {
  if (!setData.isLogged) {
    return "";
  }

  const previousReps =
    ((setData.previousLeftReps || 0) + (setData.previousRightReps || 0)) / 2;
  const prev1RM = estimateOneRepMax(setData.previousWeight || 0, previousReps);
  const current1RM = estimateOneRepMax(setData.weight, setData.reps);
  if (current1RM > prev1RM) {
    return isDark
      ? "border-green-400 text-green-400 bg-green-900"
      : "border-green-500 text-green-900 bg-green-100";
  } else if (current1RM < prev1RM) {
    return isDark
      ? "border-red-400 text-red-400 bg-red-900"
      : "border-red-500 text-red-900 bg-red-100";
  } else {
    return isDark
      ? "border-blue-400 text-blue-400 bg-blue-900"
      : "border-blue-600 text-blue-900 bg-blue-100";
  }
};

export const getProgressionTextColor = (setData: SetData, isDark: boolean) => {
  if (!setData.isLogged) {
    return "";
  }

  const previousReps =
    ((setData.previousLeftReps || 0) + (setData.previousRightReps || 0)) / 2;
  const prev1RM = estimateOneRepMax(setData.previousWeight || 0, previousReps);
  const current1RM = estimateOneRepMax(setData.weight, setData.reps);

  if (current1RM > prev1RM) {
    return isDark ? "text-green-400" : "text-green-500";
  } else if (current1RM < prev1RM) {
    return isDark ? "text-red-400" : "text-red-500";
  } else {
    return isDark ? "text-blue-400" : "text-blue-500";
  }
};
