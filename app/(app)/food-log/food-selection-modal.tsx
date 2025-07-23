"use client";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { MacrosPieChart } from "@/components/charts/macros-piechart";

import type {
  FoodSelectionModalProps,
  FoodItem,
  ServingUnit,
  FoodSearchResult,
  FoodNutrient,
} from "../../../interfaces/food-log-interfaces";

const servingUnits: ServingUnit[] = [
  "g",
  "oz",
  "ml",
  "cup",
  "tbsp",
  "tsp",
  "piece",
  "slice",
  "serving",
];

// Helper function to extract nutritional values from nutritions array
const getNutrientValue = (
  nutritions: FoodNutrient[] | undefined,
  nutrientNumbers: number[]
): number => {
  if (!nutritions || !Array.isArray(nutritions)) {
    return 0;
  }
  const nutrient = nutritions.find((n) =>
    nutrientNumbers.includes(n.nutrientNumber)
  );
  return nutrient ? nutrient.value : 0;
};

// Helper function to get nutrition data from food
const getNutritionData = (food: FoodSearchResult) => {
  // Fallback to direct properties if nutritions array is not available
  if (!food.nutritions || !Array.isArray(food.nutritions)) {
    return {
      calories: (food as any).calories || 0,
      protein: (food as any).protein || 0,
      carbs: (food as any).carbs || 0,
      fat: (food as any).fat || 0,
      fiber: (food as any).fiber || 0,
      sugar: (food as any).sugar || 0,
      sodium: (food as any).sodium || 0,
      cholesterol: (food as any).cholesterol || 0,
    };
  }

  return {
    calories: getNutrientValue(food.nutritions, [1008]), // Energy
    protein: getNutrientValue(food.nutritions, [1003]), // Protein
    carbs: getNutrientValue(food.nutritions, [1005]), // Carbohydrate, by difference
    fat: getNutrientValue(food.nutritions, [1004]), // Total lipid (fat)
    fiber: getNutrientValue(food.nutritions, [1079]), // Fiber, total dietary
    sugar: getNutrientValue(food.nutritions, [2000]), // Total sugars
    sodium: getNutrientValue(food.nutritions, [1093]), // Sodium
    cholesterol: getNutrientValue(food.nutritions, [1006]), // Cholesterol
  };
};

