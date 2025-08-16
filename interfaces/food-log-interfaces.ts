export type ServingUnit = "g" | "oz" | "ml" | "GRM" | "MLT";

export interface AddFoodLogPayload {
  foodSourceId: string;
  foodName: string;
  foodBrand?: string;
  foodSource?: "USDA" | "custom";
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
  food_id: string;
  food_log_id: string;
  food_source_id: string;
  food_name: string;
  brand_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  cholesterol_mg: number;
  food_source: "USDA" | "custom";
  meal_type: "breakfast" | "lunch" | "dinner" | "snacks" | "uncategorized";
  logged_at: string;
  serving_size: number;
  serving_size_unit: string;
}

export interface BaseFood {
  foodId: string;
  foodName: string;
  foodBrand: string;
  ingredients?: string;
  foodSource: "USDA" | "custom";
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
  favoriteFoodId: string | null;
  isFavorite: boolean;
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
