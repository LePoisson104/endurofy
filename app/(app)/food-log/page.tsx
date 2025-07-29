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
import {
  FoodSearchModal,
  FoodSelectionModal,
  WeekSelector,
  type AddFoodLogPayload,
} from "./";
import { FoodLogs } from "@/interfaces/food-log-interfaces";
import FoodCalendar from "./food-calendar";
import MealAccordion from "./meal-accordion";
import MacroProgressBar from "./macro-progress-bar";
import PageTitle from "@/components/global/page-title";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import WaterIntake from "./water-intake";
import {
  useAddFoodLogMutation,
  useGetFoodLogQuery,
  useDeleteFoodLogMutation,
  useUpdateFoodLogMutation,
} from "@/api/food/food-log-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { toast } from "sonner";

interface MealData {
  uncategorized: AddFoodLogPayload[];
  breakfast: AddFoodLogPayload[];
  lunch: AddFoodLogPayload[];
  dinner: AddFoodLogPayload[];
  snacks: AddFoodLogPayload[];
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
  const user = useSelector(selectCurrentUser);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Initialize with saved date from localStorage or current date
    if (typeof window !== "undefined") {
      const savedDate = localStorage.getItem("foodLogSelectedDate");
      if (savedDate) {
        return new Date(savedDate);
      }
    }
    return new Date();
  });
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<keyof MealData>("breakfast");
  const [expandedMeals, setExpandedMeals] = useState<Set<keyof MealData>>(
    new Set()
  );
  const [isLogCompleted, setIsLogCompleted] = useState(false);
  const [copiedMealData, setCopiedMealData] = useState<MealData | null>(null);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditFood, setCurrentEditFood] = useState<FoodLogs | null>(null);

  const [
    addFoodLog,
    { isLoading: isAddingFoodLog, isSuccess: isFoodLogAdded },
  ] = useAddFoodLogMutation();
  const { data: foodLog, isLoading: isLoadingFoodLog } = useGetFoodLogQuery({
    userId: user?.user_id,
    date: selectedDate.toLocaleDateString("en-CA"), // Convert Date to YYYY-MM-DD string
  });

  const [deleteFoodLog, { isLoading: isDeletingFoodLog }] =
    useDeleteFoodLogMutation();
  const [updateFoodLog, { isLoading: isUpdatingFoodLog }] =
    useUpdateFoodLogMutation();
  console.log(foodLog?.data?.data);
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
    if (!foodLog?.data?.data)
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const allFoods = [
      ...(foodLog.data.data.uncategorized || []),
      ...(foodLog.data.data.breakfast || []),
      ...(foodLog.data.data.lunch || []),
      ...(foodLog.data.data.dinner || []),
      ...(foodLog.data.data.snacks || []),
    ];

    return allFoods.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories * (food.serving_size / 100),
        protein: totals.protein + food.protein_g * (food.serving_size / 100),
        carbs: totals.carbs + food.carbs_g * (food.serving_size / 100),
        fat: totals.fat + food.fat_g * (food.serving_size / 100),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const currentMacros = calculateCurrentMacros();

  // Calculate additional nutrients
  const calculateAdditionalNutrients = () => {
    if (!foodLog?.data?.data)
      return { fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 };

    const allFoods = [
      ...(foodLog.data.data.uncategorized || []),
      ...(foodLog.data.data.breakfast || []),
      ...(foodLog.data.data.lunch || []),
      ...(foodLog.data.data.dinner || []),
      ...(foodLog.data.data.snacks || []),
    ];

    return allFoods.reduce(
      (totals, food) => ({
        fiber: totals.fiber + (food.fiber_g || 0) * (food.serving_size / 100),
        sugar: totals.sugar + (food.sugar_g || 0) * (food.serving_size / 100),
        sodium:
          totals.sodium + (food.sodium_mg || 0) * (food.serving_size / 100),
        cholesterol:
          totals.cholesterol +
          (food.cholesterol_mg || 0) * (food.serving_size / 100),
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

  const handleFoodAdded = async (food: AddFoodLogPayload) => {
    food.mealType = selectedMeal;
    food.loggedAt = selectedDate;
    try {
      await addFoodLog({
        userId: user?.user_id,
        payload: food,
      }).unwrap();
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to add food log");
      }
      // Re-throw the error so the calling function knows it failed
      throw error;
    }
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedDate(date);
    localStorage.setItem("foodLogSelectedDate", date.toISOString());
    setIsLogCompleted(false); // Reset completion status when changing dates
    if (isMobile) {
      setIsCalendarModalOpen(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    localStorage.setItem("foodLogSelectedDate", date.toISOString());
    setIsLogCompleted(false); // Reset completion status when changing dates
  };

  const handleEditFood = (mealType: keyof MealData, foodId: string) => {
    // Find the food to edit in the current food log data
    if (!foodLog?.data?.data) return;

    const allFoods = [
      ...(foodLog.data.data.uncategorized || []),
      ...(foodLog.data.data.breakfast || []),
      ...(foodLog.data.data.lunch || []),
      ...(foodLog.data.data.dinner || []),
      ...(foodLog.data.data.snacks || []),
    ];

    const foodToEdit = allFoods.find((food) => food.food_log_id === foodId);

    if (foodToEdit) {
      setCurrentEditFood(foodToEdit);
      setIsEditMode(true);
      setIsAddFoodModalOpen(true);
    }
  };

  const handleRemoveFood = async (foodLogId: string) => {
    try {
      await deleteFoodLog({ foodLogId }).unwrap();
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to delete food log");
      }
    }
  };

  const handleFavoriteFood = (mealType: keyof MealData, foodId: string) => {
    // TODO: Implement favorite functionality
    console.log("Favorite food:", { mealType, foodId });
  };

  const handleUpdateFood = async (updatedFood: Partial<FoodLogs>) => {
    if (!updatedFood.food_log_id) return;

    try {
      await updateFoodLog({
        foodLogId: updatedFood.food_log_id,
        payload: {
          serving_size: updatedFood.serving_size,
          serving_size_unit: updatedFood.serving_size_unit,
        },
      }).unwrap();

      setIsAddFoodModalOpen(false);
      setIsEditMode(false);
      setCurrentEditFood(null);
      toast.success("Food updated successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to update food log");
      }
    }
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

  const getMealCalories = (meal: FoodLogs[]) => {
    return meal.reduce(
      (total, food) => total + food.calories * (food.serving_size / 100),
      0
    );
  };

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
                        variant="destructive"
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
                    foods={foodLog?.data?.data?.uncategorized || []}
                    isExpanded={expandedMeals.has("uncategorized")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                    isDeletingFoodLog={isDeletingFoodLog}
                  />
                  <MealAccordion
                    mealType="breakfast"
                    title="Breakfast"
                    foods={foodLog?.data?.data?.breakfast || []}
                    isExpanded={expandedMeals.has("breakfast")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                    isDeletingFoodLog={isDeletingFoodLog}
                  />
                  <MealAccordion
                    mealType="lunch"
                    title="Lunch"
                    foods={foodLog?.data?.data?.lunch || []}
                    isExpanded={expandedMeals.has("lunch")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                    isDeletingFoodLog={isDeletingFoodLog}
                  />
                  <MealAccordion
                    mealType="dinner"
                    title="Dinner"
                    foods={foodLog?.data?.data?.dinner || []}
                    isExpanded={expandedMeals.has("dinner")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                    isDeletingFoodLog={isDeletingFoodLog}
                  />
                  <MealAccordion
                    mealType="snacks"
                    title="Snacks"
                    foods={foodLog?.data?.data?.snacks || []}
                    isExpanded={expandedMeals.has("snacks")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    onFavoriteFood={handleFavoriteFood}
                    isDeletingFoodLog={isDeletingFoodLog}
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
                    color="oklch(70.7% 0.022 261.325)"
                    icon={<Flame className="h-4 w-4 text-gray-400" />}
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
                    color="#60a5fa"
                    icon={<Zap className="h-4 w-4 text-blue-400" />}
                  />
                  <MacroProgressBar
                    label="Fat"
                    current={currentMacros.fat}
                    target={macroTargets.fat}
                    unit="g"
                    color="oklch(82.8% 0.189 84.429)"
                    icon={<Droplets className="h-4 w-4 text-amber-400" />}
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

      {/* Add/Edit Food Modal */}
      {isEditMode ? (
        <FoodSelectionModal
          isOpen={isAddFoodModalOpen}
          onClose={() => {
            setIsAddFoodModalOpen(false);
            setIsEditMode(false);
            setCurrentEditFood(null);
          }}
          food={null}
          editFood={currentEditFood}
          mode="edit"
          onConfirm={() => {}}
          onUpdate={handleUpdateFood}
          isAddingFoodLog={isUpdatingFoodLog}
        />
      ) : (
        <FoodSearchModal
          isOpen={isAddFoodModalOpen}
          onClose={() => setIsAddFoodModalOpen(false)}
          onFoodAdded={handleFoodAdded}
          mealType={selectedMeal}
          isAddingFoodLog={isAddingFoodLog}
        />
      )}
    </div>
  );
}