export default function FoodSelectionModal({
  isOpen,
  onClose,
  food,
  onConfirm,
}: FoodSelectionModalProps) {
  const [servingSize, setServingSize] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState<ServingUnit>("g");
  const isMobile = useIsMobile();

  // Reset form when food changes
  useEffect(() => {
    if (food) {
      // Set default serving size and unit from food data
      const defaultServingSize =
        food.servingSize?.toString() ||
        (food as any).servingSize?.toString() ||
        "100";
      const defaultUnit =
        (food.servingSizeUnit as ServingUnit) ||
        (food as any).servingUnit ||
        "g";

      setServingSize(defaultServingSize);
      setSelectedUnit(defaultUnit);
    }
  }, [food]);

  if (!food) return null;

  // Get nutrition data from the nutritions array
  const nutritionData = getNutritionData(food);

  const servingSizeNum = parseFloat(servingSize) || 1;
  const originalServingSize =
    food.servingSize || (food as any).servingSize || 100;

  // Calculate multiplier based on serving size ratio
  const multiplier = servingSizeNum / originalServingSize;

  const calculatedNutrition = {
    calories: Math.round(nutritionData.calories * multiplier),
    protein: Math.round(nutritionData.protein * multiplier * 10) / 10,
    carbs: Math.round(nutritionData.carbs * multiplier * 10) / 10,
    fat: Math.round(nutritionData.fat * multiplier * 10) / 10,
  };

  // Calculate percentages for the chart and calories from each macro
  const proteinCalories = Math.round(calculatedNutrition.protein * 4);
  const carbsCalories = Math.round(calculatedNutrition.carbs * 4);
  const fatCalories = Math.round(calculatedNutrition.fat * 9);

  const totalMacros = proteinCalories + carbsCalories + fatCalories;

  // Check if there's sufficient macro data
  const hasInsufficientData =
    totalMacros <= 0 ||
    (calculatedNutrition.protein <= 0 &&
      calculatedNutrition.carbs <= 0 &&
      calculatedNutrition.fat <= 0);

  // Prepare data for recharts PieChart
  const chartData = hasInsufficientData
    ? [{ name: "No Data", value: 100, calories: 0, color: "#e5e7eb" }]
    : [
        {
          name: "Protein",
          value: calculatedNutrition.protein,
          calories: proteinCalories,
          color: "#34d399",
        },
        {
          name: "Carbs",
          value: calculatedNutrition.carbs,
          calories: carbsCalories,
          color: "#60a5fa",
        },
        {
          name: "Fat",
          value: calculatedNutrition.fat,
          calories: fatCalories,
          color: "#f87171",
        },
      ].filter((item) => item.value > 0); // Only show segments with values > 0

  const proteinPercent = hasInsufficientData
    ? 0
    : Math.round((proteinCalories / totalMacros) * 100);
  const carbsPercent = hasInsufficientData
    ? 0
    : Math.round((carbsCalories / totalMacros) * 100);
  const fatPercent = hasInsufficientData
    ? 0
    : Math.round((fatCalories / totalMacros) * 100);

  const handleConfirm = () => {
    const foodItem: FoodItem = {
      id: `${food.fdcId}-${Date.now()}`,
      name: food.description,
      calories: calculatedNutrition.calories,
      protein: calculatedNutrition.protein,
      carbs: calculatedNutrition.carbs,
      fat: calculatedNutrition.fat,
      fiber: Math.round(nutritionData.fiber * multiplier * 10) / 10,
      sugar: Math.round(nutritionData.sugar * multiplier * 10) / 10,
      sodium: Math.round(nutritionData.sodium * multiplier * 10) / 10,
      cholesterol: Math.round(nutritionData.cholesterol * multiplier * 10) / 10,
      quantity: servingSizeNum,
      unit: selectedUnit,
    };

    onConfirm(foodItem);
  };

  const handleClose = () => {
    setServingSize("1");
    setSelectedUnit("g");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`bg-card ${isMobile ? "w-[95vw]" : "max-w-lg"}`}
      >
        <DialogHeader className="relative border-b pb-4">
          <DialogTitle className="text-md">
            {food.description
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ")}
          </DialogTitle>
          {food.brandOwner && (
            <span className="text-sm text-muted-foreground">
              ({food.brandOwner})
            </span>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Nutrition Chart */}
          <div className="flex items-center justify-center space-y-4">
            <div className="relative w-1/2 flex items-center justify-center">
              <MacrosPieChart
                data={chartData}
                calories={calculatedNutrition.calories}
              />
            </div>

            {/* Nutrition Legend */}
            <div className="space-y-2 text-sm w-1/2">
              <div className="flex items-center gap-2 bg-muted/30 py-2 px-3 rounded-md justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#34d399" }}
                  />
                  <p className="text-foreground font-medium">Protein</p>
                </div>
                <div className="flex items-center flex-col gap-0.5">
                  <p className="text-foreground font-semibold">
                    {calculatedNutrition.protein}g
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    ({proteinCalories} cal)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 py-2 px-3 rounded-md justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#60a5fa" }}
                  />
                  <p className="text-foreground font-medium">Carbs</p>
                </div>
                <div className="flex items-center flex-col gap-0.5">
                  <p className="text-foreground font-semibold">
                    {calculatedNutrition.carbs}g
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    ({carbsCalories} cal)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 py-2 px-3 rounded-md justify-between w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#f87171" }}
                  />
                  <p className="text-foreground font-medium">Fat</p>
                </div>
                <div className="flex items-center flex-col gap-0.5">
                  <p className="text-foreground font-semibold">
                    {calculatedNutrition.fat}g
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    ({fatCalories} cal)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Serving Size Section */}
          <div className="border-t pt-4 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <Label className="font-medium">Serving size:</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0.1"
                  max="10000"
                  step="0.1"
                  value={servingSize}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setServingSize(value > 10000 ? "10000" : e.target.value);
                  }}
                  className="w-20"
                />
                <Select
                  value={selectedUnit}
                  onValueChange={(value: ServingUnit) => setSelectedUnit(value)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="">
                    {servingUnits.map((unit) => (
                      <SelectItem key={unit} value={unit} className="">
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 justify-end items-center">
            <Button onClick={handleConfirm}>Add food</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
