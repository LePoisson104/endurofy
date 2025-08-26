"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  UtensilsCrossed,
} from "lucide-react";

import { Apple, Edit, Plus, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { FoodLogs, Foods } from "../../../interfaces/food-log-interfaces";
import { formatNumberForDisplay } from "@/helper/display-number-format";
import {
  ResponsiveMenu,
  createMenuItem,
  createMenuSection,
} from "@/components/ui/responsive-menu";

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
  foods: Foods[];
  isExpanded: boolean;
  onToggle: (mealType: keyof MealData) => void;
  onAddFood: (mealType: keyof MealData, event?: React.MouseEvent) => void;
  onEditFood: (foodId: string) => void;
  onRemoveFood: (foodId: string, foodLogId: string) => void;
  isDeletingFoodLog: boolean;
}

const getTotalNutrients = (meal: Foods[]) => {
  return meal.reduce(
    (totals, food) => {
      return {
        calories: totals.calories + parseFloat(food.calories),
        protein: totals.protein + parseFloat(food.protein),
        carbs: totals.carbs + parseFloat(food.carbs),
        fat: totals.fat + parseFloat(food.fat),
      };
    },
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
  isDeletingFoodLog,
}: MealAccordionProps) {
  const isMobile = useIsMobile();
  const isDark = useGetCurrentTheme();
  const totalNutrients = getTotalNutrients(foods);

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
            className={`p-0 ${isMobile ? "h-5 w-5" : "h-8 w-8"}`}
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
                  <span>{Math.round(totalNutrients.calories)} Kcal</span>
                  <span>•</span>
                  <span>
                    P:{" "}
                    {formatNumberForDisplay(
                      Number(totalNutrients.protein).toFixed(2)
                    )}{" "}
                    g
                  </span>
                  <span>•</span>
                  <span>
                    C:{" "}
                    {formatNumberForDisplay(
                      Number(totalNutrients.carbs).toFixed(2)
                    )}{" "}
                    g
                  </span>
                  <span>•</span>
                  <span>
                    F:{" "}
                    {formatNumberForDisplay(
                      Number(totalNutrients.fat).toFixed(2)
                    )}{" "}
                    g
                  </span>
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
                  className="w-fit border-none"
                  onClick={(e) => onAddFood(mealType, e)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Food
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {foods.map((food) => {
                  const menuSections = [
                    createMenuSection([
                      createMenuItem("edit", "Edit", Edit, () =>
                        onEditFood(food.foodId)
                      ),
                    ]),
                    createMenuSection([
                      createMenuItem(
                        "remove",
                        "Remove",
                        Trash2,
                        () => onRemoveFood(food.foodId, food.foodLogId),
                        {
                          variant: "destructive",
                        }
                      ),
                    ]),
                  ];

                  return (
                    <div
                      key={food.foodId}
                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Apple className="text-destructive w-[13px] h-[13px]" />
                          <p
                            className={`font-medium text-sm truncate ${
                              isMobile ? "w-[200px]" : "w-full"
                            }`}
                          >
                            {food.foodName
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(parseFloat(food.loggedServingSize))}{" "}
                          {food.loggedServingSizeUnit} •{" "}
                          {Math.round(Number(food.calories))}
                          cal
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ResponsiveMenu
                          sections={menuSections}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
