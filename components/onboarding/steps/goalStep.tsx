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
  const [goal, setGoal] = useState<
    | "lose_weight"
    | "gain_weight"
    | "maintain_weight"
    | "build_muscle"
    | undefined
  >(data.goal);
  const [goalWeight, setGoalWeight] = useState<string>(
    data.goalWeight?.toString() || ""
  );

  const handleNext = () => {
    if (goal) {
      const goalWeightNum = goalWeight ? parseFloat(goalWeight) : undefined;
      onNext({ goal, goalWeight: goalWeightNum });
    }
  };

  const goalOptions = [
    {
      value: "lose_weight" as const,
      icon: TrendingDown,
      label: "Lose Weight",
      description: "Reduce body weight and fat",
    },
    {
      value: "gain_weight" as const,
      icon: TrendingUp,
      label: "Gain Weight",
      description: "Increase overall body weight",
    },
    {
      value: "maintain_weight" as const,
      icon: MoveRight,
      label: "Maintain Weight",
      description: "Keep current weight stable",
    },
  ];

  const needsGoalWeight = goal === "lose_weight" || goal === "gain_weight";
  const isValid =
    goal && (!needsGoalWeight || (goalWeight && parseFloat(goalWeight) > 0));

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
              onClick={() => setGoal(option.value)}
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

      {needsGoalWeight && (
        <div className="p-4 hover:shadow-soft transition-shadow">
          <div className="space-y-2">
            <Label
              htmlFor="goalWeight"
              className="text-sm font-medium flex items-center gap-2"
            >
              Target Weight (kg)
            </Label>
            <Input
              id="goalWeight"
              type="number"
              placeholder="65"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              className="text-center"
              min="30"
              max="300"
              step="0.1"
            />
          </div>
        </div>
      )}
      <ContinueBtn onClick={handleNext} disabled={!isValid} />
    </div>
  );
}
