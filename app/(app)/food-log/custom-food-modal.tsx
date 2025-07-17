"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
  AddCustomFoodPayload,
  ServingUnit,
} from "./types";

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

export default function CustomFoodModal({
  isOpen,
  onClose,
  onFoodCreated,
}: CustomFoodModalProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<AddCustomFoodPayload>({
    foodName: "",
    foodBrand: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    servingSize: 1,
    servingUnit: "g",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddCustomFoodPayload, string>>
  >({});

  const handleInputChange = (
    field: keyof AddCustomFoodPayload,
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

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddCustomFoodPayload, string>> = {};

    if (!formData.foodName.trim()) {
      newErrors.foodName = "Food name is required";
    }

    if (formData.calories < 0) {
      newErrors.calories = "Calories cannot be negative";
    }

    if (formData.protein < 0) {
      newErrors.protein = "Protein cannot be negative";
    }

    if (formData.carbs < 0) {
      newErrors.carbs = "Carbs cannot be negative";
    }

    if (formData.fat < 0) {
      newErrors.fat = "Fat cannot be negative";
    }

    if (formData.servingSize <= 0) {
      newErrors.servingSize = "Serving size must be greater than 0";
    }

    if (formData.servingSize > 10000) {
      newErrors.servingSize = "Serving size cannot exceed 10000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onFoodCreated(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      foodName: "",
      foodBrand: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      servingSize: 1,
      servingUnit: "g",
    });
    setErrors({});
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
        className={`bg-card max-h-[90vh] overflow-y-auto ${
          isMobile ? "max-w-[95vw] w-[95vw] px-1 py-6" : "max-w-2xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle>Create Custom Food</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                    placeholder="e.g., Homemade Protein Smoothie"
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
                    placeholder="e.g., Homemade, Brand Name"
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
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      handleInputChange(
                        "servingSize",
                        value > 10000 ? 10000 : value
                      );
                    }}
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
                    <SelectTrigger id="serving-unit">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.calories}
                    onChange={(e) =>
                      handleInputChange(
                        "calories",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={errors.calories ? "border-red-500" : ""}
                  />
                  {errors.calories && (
                    <p className="text-sm text-red-500">{errors.calories}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) =>
                      handleInputChange(
                        "protein",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={errors.protein ? "border-red-500" : ""}
                  />
                  {errors.protein && (
                    <p className="text-sm text-red-500">{errors.protein}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) =>
                      handleInputChange(
                        "carbs",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={errors.carbs ? "border-red-500" : ""}
                  />
                  {errors.carbs && (
                    <p className="text-sm text-red-500">{errors.carbs}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fat}
                    onChange={(e) =>
                      handleInputChange("fat", parseFloat(e.target.value) || 0)
                    }
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) =>
                      handleInputChange(
                        "fiber",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugar">Sugar (g)</Label>
                  <Input
                    id="sugar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.sugar}
                    onChange={(e) =>
                      handleInputChange(
                        "sugar",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sodium">Sodium (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.sodium}
                    onChange={(e) =>
                      handleInputChange("sodium", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cholesterol">Cholesterol (mg)</Label>
                  <Input
                    id="cholesterol"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.cholesterol}
                    onChange={(e) =>
                      handleInputChange(
                        "cholesterol",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Food</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
