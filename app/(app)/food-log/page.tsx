"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Droplets,
  EllipsisVertical,
  CheckCircle,
  Trash2,
  Copy,
  RotateCcw,
  ArrowLeftRight,
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
import {
  FiberIcon,
  SugarIcon,
  SodiumIcon,
  CholesterolIcon,
  AvocadoIcon,
  ProteinIcon,
  FlameIcon,
  CarbsIcon,
} from "@/components/icons/nutrition-icons";
import { BaseFood, Foods } from "@/interfaces/food-log-interfaces";
import FoodCalendar from "./food-calendar";
import MealAccordion from "./meal-accordion";
import MacroProgressBar from "./macro-progress-bar";
import PageTitle from "@/components/global/page-title";
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
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditFood, setCurrentEditFood] = useState<Foods | null>(null);
  const [view, setView] = useState<"consumed" | "remaining">(
    (localStorage.getItem("foodLogView") as "consumed" | "remaining") ||
      "consumed"
  );

  const [addFoodLog, { isLoading: isAddingFoodLog }] = useAddFoodLogMutation();
  const { data: foodLog, isLoading: isLoadingFoodLog } = useGetFoodLogQuery({
    userId: user?.user_id,
    date: selectedDate.toLocaleDateString("en-CA"), // Convert Date to YYYY-MM-DD string
  });

  const [deleteFoodLog, { isLoading: isDeletingFoodLog }] =
    useDeleteFoodLogMutation();
  const [updateFoodLog, { isLoading: isUpdatingFoodLog }] =
    useUpdateFoodLogMutation();

  const macroTargets: MacroTargets = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
  };

  const getTotalNutrients = () => {
    if (!foodLog?.data?.foodLog)
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        cholesterol: 0,
      };

    const allFoods = [
      ...(foodLog.data.foodLog.foods.uncategorized || []),
      ...(foodLog.data.foodLog.foods.breakfast || []),
      ...(foodLog.data.foodLog.foods.lunch || []),
      ...(foodLog.data.foodLog.foods.dinner || []),
      ...(foodLog.data.foodLog.foods.snacks || []),
    ];

    return allFoods.reduce(
      (totals, food) => {
        return {
          calories: totals.calories + parseFloat(food.calories),
          protein: totals.protein + parseFloat(food.protein),
          carbs: totals.carbs + parseFloat(food.carbs),
          fat: totals.fat + parseFloat(food.fat),
          fiber: totals.fiber + parseFloat(food.fiber),
          sugar: totals.sugar + parseFloat(food.sugar),
          sodium: totals.sodium + parseFloat(food.sodium),
          cholesterol: totals.cholesterol + parseFloat(food.cholesterol),
        };
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        cholesterol: 0,
      }
    );
  };

  const totalNutrients = getTotalNutrients();

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

  const handleEditFood = (foodId: string) => {
    // Find the food to edit in the current food log data
    if (!foodLog?.data?.foodLog) return;

    const allFoods = [
      ...(foodLog.data.foodLog.foods.uncategorized || []),
      ...(foodLog.data.foodLog.foods.breakfast || []),
      ...(foodLog.data.foodLog.foods.lunch || []),
      ...(foodLog.data.foodLog.foods.dinner || []),
      ...(foodLog.data.foodLog.foods.snacks || []),
    ];

    const foodToEdit = allFoods.find((food) => food.foodId === foodId);

    if (foodToEdit) {
      setCurrentEditFood(foodToEdit);
      setIsEditMode(true);
      setIsAddFoodModalOpen(true);
    }
  };

  const handleRemoveFood = async (foodId: string, foodLogId: string) => {
    try {
      await deleteFoodLog({ foodId, foodLogId }).unwrap();
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to delete food log");
      }
    }
  };

  const handleUpdateFood = async (updatedFood: Partial<Foods>) => {
    if (!updatedFood.foodId) return;

    // Build payload with only the fields that have been provided (changed)
    const payload: { [key: string]: string } = {};

    if (updatedFood.loggedServingSize !== undefined) {
      payload.serving_size = updatedFood.loggedServingSize;
    }

    if (updatedFood.loggedServingSizeUnit !== undefined) {
      payload.serving_size_unit = updatedFood.loggedServingSizeUnit;
    }

    // Don't send request if no fields to update
    if (Object.keys(payload).length === 0) {
      toast.info("No changes to update");
      return;
    }

    try {
      await updateFoodLog({
        foodId: updatedFood.foodId,
        payload,
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
                      <DropdownMenuItem onClick={() => {}}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isLogCompleted
                          ? "Mark Day Incomplete"
                          : "Mark Day Complete"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {}}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Day
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Copy from Previous Day
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {}}
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
                    foods={foodLog?.data?.foodLog.foods.uncategorized || []}
                    isExpanded={expandedMeals.has("uncategorized")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    isDeletingFoodLog={isDeletingFoodLog}
                  />
                  <MealAccordion
                    mealType="breakfast"
                    title="Breakfast"
                    foods={foodLog?.data?.foodLog.foods.breakfast || []}
                    isExpanded={expandedMeals.has("breakfast")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    isDeletingFoodLog={isDeletingFoodLog}
                  />
                  <MealAccordion
                    mealType="lunch"
                    title="Lunch"
                    foods={foodLog?.data?.foodLog.foods.lunch || []}
                    isExpanded={expandedMeals.has("lunch")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    isDeletingFoodLog={isDeletingFoodLog}
                  />
                  <MealAccordion
                    mealType="dinner"
                    title="Dinner"
                    foods={foodLog?.data?.foodLog.foods.dinner || []}
                    isExpanded={expandedMeals.has("dinner")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
                    isDeletingFoodLog={isDeletingFoodLog}
                  />
                  <MealAccordion
                    mealType="snacks"
                    title="Snacks"
                    foods={foodLog?.data?.foodLog.foods.snacks || []}
                    isExpanded={expandedMeals.has("snacks")}
                    onToggle={toggleMealExpansion}
                    onAddFood={handleAddFood}
                    onEditFood={handleEditFood}
                    onRemoveFood={handleRemoveFood}
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
                <div
                  className={`flex ${
                    isMobile ? "flex-col gap-2" : "justify-between items-center"
                  }`}
                >
                  <div>
                    <CardTitle>Daily Nutrition</CardTitle>
                    <CardDescription>
                      Track your macronutrients and calories
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="secondary"
                      className="w-[130px]"
                      onClick={() => {
                        setView(view === "consumed" ? "remaining" : "consumed");
                        localStorage.setItem(
                          "foodLogView",
                          view === "consumed" ? "remaining" : "consumed"
                        );
                      }}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      {view === "consumed" ? "Remaining" : "Consumed"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-6">
                  <MacroProgressBar
                    label="Calories"
                    current={totalNutrients.calories}
                    target={macroTargets.calories}
                    unit="kcal"
                    color="oklch(70.7% 0.022 261.325)"
                    icon={<FlameIcon />}
                    view={view}
                    bgColor="bg-gray-200"
                  />
                  <MacroProgressBar
                    label="Protein"
                    current={totalNutrients.protein}
                    target={macroTargets.protein}
                    unit="g"
                    color="oklch(79.2% 0.209 151.711)"
                    // icon={<Beef className="h-4 w-4 text-green-400" />}
                    icon={<ProteinIcon />}
                    view={view}
                    bgColor="bg-green-200"
                  />
                  <MacroProgressBar
                    label="Carbs"
                    current={totalNutrients.carbs}
                    target={macroTargets.carbs}
                    unit="g"
                    color="#60a5fa"
                    icon={<CarbsIcon />}
                    view={view}
                    bgColor="bg-blue-200"
                  />
                  <MacroProgressBar
                    label="Fat"
                    current={totalNutrients.fat}
                    target={macroTargets.fat}
                    unit="g"
                    color="oklch(70.4% 0.191 22.216)"
                    icon={<AvocadoIcon />}
                    view={view}
                    bgColor="bg-red-200"
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
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiberIcon />
                      <span className="font-medium text-sm">Fiber</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(totalNutrients.fiber)} g
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <SugarIcon />
                      <span className="font-medium text-sm">Sugar</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(totalNutrients.sugar)} g
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <SodiumIcon />
                      <span className="font-medium text-sm">Sodium</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(totalNutrients.sodium)} mg
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CholesterolIcon />
                      <span className="font-medium text-sm">Cholesterol</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(totalNutrients.cholesterol)} mg
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
