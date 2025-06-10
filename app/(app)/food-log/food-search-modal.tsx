"use client";

import { useState } from "react";
import { Search, Plus, Star, StarOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

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

interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  servingUnit: string;
  isFavorite?: boolean;
  isCustom?: boolean;
}

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: (food: FoodItem) => void;
  mealType: string;
}

export default function FoodSearchModal({
  isOpen,
  onClose,
  onFoodAdded,
  mealType,
}: FoodSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(
    null
  );
  const [quantity, setQuantity] = useState("1");
  const [activeTab, setActiveTab] = useState("all");

  // Mock food database - replace with actual API calls
  const mockFoods: FoodSearchResult[] = [
    {
      id: "1",
      name: "Chicken Breast",
      brand: "Generic",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      servingSize: "100",
      servingUnit: "g",
      isFavorite: true,
    },
    {
      id: "2",
      name: "Brown Rice",
      brand: "Generic",
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      servingSize: "100",
      servingUnit: "g",
      isFavorite: false,
    },
    {
      id: "3",
      name: "Banana",
      brand: "Fresh",
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      servingSize: "1",
      servingUnit: "medium",
      isFavorite: true,
    },
    {
      id: "4",
      name: "Greek Yogurt",
      brand: "Chobani",
      calories: 100,
      protein: 17,
      carbs: 6,
      fat: 0,
      servingSize: "170",
      servingUnit: "g",
      isFavorite: false,
    },
    {
      id: "5",
      name: "My Protein Shake",
      brand: "Custom",
      calories: 250,
      protein: 30,
      carbs: 15,
      fat: 5,
      servingSize: "1",
      servingUnit: "serving",
      isCustom: true,
    },
  ];

  const filteredFoods = mockFoods.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.brand &&
        food.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "favorites") {
      return matchesSearch && food.isFavorite;
    }
    if (activeTab === "custom") {
      return matchesSearch && food.isCustom;
    }
    return matchesSearch;
  });

  const handleAddFood = () => {
    if (!selectedFood) return;

    const quantityNum = parseFloat(quantity) || 1;
    const foodItem: FoodItem = {
      id: `${selectedFood.id}-${Date.now()}`,
      name: selectedFood.name,
      calories: selectedFood.calories,
      protein: selectedFood.protein,
      carbs: selectedFood.carbs,
      fat: selectedFood.fat,
      quantity: quantityNum,
      unit: selectedFood.servingUnit,
    };

    onFoodAdded(foodItem);
    setSelectedFood(null);
    setQuantity("1");
    setSearchQuery("");
  };

  const toggleFavorite = (foodId: string) => {
    // In a real app, this would update the backend
    console.log("Toggle favorite for food:", foodId);
  };

  const FoodCard = ({ food }: { food: FoodSearchResult }) => {
    const isSelected = selectedFood?.id === food.id;

    return (
      <div
        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onClick={() => setSelectedFood(food)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{food.name}</h4>
            {food.brand && (
              <p className="text-xs text-muted-foreground">{food.brand}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {food.isCustom && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(food.id);
              }}
              className="h-6 w-6 p-0"
            >
              {food.isFavorite ? (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Per {food.servingSize} {food.servingUnit}
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">{food.calories}</div>
            <div className="text-muted-foreground">cal</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{food.protein}g</div>
            <div className="text-muted-foreground">protein</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{food.carbs}g</div>
            <div className="text-muted-foreground">carbs</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{food.fat}g</div>
            <div className="text-muted-foreground">fat</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Food to {mealType}</DialogTitle>
          <DialogDescription>
            Search for foods and add them to your meal
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-hidden">
              <div className="h-64 overflow-y-auto space-y-2">
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? "No foods found"
                      : "Start typing to search for foods"}
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="flex-1 overflow-hidden">
              <div className="h-64 overflow-y-auto space-y-2">
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No favorite foods found
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="flex-1 overflow-hidden">
              <div className="h-64 overflow-y-auto space-y-2">
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No custom foods found</p>
                    <Button variant="outline" className="mt-2" size="sm">
                      Create Custom Food
                    </Button>
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Selected Food and Quantity */}
          {selectedFood && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{selectedFood.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedFood.calories} cal per {selectedFood.servingSize}{" "}
                    {selectedFood.servingUnit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label>Unit</Label>
                  <div className="mt-1 p-2 bg-muted rounded text-sm">
                    {selectedFood.servingUnit}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span>Total Calories:</span>
                <span className="font-medium">
                  {Math.round(
                    selectedFood.calories * parseFloat(quantity || "1")
                  )}{" "}
                  cal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddFood} disabled={!selectedFood}>
            <Plus className="h-4 w-4 mr-2" />
            Add Food
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
