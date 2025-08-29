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
import { toast } from "sonner";

export default function WaterIntake({
  selectedDate,
}: {
  selectedDate: string;
}) {
  const user = useSelector(selectCurrentUser);
  const userInfo = useSelector(selectUserInfo);
  const dailyGoal = Number(userInfo?.gender === "male" ? 3700 : 2100);

  const [waterIntake, setWaterIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState(250);

  const { data: waterLog, isLoading: isGettingWaterLog } = useGetWaterLogQuery(
    {
      userId: user?.user_id,
      date: selectedDate,
    },
    {
      skip: !user?.user_id,
    }
  );

  const [createWaterLog] = useCreateWaterLogMutation();
  const [updateWaterLog] = useUpdateWaterLogMutation();
  const [deleteWaterLog] = useDeleteWaterLogMutation();

  useEffect(() => {
    if (waterLog?.data?.waterLog.length > 0) {
      setWaterIntake(Number(waterLog.data.waterLog[0]?.amount));
    } else {
      setWaterIntake(0);
    }
  }, [waterLog]);

  const addWater = async (amount: number) => {
    try {
      if (waterIntake === 0 && waterLog?.data?.waterLog.length === 0) {
        await createWaterLog({
          userId: user?.user_id,
          date: selectedDate,
          waterPayload: { amount: amount, unit: "ml" },
        }).unwrap();
      } else {
        await updateWaterLog({
          waterLogId: waterLog.data.waterLog[0]?.water_log_id,
          foodLogId: waterLog.data.waterLog[0]?.food_log_id,
          waterPayload: {
            amount: amount + waterIntake < 0 ? 0 : amount + waterIntake,
          },
        }).unwrap();
      }
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Error adding water");
      }
    }
  };
  console.log(waterLog);
  const resetWater = async () => {
    try {
      await deleteWaterLog({
        waterLogId: waterLog.data.waterLog[0]?.water_log_id,
        foodLogId: waterLog.data.waterLog[0]?.food_log_id,
      }).unwrap();
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Error resetting water");
      }
    }
  };

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
          className="p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset water intake"
          disabled={waterIntake === 0}
        >
          <RotateCcw className="h-4 w-4" />
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
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full disabled:opacity-50"
          >
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-400">+250ml</span>
            <span className="text-xs text-slate-500">1 cup</span>
          </Button>
          <Button
            onClick={() => addWater(500)}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full disabled:opacity-50"
          >
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-400">+500ml</span>
            <span className="text-xs text-slate-500">2 cups</span>
          </Button>
          <Button
            onClick={() => addWater(750)}
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
            onClick={() => addWater(-customAmount)}
            className="flex items-center justify-center w-8 h-8 rounded-full"
            disabled={waterIntake === 0 || customAmount === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2 flex-1 justify-center">
            <Input
              type="number"
              max={dailyGoal.toString()}
              value={customAmount === 0 ? "" : customAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setCustomAmount(0);
                } else {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue) && numValue >= 0) {
                    setCustomAmount(Math.min(numValue, dailyGoal));
                  }
                }
              }}
              className="w-20 px-2 py-1 text-center text-sm"
              placeholder="250"
            />
            <span className="text-sm text-slate-500">ml</span>
          </div>
          <Button
            variant="outline"
            onClick={() => addWater(customAmount)}
            className="flex items-center justify-center w-8 h-8 rounded-full"
            disabled={customAmount === 0}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
