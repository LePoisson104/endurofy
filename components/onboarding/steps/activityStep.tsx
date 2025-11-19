import { useState } from "react";
import { Armchair, FootprintsIcon, Bike, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserData } from "@/interfaces/userOnboardData";
import ContinueBtn from "./continnueBtn";

interface ActivityStepProps {
  data: UserData;
  onNext: (data: Partial<UserData>) => void;
  isLoading: boolean;
}

export default function ActivityStep({
  data,
  onNext,
  isLoading,
}: ActivityStepProps) {
  const [activityLevel, setActivityLevel] = useState<
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extra_active"
    | undefined
  >(data.activityLevel);

  const handleNext = () => {
    if (activityLevel) {
      onNext({ activityLevel });
    }
  };

  const activityOptions = [
    {
      value: "sedentary" as const,
      label: "Sedentary",
      icon: Armchair,
      description: "Little to no exercise, desk job",
      color: "text-slate-500",
      bgColor: "bg-slate-100",
    },
    {
      value: "lightly_active" as const,
      label: "Lightly Active",
      icon: FootprintsIcon,
      description: "Light exercise 1-3 days/week",
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      value: "moderately_active" as const,
      label: "Moderately Active",
      icon: Bike,
      description: "Moderate exercise 3-5 days/week",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      value: "very_active" as const,
      label: "Very Active",
      icon: Zap,
      description: "Hard exercise 6-7 days/week",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    {
      value: "extra_active" as const,
      label: "Extra Active",
      icon: Flame,
      description: "Physical job + exercise, or 2x/day training",
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          What&apos;s your activity level?
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          This helps us calculate your daily calorie needs accurately
        </p>
      </div>

      <div className="grid gap-4">
        {activityOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.value}
              className={cn(
                "p-5 cursor-pointer transition-all duration-200 hover:shadow-soft border rounded-lg",
                activityLevel === option.value
                  ? "bg-blue-500/5 border-blue-500"
                  : "border"
              )}
              onClick={() => setActivityLevel(option.value)}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={cn(
                    "p-2 rounded-full transition-colors mt-1",
                    activityLevel === option.value ? option.bgColor : "bg-card"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      activityLevel === option.value
                        ? option.color
                        : option.color + "/60"
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={cn(
                      "font-medium mb-1",
                      activityLevel === option.value
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ContinueBtn
        onClick={handleNext}
        disabled={!activityLevel}
        label="Complete setup"
        isLoading={isLoading}
      />
    </div>
  );
}
