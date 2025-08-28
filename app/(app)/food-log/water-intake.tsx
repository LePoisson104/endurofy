import React, { useState, useEffect } from "react";
import { Droplets, Plus, Minus, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useCreateWaterLogMutation,
  useGetWaterLogQuery,
  useUpdateWaterLogMutation,
  useDeleteWaterLogMutation,
} from "@/api/water-log/waterlog-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { selectUserInfo } from "@/api/user/user-slice";

export default function WaterIntake({}) {
  const user = useSelector(selectCurrentUser);
  const userInfo = useSelector(selectUserInfo);
  const dailyGoal = Number(userInfo?.gender === "male" ? 3700 : 2100);

  const [waterIntake, setWaterIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState(250);

  const { data: waterLog, isLoading: isGettingWaterLog } = useGetWaterLogQuery(
    {
      userId: user?.user_id,
      date: new Date().toISOString().split("T")[0],
    },
    {
      skip: !user?.user_id,
    }
  );

  const [createWaterLog, { isLoading: isCreatingWaterLog }] =
    useCreateWaterLogMutation();
  const [updateWaterLog, { isLoading: isUpdatingWaterLog }] =
    useUpdateWaterLogMutation();
  const [deleteWaterLog, { isLoading: isDeletingWaterLog }] =
    useDeleteWaterLogMutation();

  useEffect(() => {
    if (waterLog && waterLog.amount !== null && waterLog.amount !== undefined) {
      const amount = Number(waterLog.amount);
      setWaterIntake(isNaN(amount) ? 0 : amount);
    }
  }, [waterLog]);

  const addWater = (amount: number) => {
    const safeWaterIntake = isNaN(waterIntake) ? 0 : waterIntake;
    const safeAmount = isNaN(amount) ? 0 : amount;
    const safeDailyGoal =
      isNaN(dailyGoal) || dailyGoal === 0 ? 2100 : dailyGoal;

    const newIntake = Math.min(
      safeWaterIntake + safeAmount,
      safeDailyGoal * 1.5
    );
    updateWaterIntake(newIntake);
  };

  const updateWaterIntake = async (newIntake: number) => {
    const safeIntake = isNaN(newIntake) ? 0 : Math.max(0, newIntake);
    setWaterIntake(safeIntake);

    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const waterPayload = { amount: safeIntake };

      if (waterLog) {
        // Update existing water log
        await updateWaterLog({
          waterLogId: waterLog.water_log_id,
          foodLogId: waterLog.food_log_id,
          waterPayload,
        }).unwrap();
      } else {
        // Create new water log
        await createWaterLog({
          userId: user?.user_id,
          date: currentDate,
          waterPayload,
        }).unwrap();
      }
    } catch (error) {
      console.error("Failed to update water intake:", error);
      // Optionally, you could revert the local state here or show an error message
    }
  };

  const removeWater = (amount: number) => {
    const safeWaterIntake = isNaN(waterIntake) ? 0 : waterIntake;
    const safeAmount = isNaN(amount) ? 0 : amount;

    const newIntake = Math.max(safeWaterIntake - safeAmount, 0);
    updateWaterIntake(newIntake);
  };

  const resetWater = () => {
    updateWaterIntake(0);
  };

  const isLoading =
    isCreatingWaterLog || isUpdatingWaterLog || isDeletingWaterLog;

  const getWaterPercentage = () => {
    const safeWaterIntake = isNaN(waterIntake) ? 0 : waterIntake;
    const safeDailyGoal =
      isNaN(dailyGoal) || dailyGoal === 0 ? 2100 : dailyGoal;

    const maxPercent = Math.min((safeWaterIntake / safeDailyGoal) * 100, 100);
    const actualPercent = (safeWaterIntake / safeDailyGoal) * 100;

    return {
      actualPercent: isNaN(actualPercent) ? 0 : actualPercent,
      maxPercent: isNaN(maxPercent) ? 0 : maxPercent,
    };
  };

  const getWaterCups = () => {
    const safeWaterIntake = isNaN(waterIntake) ? 0 : waterIntake;
    return Math.round(safeWaterIntake / 250);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="font-semibold">Water Intake</h3>
            <p className="text-sm text-gray-500">{getWaterCups()} cups today</p>
          </div>
        </div>
        <button
          onClick={resetWater}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset water intake"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Water Progress Circle */}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${
                2 * Math.PI * 50 * (1 - getWaterPercentage().maxPercent / 100)
              }`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">
              {isNaN(waterIntake) ? 0 : waterIntake}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              ml
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              of {dailyGoal}ml
            </span>
          </div>
        </div>
      </div>

      {/* Water Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Daily Goal</span>
          <span className="text-sm font-semibold">
            {Math.round(getWaterPercentage().actualPercent)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
            style={{
              width: `${getWaterPercentage().maxPercent}%`,
            }}
          />
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => addWater(250)}
            disabled={isLoading}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full disabled:opacity-50"
          >
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-400">+250ml</span>
            <span className="text-xs text-slate-500">1 cup</span>
          </Button>
          <Button
            onClick={() => addWater(500)}
            disabled={isLoading}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full disabled:opacity-50"
          >
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-400">+500ml</span>
            <span className="text-xs text-slate-500">2 cups</span>
          </Button>
          <Button
            onClick={() => addWater(750)}
            disabled={isLoading}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full disabled:opacity-50"
          >
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-400">+750ml</span>
            <span className="text-xs text-slate-500">3 cups</span>
          </Button>
        </div>

        {/* Custom Amount Controls */}
        <div className="flex items-center justify-between p-3 rounded-lg gap-3 bg-foreground/5 mt-5">
          <Button
            variant="outline"
            onClick={() => removeWater(customAmount)}
            className="flex items-center justify-center w-8 h-8 rounded-full"
            disabled={waterIntake === 0 || isLoading}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2 flex-1 justify-center">
            <Input
              type="number"
              max="2000"
              value={customAmount}
              onChange={(e) =>
                setCustomAmount(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-20 px-2 py-1 text-center text-sm"
              placeholder="250"
            />
            <span className="text-sm text-slate-500">ml</span>
          </div>
          <Button
            variant="outline"
            onClick={() => addWater(customAmount)}
            className="flex items-center justify-center w-8 h-8 rounded-full"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
