import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import CalendarSkeleton from "./calendar-skeleton";

export default function FoodLogSkeleton() {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      {/* Header */}
      <header>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          {isMobile && <Skeleton className="h-10 w-32" />}
        </div>
      </header>

      {/* Mobile Week Selector */}
      {isMobile && (
        <div className="pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center min-w-[60px]">
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 pt-6">
        <div className="grid grid-cols-1 gap-[1rem] lg:grid-cols-4">
          {/* Left side - Food Log */}
          <div className="lg:col-span-3 space-y-6">
            {/* Meals Card */}
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle>Meals</CardTitle>
                  <CardDescription>
                    Add and track your daily meals
                  </CardDescription>
                </div>
                <Skeleton className="h-10 w-10 rounded-md" />
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {/* Meal Accordions */}
                  {[
                    "Uncategorized",
                    "Breakfast",
                    "Lunch",
                    "Dinner",
                    "Snacks",
                  ].map((mealName, index) => (
                    <div key={index} className="border-b last:border-b-0">
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-3">
                          <div>
                            <Skeleton className="h-5 w-20 mb-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Mobile Water Intake */}
                  {isMobile && (
                    <div className="border-b-0">
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-3">
                          <div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Daily Nutrition Card */}
            <Card>
              <CardHeader>
                <div
                  className={`flex ${
                    isMobile ? "flex-col gap-2" : "justify-between items-center"
                  }`}
                >
                  <div>
                    <CardTitle>Daily Nutrition</CardTitle>
                    <CardDescription>
                      Track your macronutrients and calories
                    </CardDescription>
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-6">
                  {/* Macro Progress Bars */}
                  {["Calories", "Protein", "Carbs", "Fat"].map(
                    (macro, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full rounded-full" />
                          <div className="flex justify-between">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Nutrients Card */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Nutrients</CardTitle>
                <CardDescription>
                  Track your fiber, sugar, sodium, and cholesterol intake
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Calendar (Desktop only) */}
          <div className="hidden lg:block space-y-6">
            {/* Calendar Card */}
            <CalendarSkeleton />
            {/* Water Intake Card - Desktop Only */}
            <div className="bg-card rounded-xl shadow-sm p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-5" />
                </div>

                {/* Circular Progress Indicator */}
                <div className="flex justify-center">
                  <div className="relative">
                    <Skeleton className="h-50 w-50 rounded-full" />
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Skeleton className="h-6 w-16 mb-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>

                {/* Quick Add Buttons - Square Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-25 w-full rounded-lg" />
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-3">
                  <Skeleton className="h-10 flex-1 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
