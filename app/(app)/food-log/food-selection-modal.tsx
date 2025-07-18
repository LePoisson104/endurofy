"use client";

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

import type { FoodSelectionModalProps, FoodItem, ServingUnit } from "./types";

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
      setServingSize(food.servingSize);
      setSelectedUnit(food.servingUnit as ServingUnit);
    }
  }, [food]);

  if (!food) return null;

  const servingSizeNum = parseFloat(servingSize) || 1;
  const originalServingSize = parseFloat(food.servingSize) || 1;

  // Calculate multiplier based on serving size ratio
  const multiplier = servingSizeNum / originalServingSize;

  const calculatedNutrition = {
    calories: Math.round(food.calories * multiplier),
    protein: Math.round(food.protein * multiplier * 10) / 10,
    carbs: Math.round(food.carbs * multiplier * 10) / 10,
    fat: Math.round(food.fat * multiplier * 10) / 10,
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
      id: `${food.id}-${Date.now()}`,
      name: food.name,
      calories: calculatedNutrition.calories,
      protein: calculatedNutrition.protein,
      carbs: calculatedNutrition.carbs,
      fat: calculatedNutrition.fat,
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
            {food.brand ? `(${food.brand}) ` : ""}
            {food.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4 ">
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
