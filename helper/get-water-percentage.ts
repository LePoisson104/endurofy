export const getWaterPercentage = ({
  waterIntake,
  dailyGoal,
}: {
  waterIntake: number;
  dailyGoal: number;
}) => {
  const safeWaterIntake = isNaN(waterIntake) ? 0 : waterIntake;
  const safeDailyGoal = isNaN(dailyGoal) || dailyGoal === 0 ? 2100 : dailyGoal;

  const maxPercent = Math.min((safeWaterIntake / safeDailyGoal) * 100, 100);
  const actualPercent = (safeWaterIntake / safeDailyGoal) * 100;

  return {
    actualPercent: isNaN(actualPercent) ? 0 : actualPercent,
    maxPercent: isNaN(maxPercent) ? 0 : maxPercent,
  };
};
