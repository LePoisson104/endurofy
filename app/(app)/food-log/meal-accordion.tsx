"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MoreVertical,
  UtensilsCrossed,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Apple, Edit, Heart, Plus, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { FoodLogs } from "../../../interfaces/food-log-interfaces";

interface MealData {
  uncategorized: FoodLogs[];
  breakfast: FoodLogs[];
  lunch: FoodLogs[];
  dinner: FoodLogs[];
  snacks: FoodLogs[];
}

interface MealAccordionProps {
  mealType: keyof MealData;
  title: string;
  foods: FoodLogs[];
  isExpanded: boolean;
  onToggle: (mealType: keyof MealData) => void;
  onAddFood: (mealType: keyof MealData, event?: React.MouseEvent) => void;
  onEditFood: (mealType: keyof MealData, foodId: string) => void;
  onRemoveFood: (foodLogId: string) => void;
  onFavoriteFood: (mealType: keyof MealData, foodId: string) => void;
  isDeletingFoodLog: boolean;
}

const getMealMacros = (meal: FoodLogs[]) => {
  return meal.reduce(
    (totals, food) => ({
      calories: totals.calories + food.calories * (food.serving_size / 100),
      protein: totals.protein + food.protein_g * (food.serving_size / 100),
      carbs: totals.carbs + food.carbs_g * (food.serving_size / 100),
      fat: totals.fat + food.fat_g * (food.serving_size / 100),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};

export default function MealAccordion({
  mealType,
  title,
  foods,
  isExpanded,
  onToggle,
  onAddFood,
  onEditFood,
  onRemoveFood,
  onFavoriteFood,
  isDeletingFoodLog,
}: MealAccordionProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const mealMacros = getMealMacros(foods);

  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1 h-[60px]"
          onClick={() => onToggle(mealType)}
        >
          <Button
            onClick={(e) => onAddFood(mealType, e)}
            size="sm"
            variant="ghost"
            className="p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div
            className={`flex ${
              isMobile ? "flex-col items-start" : "justify-between items-center"
            } w-full`}
          >
            <span className="font-medium text-sm">{title}</span>
            {foods.length > 0 && (
              <div
                className={`${
                  isMobile
                    ? "flex gap-4 mt-1 items-center"
                    : "flex-col items-end"
                } text-sm text-muted-foreground`}
              >
                <div
                  className={`flex gap-1 ${
                    isMobile ? "text-[10px]" : "text-xs"
                  } ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  <span>{Math.round(mealMacros.calories)} Kcal</span>
                  <span>•</span>
                  <span>P: {Math.round(mealMacros.protein)} g</span>
                  <span>•</span>
                  <span>C: {Math.round(mealMacros.carbs)} g</span>
                  <span>•</span>
                  <span>F: {Math.round(mealMacros.fat)} g</span>
                </div>
              </div>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 ml-4" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 ml-4" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="pb-4">
          <div className="space-y-3">
            {foods.length === 0 ? (
              <div
                className={`text-muted-foreground text-sm py-4 text-center border border-dashed ${
                  isDark
                    ? "text-slate-400 border-slate-400"
                    : "text-slate-500 border-slate-500"
                } rounded-lg flex flex-col items-center justify-center gap-2 h-[130px]`}
              >
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                <p className="text-sm">No foods added yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={(e) => onAddFood(mealType, e)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Food
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {foods.map((food) => (
                  <div
                    key={food.food_log_id}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Apple className="h-3 w-3 text-destructive" />
                        <p className="font-medium text-sm">
                          {food.food_name
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ")}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(food.serving_size)} {food.serving_size_unit}{" "}
                        •{" "}
                        {Math.round(food.calories * (food.serving_size / 100))}
                        cal
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              onEditFood(mealType, food.food_log_id)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRemoveFood(food.food_log_id)}
                            variant="destructive"
                          >
                            {isDeletingFoodLog ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Remove
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              onFavoriteFood(mealType, food.food_log_id)
                            }
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Add to Favorites
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
