"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface WorkoutHistorySkeletonProps {
  count?: number;
}

export function WorkoutHistorySkeleton({
  count = 3,
}: WorkoutHistorySkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <Skeleton className="h-6 w-48" />
                  {/* Action Button Skeleton */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="ml-4 shrink-0"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>

                {/* Date and Duration */}
                <div className="flex items-center gap-4 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>

                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>

                {/* Exercise Preview Badges */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {/* Generate 2-4 exercise badge skeletons */}
                    {Array.from({
                      length: Math.floor(Math.random() * 3) + 2,
                    }).map((_, badgeIndex) => (
                      <Skeleton
                        key={badgeIndex}
                        className="h-5 rounded-full"
                        style={{
                          width: `${Math.floor(Math.random() * 40) + 60}px`,
                        }}
                      />
                    ))}
                    {/* Sometimes show "+X more" badge */}
                    {Math.random() > 0.5 && (
                      <Skeleton className="h-5 w-12 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Component for empty state skeleton (when there might be no workouts)
export function WorkoutHistoryEmptySkeleton() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Skeleton className="h-12 w-12 mx-auto mb-4" />
        <Skeleton className="h-6 w-40 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardContent>
    </Card>
  );
}
