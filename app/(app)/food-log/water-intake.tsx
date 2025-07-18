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
    return Math.min((waterIntake / dailyGoal) * 100, 100);
  };

  const getWaterCups = () => {
    return Math.round(waterIntake / 250);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Droplets className="h-5 w-5 text-blue-600" />
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
                2 * Math.PI * 50 * (1 - getWaterPercentage() / 100)
              }`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{waterIntake}</span>
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
            {Math.round(getWaterPercentage())}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${getWaterPercentage()}%` }}
          />
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => addWater(250)}
            className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            <Droplets className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs font-medium text-blue-700">+250ml</span>
            <span className="text-xs text-blue-500">1 cup</span>
          </button>
          <button
            onClick={() => addWater(500)}
            className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            <Droplets className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs font-medium text-blue-700">+500ml</span>
            <span className="text-xs text-blue-500">2 cups</span>
          </button>
          <button
            onClick={() => addWater(750)}
            className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            <Droplets className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs font-medium text-blue-700">+750ml</span>
            <span className="text-xs text-blue-500">3 cups</span>
          </button>
        </div>

        {/* Custom Amount Controls */}
        <div className="flex items-center justify-between p-3 rounded-lg gap-3 bg-foreground/5">
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
            <span className="text-sm text-muted-foreground">ml</span>
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

      {/* Water Tips */}
      {waterIntake >= dailyGoal && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              Goal achieved!
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Great job staying hydrated today!
          </p>
        </div>
      )}

      {waterIntake < dailyGoal * 0.5 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-sm font-medium text-amber-800">
              Stay hydrated
            </span>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            You're halfway to your daily water goal!
          </p>
        </div>
      )}
    </div>
  );
}
