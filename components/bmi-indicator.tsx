"use client";

import { cn } from "@/lib/utils";

interface BMIIndicatorProps {
  bmi: number;
  bmiCategory?: string;
  showLabels?: boolean;
  className?: string;
}

export default function BMIIndicator({
  bmi,
  bmiCategory,
  showLabels = true,
  className,
}: BMIIndicatorProps) {
  // Calculate where the indicator should appear on the scale (0-100%)
  const getBmiProgress = (bmi: number): number => {
    // Returns position percentage for BMI indicator
    if (bmi < 18.5) return (bmi / 18.5) * 18.5;
    if (bmi < 25) return 18.5 + ((bmi - 18.5) / 6.5) * 18.5;
    if (bmi < 30) return 37.0 + ((bmi - 25) / 5) * 18.5;
    if (bmi < 40) return 55.5 + ((bmi - 30) / 10) * 18.5;
    return 74.0; // Max value
  };

  // Get BMI category if not provided
  const calculateBmiCategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  // Get color for BMI category
  const getBmiCategoryColor = (bmi: number): string => {
    if (bmi < 18.5) return "text-blue-500";
    if (bmi < 25) return "text-green-500";
    if (bmi < 30) return "text-yellow-500";
    return "text-red-500";
  };

  const bmiProgress = getBmiProgress(bmi);
  const displayCategory = bmiCategory || calculateBmiCategory(bmi);
  const categoryColor = getBmiCategoryColor(bmi);

  return (
    <div className={cn("space-y-2", className)}>
      {showLabels && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            BMI (Body Mass Index)
          </span>
          <span className={`text-sm font-medium ${categoryColor}`}>
            {displayCategory}
          </span>
        </div>
      )}

      <div
        className="relative h-6 rounded-full overflow-hidden"
        style={{
          background: `linear-gradient(
      to right, 
      #60a5fa 0%,     /* Blue (Underweight) */
      #60a5fa 9%,  /* Transition to Green */
rgb(18, 228, 95) 26%,    /* Darker Green (Normal - Extended) */
      #facc15 60%,    /* Yellow (Overweight) */
      #dc2626 100%    /* Darker Red (Obese) */
    )`,
        }}
      >
        {/* BMI Indicator */}
        <div
          className="absolute top-0 h-6 w-1 bg-black dark:bg-white"
          style={{ left: `${bmiProgress}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40+</span>
      </div>

      {showLabels && (
        <div className="flex justify-between text-xs">
          <span className="text-blue-400">Underweight</span>
          <span className="text-green-400">Normal</span>
          <span className="text-yellow-400">Overweight</span>
          <span className="text-red-400">Obese</span>
        </div>
      )}
    </div>
  );
}
