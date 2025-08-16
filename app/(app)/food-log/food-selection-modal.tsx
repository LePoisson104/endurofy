"use client";
import { Heart, Loader2 } from "lucide-react";
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
import {
  useAddFavoriteFoodMutation,
  useRemoveFavoriteFoodMutation,
} from "@/api/food/food-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";

import type {
  FoodSelectionModalProps,
  AddFoodLogPayload,
  ServingUnit,
  Foods,
  BaseFood,
} from "../../../interfaces/food-log-interfaces";
import { toast } from "sonner";

const servingUnits: ServingUnit[] = ["g", "oz", "ml"];

// Type guard to check if food is CustomFood
function isCustomFood(food: BaseFood): boolean {
  return food.foodSource === "custom";
}

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

// Helper function to extract number and unit from combined unit (e.g., "112g" -> {amount: 112, unit: "g"})
const parseCombinedUnit = (
  combinedUnit: string
): { amount: number; unit: ServingUnit } => {
  const match = combinedUnit.match(/^(\d+(?:\.\d+)?)(.*)/);
  if (match) {
    return {
      amount: parseFloat(match[1]),
      unit: (match[2] as ServingUnit) || "g",
    };
  }
  return { amount: 1, unit: combinedUnit as ServingUnit };
};

// Helper function to check if a unit is a combined unit (contains numbers)
const isCombinedUnit = (unit: string): boolean => {
  return /^\d+(?:\.\d+)?/.test(unit);
};

// Helper function to get unit conversion factor to grams
const getUnitConversionFactor = (unit: string): number => {
  if (isCombinedUnit(unit)) {
    const { amount, unit: baseUnit } = parseCombinedUnit(unit);
    const baseConversion = getUnitConversionFactor(baseUnit);
    return amount * baseConversion;
  }

  const cleanUnit = unit.replace(/[0-9]/g, ""); // Remove numbers from combined units like "100g"
  switch (cleanUnit.toLowerCase()) {
    case "g":
      return 1;
    case "oz":
      return 28.3495; // 1 oz = 28.3495 grams
    case "ml":
      return 1; // Assuming density of water (1ml = 1g) for simplicity
    default:
      return 1;
  }
};

// Helper function to get raw nutrient values per 100g for both food types
const getRawNutrientValuesPer100g = (food: BaseFood) => {
  if (isCustomFood(food)) {
    // For CustomFood, normalize to per 100g
    const servingSize = food.servingSize || 100;
    const conversionFactor = servingSize > 0 ? 100 / servingSize : 1;

    return {
      calories: Math.round((food.calories || 0) * conversionFactor),
      protein: Number(((food.protein || 0) * conversionFactor).toFixed(2)),
      carbs: Number(((food.carbs || 0) * conversionFactor).toFixed(2)),
      fat: Number(((food.fat || 0) * conversionFactor).toFixed(2)),
      fiber: Number(((food.fiber || 0) * conversionFactor).toFixed(2)),
      sugar: Number(((food.sugar || 0) * conversionFactor).toFixed(2)),
      sodium: Math.round((food.sodium || 0) * conversionFactor),
      cholesterol: Math.round((food.cholesterol || 0) * conversionFactor),
    };
  } else {
    // For USDA foods, values are already per 100g or per serving
    return {
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
      cholesterol: food.cholesterol || 0,
    };
  }
};

// Helper function to get nutrition data from food (handles both FoodSearchResult and CustomFood)
const getNutritionData = (food: BaseFood) => {
  if (isCustomFood(food)) {
    // For CustomFood, convert from per-serving-size to per-100g
    // CustomFood nutritional values are stored per the specified serving size
    const servingSize = food.servingSize || 100;
    const conversionFactor = servingSize > 0 ? 100 / servingSize : 1;

    return {
      calories: (food.calories || 0) * conversionFactor,
      protein: (food.protein || 0) * conversionFactor,
      carbs: (food.carbs || 0) * conversionFactor,
      fat: (food.fat || 0) * conversionFactor,
      fiber: (food.fiber || 0) * conversionFactor,
      sugar: (food.sugar || 0) * conversionFactor,
      sodium: (food.sodium || 0) * conversionFactor,
      cholesterol: (food.cholesterol || 0) * conversionFactor,
    };
  } else {
    // For USDA foods, use values as they are (already normalized)
    return {
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
      cholesterol: food.cholesterol || 0,
    };
  }
};

