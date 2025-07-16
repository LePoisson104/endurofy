export type ServingUnit =
  | "g"
  | "oz"
  | "ml"
  | "cup"
  | "tbsp"
  | "tsp"
  | "piece"
  | "slice"
  | "serving";

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  servingUnit: string;
  isFavorite?: boolean;
  isCustom?: boolean;
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
