import React, { useState, useEffect, useRef } from "react";
import { Droplets, Plus, Minus, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useCreateWaterLogMutation,
  useUpdateWaterLogMutation,
  useDeleteWaterLogMutation,
} from "@/api/water-log/waterlog-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { selectUserInfo } from "@/api/user/user-slice";
import { toast } from "sonner";
import {
  useAnimatedCounter,
  useAnimatedDecimalCounter,
} from "@/hooks/use-decimal-counter";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { getWaterPercentage } from "@/helper/get-water-percentage";

export default function WaterIntake({
  waterLog,
  selectedDate,
  disableButton,
}: {
  waterLog: any;
  selectedDate: string;
  disableButton: boolean;
}) {
  const user = useSelector(selectCurrentUser);
  const userInfo = useSelector(selectUserInfo);
  const dailyGoal = Number(userInfo?.gender === "male" ? 3700 : 2100);

  const [waterIntake, setWaterIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState(250);

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

  const getWaterCups = () => {
    const safeWaterIntake = isNaN(waterIntake) ? 0 : waterIntake;
    return Math.round(safeWaterIntake / 250);
  };

  return (
    <div className="space-y-6 flex flex-col justify-center items-center w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="font-semibold">Water Intake</h3>
            <p className="text-sm text-slate-500">
              {getWaterCups()} cups today
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={resetWater}
          className="p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset water intake"
          disabled={waterIntake === 0 || disableButton}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <ProgressCircle
        waterIntake={waterIntake}
        dailyGoal={dailyGoal}
        percentage={
          getWaterPercentage({
            waterIntake,
            dailyGoal,
          }).actualPercent
        }
      />

      {/* Quick Add Buttons */}
      <div className="space-y-3 w-full">
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => addWater(250)}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full disabled:opacity-50"
            disabled={disableButton}
          >
            <Droplets className="h-5 w-5 text-sky-500 mb-1" />
            <span className="text-xs font-medium text-sky-500">+250ml</span>
            <span className="text-xs text-slate-500">1 cup</span>
          </Button>
          <Button
            onClick={() => addWater(500)}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full disabled:opacity-50"
            disabled={disableButton}
          >
            <Droplets className="h-5 w-5 text-sky-500 mb-1" />
            <span className="text-xs font-medium text-sky-500">+500ml</span>
            <span className="text-xs text-slate-500">2 cups</span>
          </Button>
          <Button
            onClick={() => addWater(750)}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full disabled:opacity-50"
            disabled={disableButton}
          >
            <Droplets className="h-5 w-5 text-sky-500 mb-1" />
            <span className="text-xs font-medium text-sky-500">+750ml</span>
            <span className="text-xs text-slate-500">3 cups</span>
          </Button>
        </div>

        {/* Custom Amount Controls */}
        <div className="flex items-center justify-between p-3 rounded-lg gap-3 bg-foreground/5 mt-5">
          <Button
            variant="outline"
            onClick={() => addWater(-customAmount)}
            className="flex items-center justify-center w-8 h-8 rounded-full"
            disabled={waterIntake === 0 || customAmount === 0 || disableButton}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2 flex-1 justify-center">
            <Input
              type="number"
              inputMode="decimal"
              max={dailyGoal.toString()}
              disabled={disableButton}
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
            disabled={customAmount === 0 || disableButton}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const ProgressCircle = ({
  waterIntake,
  dailyGoal,
  percentage,
}: {
  waterIntake: number;
  dailyGoal: number;
  percentage: number;
}) => {
  const isDark = useGetCurrentTheme();
  const animatedPercentage = useAnimatedCounter(percentage, 500);
  const animatedWaterIntake = useAnimatedDecimalCounter(
    waterIntake / 1000,
    500,
    2
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  const waveHeight = Math.min(percentage === 0 ? 4 : percentage, 100);

  return (
    <div className="flex flex-col items-center justify-center mt-2 mb-5">
      <div className="flex flex-col items-center justify-center h-45 w-45 border border-4 rounded-full border-muted mt-5 mb-5">
        <div className="relative flex flex-col justify-center items-center h-40 w-40 rounded-full overflow-hidden">
          {/* Water with Wave Border */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <svg
              className="absolute bottom-0 left-0 w-full h-full"
              viewBox="0 0 160 160"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="waterGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      isDark
                        ? "oklch(68.5% 0.169 237.323)" //sky-500
                        : "oklch(74.6% 0.16 232.661)" //sky-400
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      isDark
                        ? "oklch(50% 0.134 242.749)" //sky-700
                        : "oklch(58.8% 0.158 241.966)" //sky-600
                    }
                  />
                </linearGradient>
              </defs>
              <path
                d={`M0,160 L0,${
                  160 - waveHeight * (percentage >= 100 ? 1.6 : 1.8)
                } 
                      Q20,${
                        160 - waveHeight * (percentage >= 100 ? 1.6 : 1.7) - 3
                      } 40,${160 - waveHeight * 1.6} 
                      T80,${160 - waveHeight * 1.6} 
                      T120,${160 - waveHeight * 1.6} 
                      T160,${160 - waveHeight * 1.6} 
                      L160,160 Z`}
                fill="url(#waterGradient)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          {/* Content overlay */}
          <div
            className={`relative z-10 flex flex-col justify-center items-center ${
              percentage === 0 ? "text-gray-400" : "text-primary"
            }`}
          >
            <div className="text-3xl font-[1000]">{animatedPercentage}%</div>
            <div className="text-sm">
              {animatedWaterIntake.toFixed(2)} of {dailyGoal / 1000}{" "}
              <span className="font-sans">l</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
