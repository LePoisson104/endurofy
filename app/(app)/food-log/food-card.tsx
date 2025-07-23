"use client";

import type { FoodSearchResult } from "../../../interfaces/food-log-interfaces";

interface FoodCardProps {
  food: FoodSearchResult;
  isSelected?: boolean;
  onSelect: (food: FoodSearchResult) => void;
  onToggleFavorite: (foodId: string) => void;
}

export default function FoodCard({
  food,
  isSelected = false,
  onSelect,
  onToggleFavorite,
}: FoodCardProps) {
  return (
    <div
      className={`p-3 border-b rounded-none cursor-pointer transition-colors hover:bg-accent`}
      onClick={() => onSelect(food)}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1 mr-4">
          <h4 className="font-medium text-sm">
            {food.description
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ")}
          </h4>
          <p className="text-xs text-muted-foreground">{food.brandOwner}</p>
        </div>
        <p className="text-xs text-muted-foreground">USDA</p>
      </div>
    </div>
  );
}
