"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="px-6 py-2">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ height = "h-[350px]" }: { height?: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <div className={`${height} w-full flex flex-col justify-end gap-2 p-4`}>
          {/* Simulated bar chart skeleton */}
          <div className="flex items-end justify-between gap-2 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-sm"
                style={{ height: `${Math.random() * 60 + 30}%` }}
              />
            ))}
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between gap-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LineChartSkeleton({ height = "h-[350px]" }: { height?: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <div className={`${height} w-full flex items-center justify-center`}>
          <div className="w-full h-full relative p-4">
            {/* Y-axis */}
            <div className="absolute left-0 top-4 bottom-12 flex flex-col justify-between">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-8" />
              ))}
            </div>
            {/* Chart area with simulated line */}
            <div className="ml-12 h-full flex items-center">
              <Skeleton className="h-[2px] w-full" />
            </div>
            {/* X-axis */}
            <div className="absolute bottom-0 left-12 right-4 flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-10" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCardSkeleton({
  borderColor = "border-l-primary",
}: {
  borderColor?: string;
}) {
  return (
    <Card className={`overflow-hidden border-l-4 ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
          <div className="h-px bg-border" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NutritionSummaryCardSkeleton() {
  return (
    <Card className="overflow-hidden border-l-4 border-l-chart-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Progress Overview Chart */}
      <ChartSkeleton height="h-[350px]" />

      {/* Two Charts Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartSkeleton height="h-[300px]" />
        <LineChartSkeleton height="h-[400px]" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <SummaryCardSkeleton borderColor="border-l-chart-1" />
        <SummaryCardSkeleton borderColor="border-l-primary" />
        <NutritionSummaryCardSkeleton />
      </div>
    </div>
  );
}

export {
  StatCardSkeleton,
  ChartSkeleton,
  LineChartSkeleton,
  SummaryCardSkeleton,
  NutritionSummaryCardSkeleton,
};

