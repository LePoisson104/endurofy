import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const FILTER_SKELETON_ITEMS = ["Program", "Exercise", "Period"] as const;

const STAT_CARD_COUNT = 4;
const SESSION_PLACEHOLDERS = 3;

export default function WorkoutProgressionSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-10 w-70" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FILTER_SKELETON_ITEMS.map((item) => (
              <div key={item} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-5 w-50 rounded-md" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: STAT_CARD_COUNT }).map((_, index) => (
          <Card key={`stat-${index}`}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {["weight-chart", "volume-chart"].map((chart) => (
          <Card key={chart}>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-72 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: SESSION_PLACEHOLDERS }).map((_, index) => (
              <div
                key={`session-${index}`}
                className="space-y-3 rounded-md border p-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, chipIndex) => (
                    <Skeleton
                      key={`chip-${index}-${chipIndex}`}
                      className="h-5 rounded-full"
                      style={{
                        width: `${Math.floor(Math.random() * 40) + 60}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
