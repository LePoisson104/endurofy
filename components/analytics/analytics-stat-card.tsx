"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function AnalyticsStatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  iconColor,
}: AnalyticsStatCardProps) {
  return (
    <Card>
      <CardContent className="px-6 py-2">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-10 w-10 items-center bg-primary/10 justify-center rounded-lg">
                <Icon className={cn("h-5 w-5 text-primary", iconColor)} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-2xl font-bold">{value}</p>
              {change && trend !== "neutral" && (
                <div
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend === "up" && "text-green-600 dark:text-green-500",
                    trend === "down" && "text-red-500 dark:text-red-400"
                  )}
                >
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {change}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
