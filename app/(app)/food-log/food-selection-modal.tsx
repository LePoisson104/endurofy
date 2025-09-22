"use client";
import { Heart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import IngredientsDialog from "@/components/dialog/ingredients-dialog";

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
  const [localIsFavorite, setLocalIsFavorite] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const user = useSelector(selectCurrentUser);
  const [addFavoriteFood] = useAddFavoriteFoodMutation();
  const [removeFavoriteFood] = useRemoveFavoriteFoodMutation();

  // Reset form when food or editFood changes
  useEffect(() => {
    if (mode === "edit" && editFood) {
      // Edit mode: initialize with existing food log data
      const roundedSize = Math.round(
        parseFloat(editFood.loggedServingSize)
      ).toString();
      const unit = editFood.loggedServingSizeUnit as ServingUnit;

      setServingSize(roundedSize);
      setSelectedUnit(unit);
      setAvailableUnits(servingUnits);
      setLocalIsFavorite((editFood as any)?.isFavorite === true);
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
      setLocalIsFavorite(food?.isFavorite === true);
    }
  }, [food, editFood, mode]);

  if (!food && !editFood) return null;

  // Get nutrition data and calculate values based on mode
  const servingSizeNum = parseInt(servingSize) || 1;

  let nutritionData: any;
  let calculatedNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  let originalNutrientsPer100g:
    | {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
        sodium: number;
        cholesterol: number;
      }
    | undefined = undefined;

  if (mode === "edit" && editFood) {
    // For edit mode, the nutritional values are already calculated for the current logged serving
    // We need to show the actual values for the current serving size selection

    // First, calculate the original nutrients per 100g from the current logged values
    const currentLoggedServingSize = parseFloat(editFood.loggedServingSize);
    const currentLoggedUnit = editFood.loggedServingSizeUnit;

    // Convert current logged serving to grams
    const currentLoggedGrams =
      currentLoggedServingSize * getUnitConversionFactor(currentLoggedUnit);

    // Calculate per 100g values from current logged values
    originalNutrientsPer100g = {
      calories: (parseFloat(editFood.calories) * 100) / currentLoggedGrams,
      protein: (parseFloat(editFood.protein) * 100) / currentLoggedGrams,
      carbs: (parseFloat(editFood.carbs) * 100) / currentLoggedGrams,
      fat: (parseFloat(editFood.fat) * 100) / currentLoggedGrams,
      fiber: (parseFloat(editFood.fiber) * 100) / currentLoggedGrams,
      sugar: (parseFloat(editFood.sugar) * 100) / currentLoggedGrams,
      sodium: (parseFloat(editFood.sodium) * 100) / currentLoggedGrams,
      cholesterol:
        (parseFloat(editFood.cholesterol) * 100) / currentLoggedGrams,
    };

    // Now calculate new values based on the selected serving size and unit
    let newServingGrams;
    if (isCombinedUnit(selectedUnit)) {
      const { amount: combinedAmount } = parseCombinedUnit(selectedUnit);
      newServingGrams = servingSizeNum * combinedAmount;
    } else {
      const selectedUnitFactor = getUnitConversionFactor(selectedUnit);
      newServingGrams = servingSizeNum * selectedUnitFactor;
    }

    const multiplier = newServingGrams / 100;

    nutritionData = originalNutrientsPer100g;
    calculatedNutrition = {
      calories: Math.round(originalNutrientsPer100g.calories * multiplier),
      protein: Number(
        (originalNutrientsPer100g.protein * multiplier).toFixed(2)
      ),
      carbs: Number((originalNutrientsPer100g.carbs * multiplier).toFixed(2)),
      fat: Number((originalNutrientsPer100g.fat * multiplier).toFixed(2)),
    };
  } else if (food) {
    // Add mode: use the original logic
    nutritionData = getNutritionData(food);

    // Get original serving size and unit
    const originalServingSize =
      food && isCustomFood(food)
        ? 100 // CustomFood nutrition values are converted to per 100g in getNutritionData()
        : food?.servingSize || 100; // FoodSearchResult uses original serving size

    const originalUnit =
      food && isCustomFood(food)
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

    calculatedNutrition = {
      calories: Math.round(nutritionData.calories * multiplier),
      protein: Number((nutritionData.protein * multiplier).toFixed(2)),
      carbs: Number((nutritionData.carbs * multiplier).toFixed(2)),
      fat: Number((nutritionData.fat * multiplier).toFixed(2)),
    };
  } else {
    return null;
  }

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
  let hasValuesChanged = true; // Always allow in add mode

  if (mode === "edit" && editFood) {
    // Calculate the final values that would be sent to backend
    let finalServingSize: number;
    let finalServingUnit: string;

    if (isCombinedUnit(selectedUnit)) {
      const { amount: combinedAmount, unit: baseUnit } =
        parseCombinedUnit(selectedUnit);
      finalServingSize = servingSizeNum * combinedAmount;
      finalServingUnit = baseUnit;
    } else {
      finalServingSize = servingSizeNum;
      finalServingUnit = selectedUnit;
    }

    // Check if either value has actually changed
    const originalServingSize = parseFloat(editFood.loggedServingSize);
    const servingSizeChanged = finalServingSize !== originalServingSize;
    const servingUnitChanged =
      finalServingUnit !== editFood.loggedServingSizeUnit;

    hasValuesChanged = servingSizeChanged || servingUnitChanged;
  }

  const handleConfirm = () => {
    if (mode === "edit" && editFood && onUpdate && originalNutrientsPer100g) {
      // Edit mode: update existing food log
      // Calculate the serving size and unit to send to backend
      let finalServingSize: number;
      let finalServingUnit: string;

      if (isCombinedUnit(selectedUnit)) {
        const { amount: combinedAmount, unit: baseUnit } =
          parseCombinedUnit(selectedUnit);
        finalServingSize = servingSizeNum * combinedAmount;
        finalServingUnit = baseUnit;
      } else {
        finalServingSize = servingSizeNum;
        finalServingUnit = selectedUnit;
      }

      // Only include fields that have actually changed
      const updatedFood: Partial<Foods> = {
        foodId: editFood.foodId,
      };

      // Check if serving size changed
      const originalServingSize = parseFloat(editFood.loggedServingSize);
      if (finalServingSize !== originalServingSize) {
        updatedFood.loggedServingSize = finalServingSize.toString();
      }

      // Check if serving unit changed
      if (finalServingUnit !== editFood.loggedServingSizeUnit) {
        updatedFood.loggedServingSizeUnit = finalServingUnit;
      }

      onUpdate(updatedFood);
    } else if (mode === "add" && food && onConfirm) {
      // Add mode: create new food log
      // Get normalized nutritional values per 100g for backend
      const rawNutrients = getRawNutrientValuesPer100g(food);

      const foodItem: AddFoodLogPayload = {
        foodSourceId: food.foodId,
        foodName: food.foodName,
        foodBrand: food.foodBrand,
        foodSource: isCustomFood(food) ? "custom" : food.foodSource,
        ingredients: food.ingredients || "",
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

  // Determine if this food is currently a favorite
  const currentFood =
    mode === "edit" && editFood
      ? {
          foodId: editFood.foodSourceId || editFood.foodId,
          foodName: editFood.foodName,
          foodBrand: editFood.brandName || "",
          foodSource: editFood.source,
          ingredients: editFood.ingredients,
          isFavorite: (editFood as any).isFavorite || false,
          favoriteFoodId: (editFood as any).favoriteFoodId || null,
        }
      : food;

  // Use local state for immediate UI updates
  const isFavorite = localIsFavorite;

  const handleFavorite = async () => {
    if (!user?.user_id || !currentFood) return;

    try {
      if (localIsFavorite) {
        await removeFavoriteFood({
          userId: user?.user_id,
          favFoodId: currentFood.favoriteFoodId?.toString(),
        }).unwrap();
        setLocalIsFavorite(false);
      } else {
        // For add mode, use food data; for edit mode, get original nutrients from editFood
        let rawNutrients;
        if (mode === "edit" && editFood) {
          // Use the calculated per-100g nutrients from edit mode
          rawNutrients = originalNutrientsPer100g;
        } else if (food) {
          rawNutrients = getRawNutrientValuesPer100g(food);
        }

        if (!rawNutrients) return;

        await addFavoriteFood({
          userId: user?.user_id,
          payload: {
            foodId: mode === "add" ? food?.foodId : editFood?.foodItemId,
            foodName: currentFood.foodName,
            foodBrand: currentFood.foodBrand,
            foodSource: currentFood.foodSource,
            ingredients: currentFood.ingredients,
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
            servingSizeUnit: isCombinedUnit(selectedUnit)
              ? (parseCombinedUnit(selectedUnit).unit as ServingUnit)
              : (selectedUnit as ServingUnit),
          },
        }).unwrap();
        setLocalIsFavorite(true);
      }
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Error adding/removing favorite food");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={`${isMobile ? "w-[95vw]" : "max-w-lg"} z-9999`}>
        <DialogHeader className="relative border-b pb-4">
          <DialogTitle className="text-md">
            {mode === "edit" && editFood
              ? editFood.foodName
              : food?.foodName
                  .split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {mode === "edit" && editFood
                ? editFood.brandName
                : food?.foodBrand}
            </span>

            {((editFood?.ingredients && editFood.ingredients.trim() !== "") ||
              (food?.ingredients && food.ingredients.trim() !== "")) && (
              <IngredientsDialog
                ingredients={editFood?.ingredients || food?.ingredients || ""}
              />
            )}
          </DialogDescription>
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
                  inputMode="numeric"
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
                      isFavorite ? "text-rose-500" : "text-muted-foreground"
                    }`}
                    fill={isFavorite ? "currentColor" : "none"}
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
