"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { SquarePen, History } from "lucide-react";

interface ProgramWorkoutLogSkeletonProps {
  exerciseCount?: number;
}

export function ProgramWorkoutLogSkeleton({
  exerciseCount = 2,
}: ProgramWorkoutLogSkeletonProps) {
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
              <div
                className={`grid gap-2 md:gap-4 text-sm font-medium p-2 bg-muted/50 rounded ${
                  isMobile ? "grid-cols-4" : "grid-cols-6"
                }`}
              >
                <div className="flex justify-center">
                  <Skeleton className="h-4 w-8 md:w-12 lg:w-16" />
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-4 w-6 md:w-8 lg:w-10" />
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-4 w-12 md:w-16 lg:w-20" />
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-4 w-8 md:w-12 lg:w-16" />
                </div>
                {!isMobile && (
                  <>
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-12 md:w-16 lg:w-20" />
                    </div>
                    <div className="flex justify-center">
                      <Skeleton className="h-4 w-10 md:w-14 lg:w-16" />
                    </div>
                  </>
                )}
              </div>

              {/* Table Rows */}
              {Array.from({ length: 2 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid gap-2 md:gap-4 p-2 ${
                    isMobile ? "grid-cols-4" : "grid-cols-6"
                  }`}
                >
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-4 md:w-6 lg:w-8" />
                  </div>
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-4 md:w-6 lg:w-8" />
                  </div>
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-12 md:w-16 lg:w-20" />
                  </div>
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-12 md:w-16 lg:w-20" />
                  </div>
                  {!isMobile && (
                    <>
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-6 md:w-8 lg:w-10" />
                      </div>
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-6 md:w-8 lg:w-10" />
                      </div>
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
