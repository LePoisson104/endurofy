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
import { USDAFoodNutrientID } from "@/helper/constants/nutrients-constants";

import type {
  FoodSelectionModalProps,
  FoodItem,
  ServingUnit,
  FoodSearchResult,
  FoodNutrient,
} from "../../../interfaces/food-log-interfaces";

const servingUnits: ServingUnit[] = ["g", "oz", "ml"];

// Helper function to convert unit codes to standard units
const convertUnitCode = (unit: string): ServingUnit => {
  switch (unit?.toUpperCase()) {
    case "MLT":
      return "ml";
    case "GRM":
      return "g";
    default:
      // Return the unit as is if it's already a valid ServingUnit, otherwise default to "g"
      return servingUnits.includes(unit as ServingUnit)
        ? (unit as ServingUnit)
        : "g";
  }
};

// Helper function to extract nutritional values from nutritions array
const getNutrientValue = (
  nutritions: FoodNutrient[] | undefined,
  nutrientNumbers: number[],
  servingSize: number
): number => {
  if (!nutritions || !Array.isArray(nutritions)) {
    return 0;
  }
  const nutrient = nutritions.find((n) => {
    return nutrientNumbers.includes(n.nutrientId);
  });

  return nutrient
    ? Number((nutrient.value * (servingSize / 100)).toFixed(2))
    : 0;
};

// Helper function to get nutrition data from food
const getNutritionData = (food: FoodSearchResult) => {
  return {
    calories: getNutrientValue(
      food.nutritions,
      [USDAFoodNutrientID.CALORIES],
      food.servingSize
    ),
    protein: getNutrientValue(
      food.nutritions,
      [USDAFoodNutrientID.PROTEIN],
      food.servingSize
    ),
    carbs: getNutrientValue(
      food.nutritions,
      [USDAFoodNutrientID.CARBOHYDRATE],
      food.servingSize
    ),
    fat: getNutrientValue(
      food.nutritions,
      [USDAFoodNutrientID.FAT],
      food.servingSize
    ),
    fiber: getNutrientValue(
      food.nutritions,
      [USDAFoodNutrientID.FIBER],
      food.servingSize
    ),
    sugar: getNutrientValue(
      food.nutritions,
      [USDAFoodNutrientID.TOTAL_SUGARS],
      food.servingSize
    ),
    sodium: getNutrientValue(
      food.nutritions,
      [USDAFoodNutrientID.SODIUM],
      food.servingSize
    ),
    cholesterol: getNutrientValue(
      food.nutritions,
      [USDAFoodNutrientID.CHOLESTEROL],
      food.servingSize
    ),
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
      const rawUnit =
        (food.servingSizeUnit as string) || (food as any).servingUnit || "g";
      const defaultUnit = convertUnitCode(rawUnit);

      setServingSize(defaultServingSize);
      setSelectedUnit(defaultUnit);
    }
  }, [food]);

  if (!food) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
