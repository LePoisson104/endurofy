"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  CalendarIcon,
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  Apple,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import FoodSearchModal from "./food-search-modal";
import FoodCalendar from "./food-calendar";
import PageTitle from "@/components/global/page-title";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

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
  const isDark = useGetCurrentTheme();
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

  const handleAddFood = (meal: keyof MealData) => {
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

  const MacroProgressBar = ({
    label,
    current,
    target,
    unit,
    color,
    bgColor,
  }: {
    label: string;
    current: number;
    target: number;
    unit: string;
    color: string;
    bgColor: string;
  }) => {
    const percentage = Math.min((current / target) * 100, 100);

    return (
      <div
        className={`space-y-1 ${
          isMobile ? "flex-col" : "flex"
        } w-full items-center`}
      >
        <div
          className={`flex justify-between text-sm ${
            isMobile ? "w-full" : "w-[30%]"
          }`}
        >
          <span className="font-medium">{label}</span>
        </div>
        <div className={`flex flex-col ${isMobile ? "w-full" : "w-[70%]"}`}>
          <div className="flex justify-between w-full">
            <span className="text-primary text-sm">
              {Math.round(current)}/{target} {unit}
            </span>
            <div className="text-sm text-primary">
              {Math.round(percentage)}%
            </div>
          </div>
          <div
            className="relative w-full rounded-full h-2.5 bg-secondary"
            style={{ backgroundColor: current ? bgColor : "" }}
          >
            <div
              className="h-2.5 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: `${color}`,
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const MealAccordion = ({
    mealType,
    title,
    foods,
  }: {
    mealType: keyof MealData;
    title: string;
    foods: FoodItem[];
  }) => {
    const mealMacros = getMealMacros(foods);
    const isExpanded = expandedMeals.has(mealType);

    return (
      <div className="border-b border-border">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1 h-[60px]"
            onClick={() => toggleMealExpansion(mealType)}
          >
            <Button
              onClick={() => handleAddFood(mealType)}
              size="sm"
              variant="ghost"
              className="p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <div
              className={`flex ${
                isMobile
                  ? "flex-col items-start"
                  : "justify-between items-center"
              } w-full`}
            >
              <span className="font-medium text-sm">{title}</span>
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
                  <Apple className="h-5 w-5 text-muted-foreground text-red-400" />
                  <p className="text-sm">No foods added yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => handleAddFood(mealType)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Food
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Apple className="h-3 w-3 text-destructive" />
                          <p className="font-medium text-sm">{food.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {food.quantity} {food.unit} •{" "}
                          {Math.round(food.calories * food.quantity)} cal
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
                              onClick={() => handleEditFood(mealType, food.id)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemoveFood(mealType, food.id)
                              }
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleFavoriteFood(mealType, food.id)
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
                  />
                  <MealAccordion
                    mealType="breakfast"
                    title="Breakfast"
                    foods={mealData.breakfast}
                  />
                  <MealAccordion
                    mealType="lunch"
                    title="Lunch"
                    foods={mealData.lunch}
                  />
                  <MealAccordion
                    mealType="dinner"
                    title="Dinner"
                    foods={mealData.dinner}
                  />
                  <MealAccordion
                    mealType="snacks"
                    title="Snacks"
                    foods={mealData.snacks}
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
                    color="#EF4444"
                    bgColor="#FECACA"
                  />
                  <MacroProgressBar
                    label="Protein"
                    current={currentMacros.protein}
                    target={macroTargets.protein}
                    unit="g"
                    color="#10B981"
                    bgColor="#A7F3D0"
                  />
                  <MacroProgressBar
                    label="Carbs"
                    current={currentMacros.carbs}
                    target={macroTargets.carbs}
                    unit="g"
                    color="#3B82F6"
                    bgColor="#93C5FD"
                  />
                  <MacroProgressBar
                    label="Fat"
                    current={currentMacros.fat}
                    target={macroTargets.fat}
                    unit="g"
                    color="#EAB308"
                    bgColor="#FEF3C7"
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
