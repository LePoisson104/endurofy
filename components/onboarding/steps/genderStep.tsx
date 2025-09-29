import { useState } from "react";
import { Venus, Mars } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserData } from "@/interfaces/userOnboardData";
import ContinueBtn from "./continnueBtn";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

interface GenderStepProps {
  data: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function GenderStep({ data, onNext }: GenderStepProps) {
  const isDark = useGetCurrentTheme();
  const [gender, setGender] = useState<"male" | "female" | undefined>(
    data.gender
  );

  const handleNext = () => {
    if (gender) {
      onNext({ gender });
    }
  };

  const genderOptions = [
    { value: "male" as const, label: "Male", icon: Mars },
    { value: "female" as const, label: "Female", icon: Venus },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">What&apos;s your gender?</h1>
        <p className="mb-10 text-sm text-muted-foreground">
          This helps us provide more accurate calorie recommendations
        </p>
      </div>

      <div className="grid gap-4">
        {genderOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.value}
              onClick={() => setGender(option.value)}
              className={`p-5 cursor-pointer transition-all duration-200 hover:shadow-soft border border rounded-lg ${
                option.value === gender
                  ? option.value === "male"
                    ? isDark
                      ? "border-blue-500 bg-blue-500/5"
                      : "border-blue-400 bg-blue-500/5"
                    : isDark
                    ? "border-pink-500 bg-pink-500/5"
                    : "border-pink-400 bg-pink-500/5"
                  : "border"
              }`}
            >
              <div className="flex items-center space-x-4">
                <Icon
                  className={`w-5 h-5 ${
                    option.value === "male" ? "text-blue-500" : "text-pink-500"
                  }`}
                />

                <span
                  className={cn(
                    "font-medium text-lg",
                    gender === option.value ? "text-f" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <ContinueBtn onClick={handleNext} disabled={!gender} />
    </div>
  );
}
