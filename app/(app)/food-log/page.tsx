"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Beef, Apple, Zap, Droplets, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import FoodSearchModal from "./food-search-modal";
import FoodCalendar from "./food-calendar";
import MealAccordion from "./meal-accordion";
import MacroProgressBar from "./macro-progress-bar";
import PageTitle from "@/components/global/page-title";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

interface MealData {
  uncategorized: FoodItem[];
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snacks: FoodItem[];
}

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function FoodLogPage() {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<keyof MealData>("breakfast");
  const [expandedMeals, setExpandedMeals] = useState<Set<keyof MealData>>(
    new Set()
  );

  // Mock data - replace with actual data from your backend
  const [mealData, setMealData] = useState<MealData>({
    uncategorized: [],
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });

  const macroTargets: MacroTargets = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
  };

  // Calculate current macros from all meals
  const calculateCurrentMacros = () => {
    const allFoods = [
      ...mealData.uncategorized,
      ...mealData.breakfast,
      ...mealData.lunch,
      ...mealData.dinner,
      ...mealData.snacks,
    ];

    return allFoods.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories * food.quantity,
        protein: totals.protein + food.protein * food.quantity,
        carbs: totals.carbs + food.carbs * food.quantity,
        fat: totals.fat + food.fat * food.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const currentMacros = calculateCurrentMacros();

  const handleAddFood = (meal: keyof MealData, event?: React.MouseEvent) => {
    event?.stopPropagation(); // Prevent event bubbling to accordion toggle

    // Ensure the accordion is expanded before opening the modal
    if (!expandedMeals.has(meal)) {
      setExpandedMeals((prev) => {
        const newSet = new Set(prev);
        newSet.add(meal);
        return newSet;
      });
    }

    setSelectedMeal(meal);
    setIsAddFoodModalOpen(true);
  };

  const handleFoodAdded = (food: FoodItem) => {
    setMealData((prev) => ({
      ...prev,
      [selectedMeal]: [...prev[selectedMeal], food],
    }));
    setIsAddFoodModalOpen(false);
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (isMobile) {
      setIsCalendarModalOpen(false);
    }
  };

  const handleEditFood = (mealType: keyof MealData, foodId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit food:", { mealType, foodId });
  };

  const handleRemoveFood = (mealType: keyof MealData, foodId: string) => {
    setMealData((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((food) => food.id !== foodId),
    }));
  };

  const handleFavoriteFood = (mealType: keyof MealData, foodId: string) => {
    // TODO: Implement favorite functionality
    console.log("Favorite food:", { mealType, foodId });
  };

  const getMealCalories = (meal: FoodItem[]) => {
    return meal.reduce(
      (total, food) => total + food.calories * food.quantity,
      0
    );
  };

  const getMealMacros = (meal: FoodItem[]) => {
    return meal.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories * food.quantity,
        protein: totals.protein + food.protein * food.quantity,
        carbs: totals.carbs + food.carbs * food.quantity,
        fat: totals.fat + food.fat * food.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const toggleMealExpansion = (mealType: keyof MealData) => {
    setExpandedMeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mealType)) {
        newSet.delete(mealType);
      } else {
        newSet.add(mealType);
      }
      return newSet;
    });
  };

  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      <header>
        <div className="flex justify-between items-center">
          <div>
            <PageTitle
              title="Food Log"
              showCurrentDateAndTime={false}
              subTitle={`${format(selectedDate, "EEEE, MMMM d, yyyy")}`}
            />
          </div>
          {isMobile && (
            <Button
              variant="outline"
              onClick={() => setIsCalendarModalOpen(true)}
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Show Calendar
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 pt-6">
        <div className="grid grid-cols-1 gap-[1rem] lg:grid-cols-4">
          {/* Left side - Food Log */}
          <div className="lg:col-span-3 space-y-6">
            {/* Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Meals</CardTitle>
                <CardDescription>
                  Add and track your daily meals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  <MealAccordion
                    mealType="uncategorized"
                    title="Uncategorized"
                    foods={mealData.uncategorized}
                    isExpanded={expandedMeals.has("uncategorized")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                  />
                  <MealAccordion
                    mealType="breakfast"
                    title="Breakfast"
                    foods={mealData.breakfast}
                    isExpanded={expandedMeals.has("breakfast")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                  />
                  <MealAccordion
                    mealType="lunch"
                    title="Lunch"
                    foods={mealData.lunch}
                    isExpanded={expandedMeals.has("lunch")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                  />
                  <MealAccordion
                    mealType="dinner"
                    title="Dinner"
                    foods={mealData.dinner}
                    isExpanded={expandedMeals.has("dinner")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                  />
                  <MealAccordion
                    mealType="snacks"
                    title="Snacks"
                    foods={mealData.snacks}
                    isExpanded={expandedMeals.has("snacks")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daily Nutrition */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Nutrition</CardTitle>
                <CardDescription>
                  Track your macronutrients and calories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-6">
                  <MacroProgressBar
                    label="Calories"
                    current={currentMacros.calories}
                    target={macroTargets.calories}
                    unit="kcal"
                    color="oklch(63.7% 0.237 25.331)"
                    icon={<Flame className="h-4 w-4 text-red-500" />}
                  />
                  <MacroProgressBar
                    label="Protein"
                    current={currentMacros.protein}
                    target={macroTargets.protein}
                    unit="g"
                    color="oklch(70.4% 0.191 22.216)"
                    icon={<Beef className="h-4 w-4 text-red-400" />}
                  />
                  <MacroProgressBar
                    label="Carbs"
                    current={currentMacros.carbs}
                    target={macroTargets.carbs}
                    unit="g"
                    color="oklch(68.1% 0.162 75.834)"
                    icon={<Zap className="h-4 w-4 text-yellow-600" />}
                  />
                  <MacroProgressBar
                    label="Fat"
                    current={currentMacros.fat}
                    target={macroTargets.fat}
                    unit="g"
                    color="oklch(85.2% 0.199 91.936)"
                    icon={<Droplets className="h-4 w-4 text-yellow-400" />}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Calendar (visible only on desktop) */}
          <div className="hidden lg:block space-y-6">
            <Card>
              <CardContent>
                <FoodCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Calendar Modal for Mobile */}
      <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
        <DialogContent
          className={`bg-card max-h-[80vh] ${
            isMobile ? "max-w-[95vw] w-[95vw] px-4 py-6" : "max-w-2xl"
          }`}
        >
          <DialogHeader className="mb-2">
            <DialogTitle>Select Date</DialogTitle>
            <DialogDescription>
              Choose a date to view your food log
            </DialogDescription>
          </DialogHeader>
          <FoodCalendar
            selectedDate={selectedDate}
            onSelectDate={handleCalendarDateSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Add Food Modal */}
      <FoodSearchModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        onFoodAdded={handleFoodAdded}
        mealType={selectedMeal}
      />
    </div>
  );
}