export default function FoodSelectionModal({
  isOpen,
  onClose,
  food,
  editFood,
  mode = "add",
  onConfirm,
  onUpdate,
  isAddingFoodLog,
}: FoodSelectionModalProps) {
  const [servingSize, setServingSize] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState<ServingUnit>("g");
  const [availableUnits, setAvailableUnits] = useState<string[]>(servingUnits);
  const [initialServingSize, setInitialServingSize] = useState<string>("");
  const [initialUnit, setInitialUnit] = useState<ServingUnit>("g");
  const isMobile = useIsMobile();
  const user = useSelector(selectCurrentUser);
  const [addFavoriteFood] = useAddFavoriteFoodMutation();
  const [removeFavoriteFood] = useRemoveFavoriteFoodMutation();

  // Reset form when food or editFood changes
  useEffect(() => {
    if (mode === "edit" && editFood) {
      // Edit mode: initialize with existing food log data
      const roundedSize = Math.round(editFood.serving_size).toString();
      const unit = editFood.serving_size_unit as ServingUnit;

      setServingSize(roundedSize);
      setSelectedUnit(unit);
      setAvailableUnits(servingUnits);

      // Store initial values for comparison
      setInitialServingSize(roundedSize);
      setInitialUnit(unit);
    } else if (mode === "add" && food) {
      // Add mode: initialize with food data
      const originalServingSize = food.servingSize?.toString() || "100";
      const rawUnit = food.servingSizeUnit || "g";
      const baseUnit = convertUnitCode(rawUnit);

      // Round the serving size for cleaner display
      const roundedServingSize = Math.round(parseFloat(originalServingSize));

      // Create combined unit (e.g., "112g")
      const combinedUnit = `${roundedServingSize}${baseUnit}`;

      // Set available units to include the combined unit plus standard units
      const unitsWithCombined = [combinedUnit, ...servingUnits];
      setAvailableUnits(unitsWithCombined);

      // Set defaults: serving size = 1, unit = combined unit
      setServingSize("1");
      setSelectedUnit(combinedUnit as ServingUnit);

      // Reset initial values for add mode
      setInitialServingSize("");
      setInitialUnit("g");
    }
  }, [food, editFood, mode]);

  if (!food && !editFood) return null;

  // Get nutrition data based on mode
  const nutritionData =
    mode === "edit" && editFood
      ? {
          calories: editFood.calories,
          protein: editFood.protein_g,
          carbs: editFood.carbs_g,
          fat: editFood.fat_g,
          fiber: editFood.fiber_g,
          sugar: editFood.sugar_g,
          sodium: editFood.sodium_mg,
          cholesterol: editFood.cholesterol_mg,
        }
      : food
      ? getNutritionData(food)
      : null;

  if (!nutritionData) return null;

  const servingSizeNum = parseInt(servingSize) || 1;

  // Get original serving size based on mode and food type
  const originalServingSize =
    mode === "edit" && editFood
      ? 100 // editFood nutrition values are per 100g
      : food && isCustomFood(food)
      ? 100 // CustomFood nutrition values are converted to per 100g in getNutritionData()
      : food?.servingSize || 100; // FoodSearchResult uses original serving size

  // Get the original unit from the food data
  const originalUnit =
    mode === "edit" && editFood
      ? "g" // editFood nutrition values are per 100g
      : food && isCustomFood(food)
      ? "g" // CustomFood nutrition values are converted to per 100g in getNutritionData()
      : convertUnitCode(food?.servingSizeUnit || "g"); // FoodSearchResult uses original unit

  // Calculate multiplier based on serving size ratio and unit conversion
  let multiplier: number;

  if (isCombinedUnit(selectedUnit)) {
    // For combined units (e.g., "112g"), the conversion is straightforward
    // 1 unit of "112g" = 112g, 2 units = 224g, etc.
    const { amount: combinedAmount } = parseCombinedUnit(selectedUnit);
    const selectedTotalGrams = servingSizeNum * combinedAmount;
    const originalTotalGrams =
      originalServingSize * getUnitConversionFactor(originalUnit);
    multiplier = selectedTotalGrams / originalTotalGrams;
  } else {
    // For standard units, use the original conversion logic
    const selectedUnitFactor = getUnitConversionFactor(selectedUnit);
    const originalUnitFactor = getUnitConversionFactor(originalUnit);
    const servingSizeInOriginalUnit =
      servingSizeNum * (selectedUnitFactor / originalUnitFactor);
    multiplier = servingSizeInOriginalUnit / originalServingSize;
  }

  const calculatedNutrition = {
    calories: Math.round(nutritionData.calories * multiplier),
    protein: Number((nutritionData.protein * multiplier).toFixed(2)),
    carbs: Number((nutritionData.carbs * multiplier).toFixed(2)),
    fat: Number((nutritionData.fat * multiplier).toFixed(2)),
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
          color: "oklch(79.2% 0.209 151.711)",
        },
        {
          name: "Carbs",
          value: calculatedNutrition.carbs,
          calories: carbsCalories,
          color: "oklch(70.7% 0.165 254.624)",
        },
        {
          name: "Fat",
          value: calculatedNutrition.fat,
          calories: fatCalories,
          color: "oklch(70.4% 0.191 22.216)",
        },
      ].filter((item) => item.value > 0);

  // Check if values have changed from initial (for edit mode)
  const hasValuesChanged =
    mode === "edit"
      ? servingSize !== initialServingSize || selectedUnit !== initialUnit
      : true; // Always allow in add mode // Only show segments with values > 0

  const handleConfirm = () => {
    if (mode === "edit" && editFood && onUpdate) {
      // Edit mode: update existing food log
      const updatedFood: Partial<Foods> = {
        food_id: editFood.food_id,
        serving_size: servingSizeNum,
        serving_size_unit: selectedUnit,
      };
      onUpdate(updatedFood);
    } else if (mode === "add" && food && onConfirm) {
      // Add mode: create new food log
      // Get normalized nutritional values per 100g for backend
      const rawNutrients = getRawNutrientValuesPer100g(food);

      const foodItem: AddFoodLogPayload = {
        foodSourceId: isCustomFood(food) ? food.foodId : food.foodId,
        foodName: food.foodName,
        foodBrand: food.foodBrand,
        foodSource: isCustomFood(food) ? "custom" : food.foodSource,
        // All nutritional values are normalized to per 100g for backend storage
        calories: rawNutrients?.calories || 0,
        protein: rawNutrients?.protein || 0,
        carbs: rawNutrients?.carbs || 0,
        fat: rawNutrients?.fat || 0,
        fiber: rawNutrients?.fiber || 0,
        sugar: rawNutrients?.sugar || 0,
        sodium: rawNutrients?.sodium || 0,
        cholesterol: rawNutrients?.cholesterol || 0,
        servingSize: isCombinedUnit(selectedUnit)
          ? parseCombinedUnit(selectedUnit).amount * servingSizeNum
          : servingSizeNum,
        servingUnit: isCombinedUnit(selectedUnit)
          ? (parseCombinedUnit(selectedUnit).unit as ServingUnit)
          : (selectedUnit as ServingUnit),
      };

      onConfirm(foodItem);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent closing the modal while adding food log
    if (!open && isAddingFoodLog) {
      return;
    }
    onClose();
  };

  const handleFavorite = async () => {
    if (!food || !user?.user_id) return; // Add null check
    const foodId = food.foodId;
    const rawNutrients = getRawNutrientValuesPer100g(food);

    try {
      if (food.isFavorite === true) {
        await removeFavoriteFood({
          favFoodId: food.favoriteFoodId?.toString(),
        });
      } else {
        await addFavoriteFood({
          userId: user?.user_id,
          payload: {
            foodId: foodId,
            foodName: food.foodName,
            foodBrand: food.foodBrand,
            foodSource: isCustomFood(food) ? "custom" : food.foodSource,
            calories: rawNutrients?.calories || 0,
            protein: rawNutrients?.protein || 0,
            carbs: rawNutrients?.carbs || 0,
            fat: rawNutrients?.fat || 0,
            fiber: rawNutrients?.fiber || 0,
            sugar: rawNutrients?.sugar || 0,
            sodium: rawNutrients?.sodium || 0,
            cholesterol: rawNutrients?.cholesterol || 0,
            servingSize: isCombinedUnit(selectedUnit)
              ? parseCombinedUnit(selectedUnit).amount * servingSizeNum
              : servingSizeNum,
            servingUnit: isCombinedUnit(selectedUnit)
              ? (parseCombinedUnit(selectedUnit).unit as ServingUnit)
              : (selectedUnit as ServingUnit),
          },
        });
      }
    } catch (error: any) {
      if (error) {
        toast.error(error.data.message);
      } else {
        toast.error("Error adding/removing favorite food");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`bg-card ${isMobile ? "w-[95vw]" : "max-w-lg"}`}
      >
        <DialogHeader className="relative border-b pb-4">
          <DialogTitle className="text-md">
            {mode === "edit" && editFood
              ? editFood.food_name
              : food?.foodName
                  .split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
          </DialogTitle>
          {mode === "add" && food?.foodBrand && (
            <span className="text-sm text-muted-foreground">
              ({food.foodBrand})
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
                    style={{ backgroundColor: "oklch(79.2% 0.209 151.711)" }}
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
                    style={{ backgroundColor: "oklch(70.7% 0.165 254.624)" }}
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
                    style={{ backgroundColor: "oklch(70.4% 0.191 22.216)" }}
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
                  min="1"
                  max="10000"
                  step="1"
                  value={servingSize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
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
                    {availableUnits.map((unit) => (
                      <SelectItem key={unit} value={unit} className="">
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={handleFavorite}>
                  <Heart
                    className={`w-4 h-4 ${
                      food?.isFavorite === true ? "text-rose-500" : "none"
                    }`}
                    fill={
                      food?.isFavorite === true
                        ? "oklch(71.2% 0.194 13.428)"
                        : "none"
                    }
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 justify-end items-center">
            <Button
              onClick={handleConfirm}
              disabled={isAddingFoodLog || !hasValuesChanged}
              className="flex items-center gap-2 w-[100px] text-sm"
            >
              {isAddingFoodLog ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "edit" ? (
                "Update"
              ) : (
                "Add food"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
