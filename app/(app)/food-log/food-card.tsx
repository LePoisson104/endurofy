"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  ResponsiveMenu,
  createMenuItem,
  createMenuSection,
} from "@/components/ui/responsive-menu";
import { useIsMobile } from "@/hooks/use-mobile";

import type { BaseFood } from "../../../interfaces/food-log-interfaces";

interface FoodCardProps {
  food: BaseFood;
  onSelect: (food: BaseFood) => void;
  onEdit?: (food: BaseFood) => void;
  onDelete?: (food: BaseFood) => void;
  foodSource: "usda" | "custom" | "favorite";
}

export default function FoodCard({
  food,
  onSelect,
  onEdit,
  onDelete,
  foodSource,
}: FoodCardProps) {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuSections = [
    createMenuSection([
      createMenuItem("edit", "Edit", Edit, () => onEdit?.(food)),
    ]),
    createMenuSection([
      createMenuItem("delete", "Delete", Trash2, () => onDelete?.(food), {
        variant: "destructive",
      }),
    ]),
  ];

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
        {foodSource === "custom" ? (
          isMobile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsDrawerOpen(true);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <ResponsiveMenu
                sections={menuSections}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-card/50 dark:hover:bg-card/50"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          )
        ) : (
          <p className="text-xs text-muted-foreground">
            {foodSource === "favorite"
              ? food.foodSource === "usda"
                ? "USDA"
                : "Custom"
              : foodSource === "usda"
              ? "USDA"
              : "Custom"}
          </p>
        )}
      </div>
      <ResponsiveMenu
        sections={menuSections}
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
        dropdownAlign="end"
        dropdownWidth="w-56"
      />
    </div>
  );
}
