"use client";

import { useState } from "react";
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
  AddFoodLogPayload,
  BaseFood,
} from "../../../interfaces/food-log-interfaces";
import FoodCard from "./food-card";
import FoodSelectionModal from "./food-selection-modal";
import CustomFoodModal from "./custom-food-modal";
import DeleteDialog from "@/components/dialog/delete-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useSearchFoodQuery,
  useGetCustomFoodsQuery,
  useDeleteCustomFoodMutation,
  useGetFavoriteFoodsQuery,
} from "@/api/food/food-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useSelector } from "react-redux";
import FoodCardSkeleton from "@/components/skeletons/foodcard-skeleton";
import { toast } from "sonner";

export default function FoodSearchModal({
  isOpen,
  onClose,
  onFoodAdded,
  mealType,
  isAddingFoodLog,
}: FoodSearchModalProps) {
  const isMobile = useIsMobile();
  const user = useSelector(selectCurrentUser);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFood, setSelectedFood] = useState<BaseFood | null>(null);
  const [showFoodSelection, setShowFoodSelection] = useState(false);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [editingFood, setEditingFood] = useState<BaseFood | null>(null);
  const [customFoodMode, setCustomFoodMode] = useState<"add" | "edit">("add");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<BaseFood | null>(null);

  // Debounce the search query with a 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Only make API call when debounced query has content and modal is open
  const { data: searchResults, isFetching } = useSearchFoodQuery(
    {
      userId: user?.user_id,
      searchItem: encodeURIComponent(debouncedSearchQuery),
    },
    {
      skip: !debouncedSearchQuery.trim() || !isOpen,
    }
  );

  const { data: customFoods, isFetching: isFetchingCustomFoods } =
    useGetCustomFoodsQuery(
      { userId: user?.user_id },
      {
        skip: activeTab !== "custom" || !isOpen,
      }
    );

  const { data: favoriteFoods, isFetching: isFetchingFavoriteFoods } =
    useGetFavoriteFoodsQuery(
      { userId: user?.user_id },
      {
        skip: activeTab !== "favorites" || !isOpen,
      }
    );

  const [deleteCustomFood, { isLoading: isDeletingFood }] =
    useDeleteCustomFoodMutation();

  // Helper function to filter foods based on search query for favorites and custom tabs
  const getFilteredFoods = (foods: BaseFood[] | undefined) => {
    if (!foods || !searchQuery.trim()) {
      return foods || [];
    }

    return foods.filter((food: BaseFood) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        food.foodName.toLowerCase().includes(searchLower) ||
        (food.foodBrand && food.foodBrand.toLowerCase().includes(searchLower))
      );
    });
  };

  // Apply filtering only to favorites and custom tabs
  const filteredFavoriteFoods = getFilteredFoods(
    favoriteFoods?.data?.favoriteFood
  );
  const filteredCustomFoods = getFilteredFoods(customFoods?.data?.customFood);

  const handleFoodSelect = (food: BaseFood) => {
    setSelectedFood(food);
    setShowFoodSelection(true);
  };

  const handleFoodConfirm = async (foodItem: AddFoodLogPayload) => {
    try {
      await onFoodAdded(foodItem);

      // Only close the modal after the food has been successfully added
      setShowFoodSelection(false);
      setSelectedFood(null);
    } catch (error) {
      // If there's an error, the modal will stay open so user can try again
      console.error("Failed to add food:", error);
    }
  };

  const toggleFavorite = (foodId: string) => {
    // In a real app, this would update the backend
    console.log("Toggle favorite for food:", foodId);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedFood(null);
    setActiveTab("all");
    setEditingFood(null);
    setCustomFoodMode("add");
    setShowDeleteDialog(false);
    setFoodToDelete(null);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  const handleCreateCustomFood = () => {
    setCustomFoodMode("add");
    setEditingFood(null);
    setShowCustomFood(true);
  };

  const handleEditFood = (food: BaseFood) => {
    setEditingFood(food);
    setCustomFoodMode("edit");
    setShowCustomFood(true);
  };

  const handleDeleteFood = (food: BaseFood) => {
    if ("customFoodId" in food) {
      setFoodToDelete(food);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteFood = async () => {
    if (foodToDelete) {
      try {
        const response = await deleteCustomFood({
          customFoodId: foodToDelete.foodId,
        });
        toast.success(
          response.data.data.message || "Food deleted successfully"
        );
        setShowDeleteDialog(false);
        setFoodToDelete(null);
      } catch (error: any) {
        if (error.data?.message) {
          toast.error(error.data.message);
        } else {
          toast.error("Failed to delete custom food");
        }
      }
    }
  };

  const handleCustomFoodModalClose = () => {
    setShowCustomFood(false);
    setEditingFood(null);
    setCustomFoodMode("add");
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
            <DialogTitle>Add food to {mealType}</DialogTitle>
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
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex justify-between items-center text-sm font-medium mt-4 border-b border-solid pb-2 px-2">
                <p>Description</p>
                {activeTab === "custom" ? <p>Actions</p> : <p>Source</p>}
              </div>

              <TabsContent value="all" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto thin-scrollbar">
                  {isFetching ? (
                    <FoodCardSkeleton />
                  ) : searchResults?.data?.foods?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No foods found
                    </div>
                  ) : (
                    searchResults?.data?.foods?.map((food: any) => (
                      <FoodCard
                        key={food.foodId}
                        food={food}
                        onSelect={handleFoodSelect}
                        onToggleFavorite={toggleFavorite}
                        foodSource="usda"
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="favorites" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-2 thin-scrollbar">
                  {isFetchingFavoriteFoods ? (
                    <FoodCardSkeleton />
                  ) : filteredFavoriteFoods?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery.trim()
                        ? "No matching favorite foods found"
                        : "No favorite foods found"}
                    </div>
                  ) : (
                    filteredFavoriteFoods?.map((food: BaseFood) => (
                      <FoodCard
                        key={food.foodId}
                        food={food}
                        onSelect={handleFoodSelect}
                        onToggleFavorite={toggleFavorite}
                        onEdit={handleEditFood}
                        onDelete={handleDeleteFood}
                        foodSource="favorite"
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-2 thin-scrollbar">
                  {isFetchingCustomFoods ? (
                    <FoodCardSkeleton />
                  ) : filteredCustomFoods?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery.trim()
                        ? "No matching custom foods found"
                        : "No custom foods found"}
                    </div>
                  ) : (
                    filteredCustomFoods?.map((food: BaseFood) => (
                      <FoodCard
                        key={food.foodId}
                        food={food}
                        onSelect={handleFoodSelect}
                        onToggleFavorite={toggleFavorite}
                        onEdit={handleEditFood}
                        onDelete={handleDeleteFood}
                        foodSource="custom"
                      />
                    ))
                  )}
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
        }}
        food={selectedFood}
        onConfirm={handleFoodConfirm}
        isAddingFoodLog={isAddingFoodLog}
      />

      {/* Custom Food Modal */}
      <CustomFoodModal
        isOpen={showCustomFood}
        onClose={handleCustomFoodModalClose}
        editFood={editingFood}
        mode={customFoodMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        handleDelete={confirmDeleteFood}
        isDeleting={isDeletingFood}
        title="Delete Custom Food"
      >
        Are you sure you want to delete "{foodToDelete?.foodName}"? This action
        cannot be undone.
      </DeleteDialog>
    </>
  );
}
