import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function CalendarSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-1">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 text-center text-xs">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-8 mx-auto" />
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <Skeleton key={dayIndex} className="h-10 w-full rounded" />
                ))}
              </div>
            ))}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap gap-4 text-xs mt-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-3 w-6 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
