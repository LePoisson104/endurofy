import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UserData } from "@/interfaces/userOnboardData";
import ContinueBtn from "./continnueBtn";
import { TrendingDown, TrendingUp, MoveRight } from "lucide-react";

interface GoalStepProps {
  data: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function GoalStep({ data, onNext }: GoalStepProps) {
  const [goal, setGoal] = useState<"lose" | "gain" | "maintain" | undefined>(
    data.goal
  );
  const [goalWeight, setGoalWeight] = useState<string>(
    data.weight_goal?.toString() || ""
  );

  // Get the weight unit from the physical info step
  const weightUnit = data.current_weight_unit || data.weight_unit || "kg";

  const handleNext = () => {
    if (goal) {
      let goalWeightNum: number | undefined;

      if (goal === "maintain") {
        // Use current weight as goal weight for maintain weight goal
        goalWeightNum = data.current_weight || data.weight;
      } else {
        goalWeightNum = goalWeight ? parseFloat(goalWeight) : undefined;
      }

      onNext({
        goal,
        weight_goal: goalWeightNum,
        weight_goal_unit: weightUnit,
      });
    }
  };

  const goalOptions = [
    {
      value: "lose" as const,
      icon: TrendingDown,
      label: "Lose Weight",
      description: "Reduce body weight and fat",
    },
    {
      value: "gain" as const,
      icon: TrendingUp,
      label: "Gain Weight",
      description: "Increase overall body weight",
    },
    {
      value: "maintain" as const,
      icon: MoveRight,
      label: "Maintain Weight",
      description: "Keep current weight stable",
    },
  ];

  const needsGoalWeightInput = goal === "lose" || goal === "gain";
  const isValid =
    goal &&
    (goal === "maintain" ||
      !needsGoalWeightInput ||
      (goalWeight && parseFloat(goalWeight) > 0));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">What's your goal?</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Tell us what you want to achieve
        </p>
      </div>

      <div className="grid gap-4">
        {goalOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.value}
              className={cn(
                "p-5 cursor-pointer transition-all duration-200 border rounded-lg",
                goal === option.value
                  ? "bg-blue-500/5 border-blue-500"
                  : "border"
              )}
              onClick={() => {
                setGoal(option.value);
                // Auto-populate goal weight with current weight for maintain weight goal
                if (
                  option.value === "maintain" &&
                  (data.current_weight || data.weight)
                ) {
                  setGoalWeight(
                    (data.current_weight || data.weight)!.toString()
                  );
                }
              }}
            >
              <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex gap-2">
                  <div
                    className={cn(
                      "font-medium text-lg mb-1",
                      goal === option.value ? "text-primary" : "text-foreground"
                    )}
                  >
                    {option.label}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {needsGoalWeightInput && (
        <div className="p-4 hover:shadow-soft transition-shadow">
          <div className="space-y-2">
            <Label
              htmlFor="goalWeight"
              className="text-sm font-medium flex items-center gap-2"
            >
              Target Weight ({weightUnit})
            </Label>
            <Input
              id="goalWeight"
              type="number"
              inputMode="decimal"
              placeholder={weightUnit === "kg" ? "65" : "143"}
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="text-center"
              min={weightUnit === "kg" ? "30" : "66"}
              max={weightUnit === "kg" ? "300" : "661"}
              step="0.1"
            />
          </div>
        </div>
      )}
      <ContinueBtn onClick={handleNext} disabled={!isValid} />
    </div>
  );
}
