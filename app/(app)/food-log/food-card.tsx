"use client";

import { Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FoodSearchResult } from "./types";

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
        <div className="flex-1">
          <h4 className="font-medium text-sm">{food.name}</h4>
          {food.brand && (
            <p className="text-xs text-muted-foreground">{food.brand}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">USDA</p>
      </div>
    </div>
  );
}
