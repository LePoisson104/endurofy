export type ServingUnit = "g" | "oz" | "ml" | "GRM" | "MLT";

export interface AddFoodLogPayload {
  foodSourceId: string;
  foodName: string;
  foodBrand?: string;
  foodSource?: "usda" | "custom";
  ingredients?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  servingSize: number;
  servingUnit: ServingUnit;
  mealType?: "breakfast" | "lunch" | "dinner" | "snacks" | "uncategorized";
  loggedAt?: Date;
}
export interface FoodLogs {
  food_log_id: string;
  status: "completed" | "incomplete";
  log_date: string;
  foods: {
    breakfast: Foods[];
    lunch: Foods[];
    dinner: Foods[];
    snacks: Foods[];
    uncategorized: Foods[];
  };
}

export interface Foods {
  baseServingSize: string;
  baseServingSizeUnit: string;
  brandName?: string;
  calories: string;
  carbs: string;
  cholesterol: string;
  fat: string;
  fiber: string;
  foodId: string;
  foodItemId: string;
  foodLogId: string;
  foodName: string;
  foodSourceId: string | null;
  ingredients?: string;
  loggedServingSize: string;
  loggedServingSizeUnit: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks" | "uncategorized";
  protein: string;
  sodium: string;
  source: "usda" | "custom";
  sugar: string;
}

export interface BaseFood {
  foodId: string;
  foodName: string;
  foodBrand: string;
  ingredients?: string;
  foodSource?: "usda" | "custom";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  servingSize: number;
  servingSizeUnit: ServingUnit;
  favoriteFoodId?: string | null;
  isFavorite?: boolean;
}

export interface BaseFoodPayload {
  foodName: string;
  foodBrand: string;
  ingredients?: string;
  foodSource?: "usda" | "custom";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  servingSize: number;
  servingSizeUnit: ServingUnit;
}

export interface FoodSelectionModalProps {
  isAddingFoodLog: boolean;
  isOpen: boolean;
  onClose: () => void;
  food: BaseFood | null;
  editFood?: Foods | null;
  mode?: "add" | "edit";
  onConfirm: (food: AddFoodLogPayload) => void;
  onUpdate?: (updatedFood: Partial<Foods>) => void;
}

export interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  editFood?: BaseFood | null;
  mode?: "add" | "edit";
}

export interface FoodSearchModalProps {
  isAddingFoodLog: boolean;
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: (food: AddFoodLogPayload) => Promise<void>;
  mealType: string;
}
