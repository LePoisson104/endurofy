"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBackground?: string;
  description?: string;
}

export function AnalyticsStatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBackground,
  description,
}: AnalyticsStatCardProps) {
  return (
    <Card>
      <CardContent className="px-6 py-2">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  iconBackground || "bg-primary/10"
                )}
              >
                <Icon className={cn("h-5 w-5 text-primary", iconColor)} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
