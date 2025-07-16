"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Food</DialogTitle>
          <DialogDescription>
            Add your own food item with complete nutritional information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
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
                  <Label htmlFor="food-brand">Brand (Optional)</Label>
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
                    step="0.1"
                    value={formData.servingSize}
                    onChange={(e) =>
                      handleInputChange(
                        "servingSize",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={errors.servingSize ? "border-red-500" : ""}
                  />
                  {errors.servingSize && (
                    <p className="text-sm text-red-500">{errors.servingSize}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serving-unit">Serving Unit</Label>
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
              <CardTitle className="text-lg">Macronutrients</CardTitle>
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
              <CardTitle className="text-lg">
                Additional Nutrients (Optional)
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

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p>
                  <strong>{formData.foodName || "Untitled Food"}</strong>
                </p>
                {formData.foodBrand && (
                  <p className="text-muted-foreground">{formData.foodBrand}</p>
                )}
                <p className="text-muted-foreground">
                  Per {formData.servingSize} {formData.servingUnit}
                </p>
                <Separator />
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="font-medium">{formData.calories}</div>
                    <div className="text-muted-foreground text-xs">cal</div>
                  </div>
                  <div>
                    <div className="font-medium">{formData.protein}g</div>
                    <div className="text-muted-foreground text-xs">protein</div>
                  </div>
                  <div>
                    <div className="font-medium">{formData.carbs}g</div>
                    <div className="text-muted-foreground text-xs">carbs</div>
                  </div>
                  <div>
                    <div className="font-medium">{formData.fat}g</div>
                    <div className="text-muted-foreground text-xs">fat</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-2" />
            Create Food
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
