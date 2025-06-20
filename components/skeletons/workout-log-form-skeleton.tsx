"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { SquarePen, History } from "lucide-react";

interface WorkoutLogFormSkeletonProps {
  exerciseCount?: number;
}

export function WorkoutLogFormSkeleton({
  exerciseCount = 2,
}: WorkoutLogFormSkeletonProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="space-y-2 flex justify-between items-center w-full">
          <div className="flex">
            <div>
              <Skeleton className="h-7 w-40" /> {/* Day name */}
              <Skeleton className="h-4 w-32 mt-1" /> {/* Date */}
            </div>
          </div>
          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <SquarePen className="h-4 w-4" />
            Edit
          </Button>
        </div>

        {/* Show Previous Button (Mobile) */}
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border3 w-fit"
          >
            <History className="h-4 w-4 mr-2" />
            Show Previous
          </Button>
        )}
      </div>

      {/* Exercise Sections */}
      <div className="space-y-6">
        {Array.from({ length: exerciseCount }).map((_, index) => (
          <div
            key={index}
            className={`rounded-lg space-y-4 ${
              isMobile ? "p-0 border-none" : "p-4 border"
            }`}
          >
            {/* Exercise Header */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col flex-1">
                <div
                  className={`flex items-center gap-3 ${
                    isMobile ? "justify-between" : ""
                  }`}
                >
                  <Skeleton className="h-6 w-48" /> {/* Exercise name */}
                  <Skeleton className="h-6 w-24 rounded-full" />{" "}
                  {/* Completed badge */}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 my-1">
                  <Skeleton className="h-5 w-16 rounded-full" />{" "}
                  {/* Laterality badge */}
                  <Skeleton className="h-5 w-20 rounded-full" />{" "}
                  {/* Body part badge */}
                </div>

                {/* Target sets/reps */}
                <Skeleton className="h-4 w-40 mt-1" />
              </div>
            </div>

            {/* Exercise Table Skeleton */}
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-2 text-sm font-medium p-2 bg-muted/50 rounded">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                {!isMobile && (
                  <>
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-8" />
                  </>
                )}
              </div>

              {/* Table Rows */}
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-6 gap-2 p-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  {!isMobile && (
                    <>
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Exercise Notes Section */}
            <div className="space-y-2">
              <Label>
                Exercise Notes
                <span className="text-sm text-slate-500">(Optional)</span>
              </Label>
              <Skeleton className="h-20 w-full" /> {/* Textarea */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
