"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Beef,
  Zap,
  Droplets,
  Flame,
  Wheat,
  Candy,
  Heart,
  EllipsisVertical,
  CheckCircle,
  Trash2,
  Copy,
  RotateCcw,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { FoodSearchModal, WeekSelector, type FoodItem } from "./";
import FoodCalendar from "./food-calendar";
import MealAccordion from "./meal-accordion";
import MacroProgressBar from "./macro-progress-bar";
import PageTitle from "@/components/global/page-title";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import WaterIntake from "./water-intake";

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
  const isDark = useGetCurrentTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<keyof MealData>("breakfast");
  const [expandedMeals, setExpandedMeals] = useState<Set<keyof MealData>>(
    new Set()
  );
  const [isLogCompleted, setIsLogCompleted] = useState(false);
  const [copiedMealData, setCopiedMealData] = useState<MealData | null>(null);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);

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

  // Calculate additional nutrients
  const calculateAdditionalNutrients = () => {
    const allFoods = [
      ...mealData.uncategorized,
      ...mealData.breakfast,
      ...mealData.lunch,
      ...mealData.dinner,
      ...mealData.snacks,
    ];

    return allFoods.reduce(
      (totals, food) => ({
        fiber: totals.fiber + (food.fiber || 0) * food.quantity,
        sugar: totals.sugar + (food.sugar || 0) * food.quantity,
        sodium: totals.sodium + (food.sodium || 0) * food.quantity,
        cholesterol:
          totals.cholesterol + (food.cholesterol || 0) * food.quantity,
      }),
      { fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 }
    );
  };

  const additionalNutrients = calculateAdditionalNutrients();

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
    setIsLogCompleted(false); // Reset completion status when changing dates
    if (isMobile) {
      setIsCalendarModalOpen(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setIsLogCompleted(false); // Reset completion status when changing dates
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

  // Dropdown menu handlers
  const handleMarkDayComplete = () => {
    setIsLogCompleted(!isLogCompleted);
    // TODO: Add any backend logic for marking day complete
    console.log("Day completion status:", !isLogCompleted);
  };

  const handleClearAll = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all meals for this day?"
    );
    if (confirmClear) {
      setMealData({
        uncategorized: [],
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      });
      console.log("All meals cleared");
    }
  };

  const handleCopyDay = () => {
    setCopiedMealData(mealData);
    // TODO: Could also copy to clipboard as JSON if needed
    console.log("Day copied to memory");
    // Optional: Show a toast notification
  };

  const handleCopyFromPreviousDay = () => {
    // TODO: Replace with actual logic to fetch previous day's data
    if (copiedMealData) {
      setMealData(copiedMealData);
      console.log("Copied meals from memory");
    } else {
      // Mock implementation - you would fetch from backend
      console.log(
        "No copied data available. In real app, would fetch from previous day"
      );
      // For now, show an alert
      alert(
        "No copied day data available. Use 'Copy Day' first or implement backend integration."
      );
    }
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
              Full Calendar
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Week Selector */}
      {isMobile && (
        <div className="pt-4">
          <WeekSelector
            selectedDate={selectedDate}
            onSelectDate={handleDateChange}
          />
        </div>
      )}

      <main className="flex-1 pt-6">
        <div className="grid grid-cols-1 gap-[1rem] lg:grid-cols-4">
          {/* Left side - Food Log */}
          <div className="lg:col-span-3 space-y-6">
            {/* Meals */}
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle>Meals</CardTitle>
                  <CardDescription>
                    Add and track your daily meals
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleMarkDayComplete}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isLogCompleted
                          ? "Mark Day Incomplete"
                          : "Mark Day Complete"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleCopyDay}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Day
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyFromPreviousDay}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Copy from Previous Day
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleClearAll}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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

                  {/* Water Intake Accordion - Mobile Only */}
                  {isMobile && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="water-intake"
                        className="border-none"
                      >
                        <AccordionTrigger className="px-0 py-4 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-left">
                                <h3 className="font-semibold">Water Intake</h3>
                                <p className="text-sm text-gray-500">
                                  0ml / 2500ml today
                                </p>
                              </div>
                            </div>
                            <div className="text-right"></div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-4">
                          <div className="space-y-4">
                            {/* Progress Bar */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">
                                  Daily Goal
                                </span>
                                <span className="text-sm font-semibold">
                                  0%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
                                  style={{ width: `0%` }}
                                />
                              </div>
                            </div>

                            {/* Add Water Button */}
                            <Dialog
                              open={isWaterModalOpen}
                              onOpenChange={setIsWaterModalOpen}
                            >
                              <DialogTrigger asChild>
                                <Button className="w-full" size="lg">
                                  <Droplets className="h-4 w-4 mr-2" />
                                  Add Water Intake
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto bg-card">
                                <DialogHeader>
                                  <DialogTitle>
                                    Water Intake Tracker
                                  </DialogTitle>
                                </DialogHeader>
                                <WaterIntake />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
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
                    color="#34d399"
                    icon={
                      <Beef className="h-4 w-4" style={{ color: "#34d399" }} />
                    }
                  />
                  <MacroProgressBar
                    label="Carbs"
                    current={currentMacros.carbs}
                    target={macroTargets.carbs}
                    unit="g"
                    color="#60a5fa"
                    icon={
                      <Zap className="h-4 w-4" style={{ color: "#60a5fa" }} />
                    }
                  />
                  <MacroProgressBar
                    label="Fat"
                    current={currentMacros.fat}
                    target={macroTargets.fat}
                    unit="g"
                    color="#f87171"
                    icon={
                      <Droplets
                        className="h-4 w-4"
                        style={{ color: "#f87171" }}
                      />
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Nutrients */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Nutrients</CardTitle>
                <CardDescription>
                  Track your fiber, sugar, sodium, and cholesterol intake
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wheat className="h-4 w-4 text-amber-400" />
                      <span className="font-medium text-sm">Fiber</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(additionalNutrients.fiber)} g
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Candy className="h-4 w-4 text-rose-400" />
                      <span className="font-medium text-sm">Sugar</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(additionalNutrients.sugar)} g
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      {/* <Pill className="h-4 w-4 text-blue-500" /> */}
                      <p
                        className={`${
                          isDark ? "text-gray-400" : "text-gray-600"
                        } text-sm`}
                      >
                        Na
                      </p>
                      <span className="font-medium text-sm">Sodium</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(additionalNutrients.sodium)} mg
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span className="font-medium text-sm">Cholesterol</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(additionalNutrients.cholesterol)} mg
                    </span>
                  </div>
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
                  onSelectDate={handleDateChange}
                />
              </CardContent>
            </Card>

            {/* Water Intake - Desktop Only (Mobile is in Meals section) */}
            {!isMobile && (
              <div className="bg-card rounded-xl shadow-sm p-6">
                <WaterIntake />
              </div>
            )}
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
