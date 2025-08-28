import React, { useState } from "react";
import { Droplets, Plus, Minus, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WaterIntakeProps {
  initialIntake?: number;
  dailyGoal?: number;
  onIntakeChange?: (intake: number) => void;
}

export default function WaterIntake({
  initialIntake = 0,
  dailyGoal = 2500,
  onIntakeChange,
}: WaterIntakeProps) {
  const [waterIntake, setWaterIntake] = useState(initialIntake);
  const [customAmount, setCustomAmount] = useState(250);
  const updateWaterIntake = (newIntake: number) => {
    setWaterIntake(newIntake);
    onIntakeChange?.(newIntake);
  };

  const addWater = (amount: number) => {
    const newIntake = Math.min(waterIntake + amount, dailyGoal * 1.5);
    updateWaterIntake(newIntake);
  };

  const removeWater = (amount: number) => {
    const newIntake = Math.max(waterIntake - amount, 0);
    updateWaterIntake(newIntake);
  };

  const resetWater = () => {
    updateWaterIntake(0);
  };

  const getWaterPercentage = () => {
    const maxPercent = Math.min((waterIntake / dailyGoal) * 100, 100);
    const acutalPercent = (waterIntake / dailyGoal) * 100;

    return { actualPercent: acutalPercent, maxPercent: maxPercent };
  };

  const getWaterCups = () => {
    return Math.round(waterIntake / 250);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-foreground/5 rounded-lg">
            <Droplets className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">Water Intake</h3>
            <p className="text-sm text-gray-500">{getWaterCups()} cups today</p>
          </div>
        </div>
        <button
          onClick={resetWater}
          className="p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
          title="Reset water intake"
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
            <span className="text-xl font-bold">{waterIntake}</span>
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
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full"
          >
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-400">+250ml</span>
            <span className="text-xs text-slate-500">1 cup</span>
          </Button>
          <Button
            onClick={() => addWater(500)}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full"
          >
            <Droplets className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-400">+500ml</span>
            <span className="text-xs text-slate-500">2 cups</span>
          </Button>
          <Button
            onClick={() => addWater(750)}
            className="flex flex-col items-center p-3 bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors duration-200 h-full"
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
            disabled={waterIntake === 0}
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
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
