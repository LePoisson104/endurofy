"use client";

import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BaseFood } from "../../../interfaces/food-log-interfaces";

interface FoodCardProps {
  food: BaseFood;
  isSelected?: boolean;
  onSelect: (food: BaseFood) => void;
  onToggleFavorite: (foodId: string) => void;
  onEdit?: (food: BaseFood) => void;
  onDelete?: (food: BaseFood) => void;
  foodSource: "USDA" | "Custom" | "Favorite";
}

export default function FoodCard({
  food,
  isSelected = false,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  foodSource,
}: FoodCardProps) {
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    if (foodSource === "Custom" && food && onEdit) {
      onEdit(food);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(food);
  };

  return (
    <div
      className={`p-3 border-b rounded-none cursor-pointer hover:bg-accent`}
      onClick={() => onSelect(food)}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1 mr-4">
          <h4 className="font-medium text-sm">
            {food.foodName
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ")}
          </h4>
          <p className="text-xs text-muted-foreground">{food.foodBrand}</p>
        </div>
        {foodSource === "Custom" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-card/50 dark:hover:bg-card/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="text-xs text-muted-foreground">
            {foodSource === "Favorite" ? food.foodSource : foodSource}
          </p>
        )}
      </div>
    </div>
  );
}
