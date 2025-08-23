"use client";

import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CustomFoodModalProps,
  ServingUnit,
  BaseFoodPayload,
} from "../../../interfaces/food-log-interfaces";
import {
  useAddCustomFoodMutation,
  useUpdateCustomFoodMutation,
} from "@/api/food/food-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatNumberForDisplay } from "@/helper/display-number-format";
import { Textarea } from "@/components/ui/textarea";

const servingUnits: ServingUnit[] = ["g", "oz", "ml"];

// Internal form state that allows empty strings for number inputs
interface FormState {
  foodName: string;
  foodBrand: string;
  calories: string | number;
  protein: string | number;
  carbs: string | number;
  fat: string | number;
  fiber: string | number;
  sugar: string | number;
  sodium: string | number;
  cholesterol: string | number;
  servingSize: string | number;
  servingUnit: ServingUnit;
  ingredients: string;
}

export default function CustomFoodModal({
  isOpen,
  onClose,
  editFood = null,
  mode = "add",
}: CustomFoodModalProps) {
  const isMobile = useIsMobile();
  const user = useSelector(selectCurrentUser);
  const [addCustomFood, { isLoading: isAddingCustomFood }] =
    useAddCustomFoodMutation();
  const [updateCustomFood, { isLoading: isUpdatingCustomFood }] =
    useUpdateCustomFoodMutation();

  const [formData, setFormData] = useState<FormState>({
    foodName: "",
    foodBrand: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    sugar: "",
    sodium: "",
    cholesterol: "",
    servingSize: "",
    servingUnit: "g",
    ingredients: "",
  });

  // Track original values for edit mode
  const [originalData, setOriginalData] = useState<FormState | null>(null);

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  // Initialize form data when editing
  useEffect(() => {
    if (mode === "edit" && editFood) {
      const editFormData: FormState = {
        foodName: editFood.foodName || "",
        foodBrand: editFood.foodBrand || "",
        calories: formatNumberForDisplay(editFood.calories || 0),
        protein: formatNumberForDisplay(editFood.protein || 0),
        carbs: formatNumberForDisplay(editFood.carbs || 0),
        fat: formatNumberForDisplay(editFood.fat || 0),
        fiber: formatNumberForDisplay(editFood.fiber || 0),
        sugar: formatNumberForDisplay(editFood.sugar || 0),
        sodium: formatNumberForDisplay(editFood.sodium || 0),
        cholesterol: formatNumberForDisplay(editFood.cholesterol || 0),
        servingSize: formatNumberForDisplay(editFood.servingSize || 0),
        servingUnit: (editFood.servingSizeUnit || "g") as ServingUnit,
        ingredients: editFood.ingredients || "",
      };
      setFormData(editFormData);
      setOriginalData({ ...editFormData }); // Store original values
    } else {
      // Reset form for add mode
      const resetFormData: FormState = {
        foodName: "",
        foodBrand: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        sugar: "",
        sodium: "",
        cholesterol: "",
        servingSize: "",
        servingUnit: "g" as ServingUnit,
        ingredients: "",
      };
      setFormData(resetFormData);
      setOriginalData(null);
    }
    setErrors({});
  }, [mode, editFood, isOpen]);

  // Check if any values have changed from original
  const hasChanges = (): boolean => {
    if (mode === "add") return true; // Always allow submit for add mode
    if (!originalData) return false;

    return Object.keys(formData).some(
      (key) =>
        formData[key as keyof FormState] !==
        originalData[key as keyof FormState]
    );
  };

  // Get only the changed fields for partial update
  const getChangedFields = (): Partial<BaseFoodPayload> => {
    if (mode === "add" || !originalData) {
      return prepareSubmissionData();
    }

    const changes: Partial<BaseFoodPayload> = {};

    if (formData.foodName !== originalData.foodName) {
      changes.foodName = formData.foodName.trim();
    }
    if (formData.foodBrand !== originalData.foodBrand) {
      changes.foodBrand = formData.foodBrand.trim() || "";
    }
    if (formData.calories !== originalData.calories) {
      changes.calories = parseIntValue(formData.calories);
    }
    if (formData.protein !== originalData.protein) {
      changes.protein = parseNumberValue(formData.protein);
    }
    if (formData.carbs !== originalData.carbs) {
      changes.carbs = parseNumberValue(formData.carbs);
    }
    if (formData.fat !== originalData.fat) {
      changes.fat = parseNumberValue(formData.fat);
    }
    if (formData.fiber !== originalData.fiber) {
      changes.fiber = parseNumberValue(formData.fiber);
    }
    if (formData.sugar !== originalData.sugar) {
      changes.sugar = parseNumberValue(formData.sugar);
    }
    if (formData.sodium !== originalData.sodium) {
      changes.sodium = parseIntValue(formData.sodium);
    }
    if (formData.cholesterol !== originalData.cholesterol) {
      changes.cholesterol = parseIntValue(formData.cholesterol);
    }
    if (formData.servingSize !== originalData.servingSize) {
      changes.servingSize = parseNumberValue(formData.servingSize);
    }
    if (formData.servingUnit !== originalData.servingUnit) {
      changes.servingSizeUnit = formData.servingUnit;
    }
    if (formData.ingredients !== originalData.ingredients) {
      changes.ingredients = formData.ingredients.trim();
    }

    return changes;
  };

  const handleInputChange = (
    field: keyof FormState,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const parseNumberValue = (value: string | number): number => {
    if (typeof value === "number") return value;
    if (value === "" || value === null || value === undefined) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseIntValue = (value: string | number): number => {
    if (typeof value === "number") return value;
    if (value === "" || value === null || value === undefined) return 0;
    const parsed = parseInt(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    // Required field: Food name
    if (!formData.foodName.trim()) {
      newErrors.foodName = "Food name is required";
    }

    // Required field: Serving size
    const servingSize = parseNumberValue(formData.servingSize);
    if (formData.servingSize === "" || servingSize <= 0) {
      newErrors.servingSize =
        "Serving size is required and must be greater than 0";
    } else if (servingSize > 10000) {
      newErrors.servingSize = "Serving size cannot exceed 10000";
    }

    // Calories - must be provided (can be 0)
    const caloriesValue = formData.calories;
    if (
      caloriesValue === "" ||
      caloriesValue === null ||
      caloriesValue === undefined
    ) {
      newErrors.calories = "Calories is required";
    } else {
      const numericCalories = parseIntValue(caloriesValue);
      if (numericCalories < 0) {
        newErrors.calories = "Calories cannot be negative";
      }
    }

    // Required macronutrients - must be provided (can be 0)
    const requiredMacrosCanBeZero = [
      {
        field: "protein" as keyof FormState,
        name: "Protein",
        parser: parseNumberValue,
      },
      {
        field: "carbs" as keyof FormState,
        name: "Carbs",
        parser: parseNumberValue,
      },
      {
        field: "fat" as keyof FormState,
        name: "Fat",
        parser: parseNumberValue,
      },
    ];

    requiredMacrosCanBeZero.forEach(({ field, name, parser }) => {
      const value = formData[field];
      if (value === "" || value === null || value === undefined) {
        newErrors[field] = `${name} is required`;
      } else {
        const numericValue = parser(value);
        if (numericValue < 0) {
          newErrors[field] = `${name} cannot be negative`;
        }
      }
    });

    // Validate optional numeric fields are not negative (when they have values)
    const optionalNumericFields = [
      {
        field: "fiber" as keyof FormState,
        name: "Fiber",
        parser: parseNumberValue,
      },
      {
        field: "sugar" as keyof FormState,
        name: "Sugar",
        parser: parseNumberValue,
      },
      {
        field: "sodium" as keyof FormState,
        name: "Sodium",
        parser: parseIntValue,
      },
      {
        field: "cholesterol" as keyof FormState,
        name: "Cholesterol",
        parser: parseIntValue,
      },
    ];

    optionalNumericFields.forEach(({ field, name, parser }) => {
      const value = formData[field];
      if (value !== "" && value !== null && value !== undefined) {
        const numericValue = parser(value);
        if (numericValue < 0) {
          newErrors[field] = `${name} cannot be negative`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareSubmissionData = (): BaseFoodPayload => {
    return {
      foodName: formData.foodName.trim(),
      foodBrand: formData.foodBrand.trim() || "",
      calories: parseIntValue(formData.calories),
      protein: parseNumberValue(formData.protein),
      carbs: parseNumberValue(formData.carbs),
      fat: parseNumberValue(formData.fat),
      fiber: parseNumberValue(formData.fiber),
      sugar: parseNumberValue(formData.sugar),
      sodium: parseIntValue(formData.sodium),
      cholesterol: parseIntValue(formData.cholesterol),
      servingSize: parseNumberValue(formData.servingSize),
      servingSizeUnit: formData.servingUnit,
      ingredients: formData.ingredients.trim(),
    };
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        if (mode === "edit" && editFood) {
          const changedFields = getChangedFields();
          const response = await updateCustomFood({
            customFoodId: editFood.foodId,
            payload: changedFields,
          });
          toast.success(
            response.data.data.message || "Food updated successfully"
          );
        } else {
          const submissionData = prepareSubmissionData();
          const response = await addCustomFood({
            userId: user?.user_id,
            payload: submissionData,
          });
          toast.success(response.data.data.message);
        }
        handleClose();
      } catch (error: any) {
        if (error.data?.message) {
          toast.error(error.data.message);
        } else {
          toast.error(
            mode === "edit"
              ? "Internal server error. Failed to update custom food"
              : "Internal server error. Failed to add custom food"
          );
        }
      }
    }
  };

  const handleClose = () => {
    setFormData({
      foodName: "",
      foodBrand: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      fiber: "",
      sugar: "",
      sodium: "",
      cholesterol: "",
      servingSize: "",
      servingUnit: "g",
      ingredients: "",
    });
    setErrors({});
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const handleNumberInputChange = (
    field: keyof FormState,
    value: string,
    max?: number
  ) => {
    // Allow empty string
    if (value === "") {
      handleInputChange(field, "");
      return;
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      const finalValue = max && numericValue > max ? max : numericValue;
      // Format the value to remove .00 but keep meaningful decimals
      const formattedValue = formatNumberForDisplay(finalValue);
      handleInputChange(field, formattedValue);
    }
  };

  const isLoading = isAddingCustomFood || isUpdatingCustomFood;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`bg-card max-h-[90vh] overflow-y-auto ${
          isMobile ? "max-w-[95vw] w-[95vw] px-1 py-6" : "max-w-2xl"
        } `}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Custom Food" : "Create Custom Food"}
          </DialogTitle>
          <DialogDescription className={`${isMobile ? "p-2" : "p-0"}`}>
            Create a new food from the nutrition facts on a product label.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="food-name">Food Name *</Label>
                  <Input
                    id="food-name"
                    value={formData.foodName}
                    onChange={(e) =>
                      handleInputChange("foodName", e.target.value)
                    }
                    placeholder="e.g., Greek Yogurt"
                    className={errors.foodName ? "border-red-500" : ""}
                  />
                  {errors.foodName && (
                    <p className="text-sm text-red-500">{errors.foodName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food-brand">
                    Brand{" "}
                    <span className="text-xs text-muted-foreground">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="food-brand"
                    value={formData.foodBrand}
                    onChange={(e) =>
                      handleInputChange("foodBrand", e.target.value)
                    }
                    placeholder="e.g., Chobani"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serving-size">Serving Size *</Label>
                  <Input
                    id="serving-size"
                    type="number"
                    min="0.1"
                    max="10000"
                    step="0.1"
                    value={formData.servingSize}
                    onChange={(e) =>
                      handleNumberInputChange(
                        "servingSize",
                        e.target.value,
                        10000
                      )
                    }
                    placeholder="e.g., 100"
                    className={errors.servingSize ? "border-red-500" : ""}
                  />
                  {errors.servingSize && (
                    <p className="text-sm text-red-500">{errors.servingSize}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serving-unit">Serving Unit *</Label>
                  <Select
                    value={formData.servingUnit}
                    onValueChange={(value: ServingUnit) =>
                      handleInputChange("servingUnit", value)
                    }
                  >
                    <SelectTrigger id="serving-unit" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {servingUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Macronutrients */}
          <Card>
            <CardHeader>
              <CardTitle>Macronutrients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">
                    Calories *{" "}
                    <span className="text-xs text-muted-foreground">
                      (kcal)
                    </span>
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.calories}
                    onChange={(e) =>
                      handleNumberInputChange("calories", e.target.value)
                    }
                    placeholder="0"
                    className={errors.calories ? "border-red-500" : ""}
                  />
                  {errors.calories && (
                    <p className="text-sm text-red-500">{errors.calories}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">
                    Protein *{" "}
                    <span className="text-xs text-muted-foreground">(g)</span>
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) =>
                      handleNumberInputChange("protein", e.target.value)
                    }
                    placeholder="0"
                    className={errors.protein ? "border-red-500" : ""}
                  />
                  {errors.protein && (
                    <p className="text-sm text-red-500">{errors.protein}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">
                    Carbs *{" "}
                    <span className="text-xs text-muted-foreground">(g)</span>
                  </Label>{" "}
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) =>
                      handleNumberInputChange("carbs", e.target.value)
                    }
                    placeholder="0"
                    className={errors.carbs ? "border-red-500" : ""}
                  />
                  {errors.carbs && (
                    <p className="text-sm text-red-500">{errors.carbs}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">
                    Fat *{" "}
                    <span className="text-xs text-muted-foreground">(g)</span>
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) =>
                      handleNumberInputChange("fat", e.target.value)
                    }
                    placeholder="0"
                    className={errors.fat ? "border-red-500" : ""}
                  />
                  {errors.fat && (
                    <p className="text-sm text-red-500">{errors.fat}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Nutrients */}
          <Card>
            <CardHeader>
              <CardTitle>
                Additional Nutrients{" "}
                <span className="text-sm text-muted-foreground">
                  (Optional)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiber">
                    Fiber{" "}
                    <span className="text-xs text-muted-foreground">(g)</span>
                  </Label>
                  <Input
                    id="fiber"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) =>
                      handleNumberInputChange("fiber", e.target.value)
                    }
                    placeholder="0"
                    className={errors.fiber ? "border-red-500" : ""}
                  />
                  {errors.fiber && (
                    <p className="text-sm text-red-500">{errors.fiber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugar">
                    Sugar{" "}
                    <span className="text-xs text-muted-foreground">(g)</span>
                  </Label>
                  <Input
                    id="sugar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.sugar}
                    onChange={(e) =>
                      handleNumberInputChange("sugar", e.target.value)
                    }
                    placeholder="0"
                    className={errors.sugar ? "border-red-500" : ""}
                  />
                  {errors.sugar && (
                    <p className="text-sm text-red-500">{errors.sugar}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sodium">
                    Sodium{" "}
                    <span className="text-xs text-muted-foreground">(mg)</span>
                  </Label>
                  <Input
                    id="sodium"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.sodium}
                    onChange={(e) =>
                      handleNumberInputChange("sodium", e.target.value)
                    }
                    placeholder="0"
                    className={errors.sodium ? "border-red-500" : ""}
                  />
                  {errors.sodium && (
                    <p className="text-sm text-red-500">{errors.sodium}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cholesterol">
                    Cholesterol
                    <span className="text-xs text-muted-foreground">(mg)</span>
                  </Label>
                  <Input
                    id="cholesterol"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.cholesterol}
                    onChange={(e) =>
                      handleNumberInputChange("cholesterol", e.target.value)
                    }
                    placeholder="0"
                    className={errors.cholesterol ? "border-red-500" : ""}
                  />
                  {errors.cholesterol && (
                    <p className="text-sm text-red-500">{errors.cholesterol}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Ingredients{" "}
                <span className="text-sm text-muted-foreground">
                  (Optional)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) =>
                  handleInputChange("ingredients", e.target.value)
                }
                placeholder="e.g., Greek Yogurt"
                className="h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (mode === "edit" && !hasChanges())}
            className="w-[120px]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "edit" ? (
              "Update Food"
            ) : (
              "Create Food"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
