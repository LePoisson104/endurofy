"use client";

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
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
import type {
  FoodSearchModalProps,
  FoodSearchResult,
  FoodItem,
  AddCustomFoodPayload,
} from "../../../interfaces/food-log-interfaces";
import FoodCard from "./food-card";
import FoodSelectionModal from "./food-selection-modal";
import CustomFoodModal from "./custom-food-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchFoodQuery } from "@/api/food/food-api-slice";

export default function FoodSearchModal({
  isOpen,
  onClose,
  onFoodAdded,
  mealType,
}: FoodSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(
    null
  );
  const [showFoodSelection, setShowFoodSelection] = useState(false);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const isMobile = useIsMobile();

  // Debounce the search query with a 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Only make API call when debounced query has content and modal is open
  const { data: searchResults, isLoading } = useSearchFoodQuery(
    {
      searchItem: debouncedSearchQuery,
    },
    {
      skip: !debouncedSearchQuery.trim() || !isOpen,
    }
  );

  // const filteredFoods = searchResults?.data?.filter(
  //   (food: FoodSearchResult) => {
  //     const matchesSearch =
  //       food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       (food.brand &&
  //         food.brand.toLowerCase().includes(searchQuery.toLowerCase()));

  //     if (activeTab === "favorites") {
  //       return matchesSearch && food.isFavorite;
  //     }
  //     if (activeTab === "custom") {
  //       return matchesSearch && food.isCustom;
  //     }
  //     return [];
  //   }
  // );

  const handleFoodSelect = (food: FoodSearchResult) => {
    setSelectedFood(food);
    setShowFoodSelection(true);
  };

  const handleFoodConfirm = (foodItem: FoodItem) => {
    onFoodAdded(foodItem);
    setShowFoodSelection(false);
    setSelectedFood(null);
    onClose();
  };

  const handleCustomFoodCreated = (customFood: AddCustomFoodPayload) => {};

  const toggleFavorite = (foodId: string) => {
    // In a real app, this would update the backend
    console.log("Toggle favorite for food:", foodId);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedFood(null);
    setActiveTab("all");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const handleCreateCustomFood = () => {
    setShowCustomFood(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={`max-w-2xl h-[80vh] overflow-hidden flex flex-col bg-card ${
            isMobile ? "w-[95vw]" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle>Add Food to {mealType}</DialogTitle>
            <DialogDescription>
              Search for foods and add them to your meal
            </DialogDescription>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateCustomFood}
              >
                Create Custom Food
              </Button>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <div className="flex justify-between items-center text-sm font-medium mt-4 border-b border-solid pb-2 px-2">
                <p>Description</p>
                <p>Source</p>
              </div>

              <TabsContent value="all" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto thin-scrollbar">
                  {searchResults?.data?.foods?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No foods found
                    </div>
                  ) : (
                    searchResults?.data?.foods?.map(
                      (food: FoodSearchResult) => (
                        <FoodCard
                          key={food.fdcId}
                          food={food}
                          onSelect={handleFoodSelect}
                          onToggleFavorite={toggleFavorite}
                        />
                      )
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="favorites" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-2 thin-scrollbar">
                  {/* {filteredFoods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No favorite foods found
                    </div>
                  ) : (
                    filteredFoods.map((food: FoodSearchResult) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onSelect={handleFoodSelect}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))
                  )} */}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-2 thin-scrollbar">
                  {/* {filteredFoods.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No custom foods found</p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        size="sm"
                        onClick={handleCreateCustomFood}
                      >
                        <Plus className="h-4 w-4" />
                        Create Custom Food
                      </Button>
                    </div>
                  ) : (
                    filteredFoods.map((food: FoodSearchResult) => (
                      <FoodCard
                        key={food.id}
                        food={food}
                        onSelect={handleFoodSelect}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))
                  )} */}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Food Selection Modal */}
      <FoodSelectionModal
        isOpen={showFoodSelection}
        onClose={() => {
          setShowFoodSelection(false);
          setSelectedFood(null);
        }}
        food={selectedFood}
        onConfirm={handleFoodConfirm}
      />

      {/* Custom Food Modal */}
      <CustomFoodModal
        isOpen={showCustomFood}
        onClose={() => setShowCustomFood(false)}
        onFoodCreated={handleCustomFoodCreated}
      />
    </>
  );
}
