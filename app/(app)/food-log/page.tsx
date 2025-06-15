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

  const MacroProgressBar = ({
    label,
    current,
    target,
    unit,
    color,
  }: {
    label: string;
    current: number;
    target: number;
    unit: string;
    color: string;
  }) => {
    const percentage = Math.min((current / target) * 100, 100);

    // Define color values for each macro
    const getColorValue = (color: string) => {
      switch (color) {
        case "blue":
          return "#3b82f6"; // blue-500
        case "red":
          return "#ef4444"; // red-500
        case "green":
          return "#10b981"; // emerald-500
        case "yellow":
          return "#f59e0b"; // amber-500
        default:
          return "hsl(var(--primary))";
      }
    };

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
            <span className="text-muted-foreground text-sm">
              {Math.round(current)}/{target} {unit}
            </span>
            <div className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </div>
          </div>
          <div className="relative w-full bg-secondary rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: getColorValue(color),
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

    return (
      <AccordionItem value={mealType}>
        <AccordionTrigger className="hover:no-underline">
          <div
            className={`flex ${
              isMobile ? "flex-col items-start" : "justify-between items-center"
            } w-full pr-4`}
          >
            <span className="font-medium">{title}</span>
            <div
              className={`${
                isMobile ? "flex gap-4 mt-1 items-center" : "flex-col items-end"
              } text-sm text-muted-foreground`}
            >
              <div className="flex gap-2 text-xs">
                <span>{Math.round(mealMacros.calories)} kcal</span>
                <span>•</span>
                <span>P: {Math.round(mealMacros.protein)}g</span>3<span>•</span>
                <span>C: {Math.round(mealMacros.carbs)}g</span>
                <span>•</span>
                <span>F: {Math.round(mealMacros.fat)}g</span>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            {foods.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center border border-dashed border-slate-300 rounded-lg">
                No foods added yet
              </p>
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
                            onClick={() => handleRemoveFood(mealType, food.id)}
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
            <Button
              onClick={() => handleAddFood(mealType)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Food
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
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
                <Accordion type="multiple" defaultValue={[]}>
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
                </Accordion>
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
                    color="blue"
                  />
                  <MacroProgressBar
                    label="Protein"
                    current={currentMacros.protein}
                    target={macroTargets.protein}
                    unit="g"
                    color="red"
                  />
                  <MacroProgressBar
                    label="Carbohydrates"
                    current={currentMacros.carbs}
                    target={macroTargets.carbs}
                    unit="g"
                    color="green"
                  />
                  <MacroProgressBar
                    label="Fat"
                    current={currentMacros.fat}
                    target={macroTargets.fat}
                    unit="g"
                    color="yellow"
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
        <DialogContent className="max-w-md">
          <DialogHeader>
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
