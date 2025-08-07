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

export interface FoodSearchResult {
  fdcId: string;
  brandOwner: string;
  description: string;
  foodSource: "USDA" | "custom";
  foodCategory: string;
  ingredients: string;
  servingSize: number;
  servingSizeUnit: string;
  nutritions: FoodNutrient[];
  favoriteFoodId: string | null;
  isFavorite: boolean;
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

export interface CustomFood {
  customFoodId: string;
  description: string;
  brandOwner: string;
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

export interface AddFavoriteFoodPayload {
  foodId: string;
  foodName: string;
  foodBrand?: string;
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
  servingUnit: ServingUnit;
}

export interface FavoriteFood {
  favoriteFoodId: string;
  foodId: string;
  isFavorite: boolean;
  foodSource: "USDA" | "custom";
  description: string;
  brandOwner: string;
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
  food: FoodSearchResult | CustomFood | FavoriteFood | null;
  editFood?: Foods | null;
  mode?: "add" | "edit";
  onConfirm: (food: AddFoodLogPayload) => void;
  onUpdate?: (updatedFood: Partial<Foods>) => void;
}

export interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  editFood?: CustomFood | null;
  mode?: "add" | "edit";
}

export interface FoodSearchModalProps {
  isAddingFoodLog: boolean;
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: (food: AddFoodLogPayload) => Promise<void>;
  mealType: string;
}
