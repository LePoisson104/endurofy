export type ServingUnit = "g" | "oz" | "ml" | "GRM" | "MLT";

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  quantity: number;
  unit: string;
}

export interface FoodSearchResult {
  fdcId: string;
  brandOwner: string;
  description: string;
  foodCategory: string;
  ingredients: string;
  servingSize: number;
  servingSizeUnit: string;
  nutritions: FoodNutrient[];
}

export interface FoodNutrient {
  foodNutrientId: number;
  indentLevel?: number;
  rank?: number;
  nutrientId: number;
  nutrientLevel: number;
  nutrientName: string;
  nutrientNumber: number;
  unitName: string;
  value: number;
}

export interface AddCustomFoodPayload {
  foodName: string;
  foodBrand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  servingSize: number;
  servingUnit: ServingUnit;
}

export interface FoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodSearchResult | null;
  onConfirm: (food: FoodItem) => void;
}

export interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodCreated: (food: AddCustomFoodPayload) => void;
}

export interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: (food: FoodItem) => void;
  mealType: string;
}
