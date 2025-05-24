"use client";

import { useState } from "react";
import { format, subWeeks, addWeeks, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BarChart from "@/components/charts/bar-chart";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeeklyVolumeProps {
  workoutLogs: any[];
}

export function WeeklyVolume({ workoutLogs }: WeeklyVolumeProps) {
  const isMobile = useIsMobile();
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const handlePreviousWeek = () => {
    setSelectedWeek(subWeeks(selectedWeek, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(addWeeks(selectedWeek, 1));
  };

  // Calculate volume for each muscle group for the selected week
  const calculateWeeklyVolume = () => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

    const weeklyLogs = workoutLogs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate >= weekStart && logDate <= weekEnd;
    });

    // Initialize volume tracking for each muscle group
    const volumeByMuscle: Record<string, number> = {
      Chest: 0,
      Shoulder: 0,
      Back: 0,
      Quads: 0,
      Hamstrings: 0,
      Arms: 0,
    };

    // Calculate volume for each workout
    weeklyLogs.forEach((log) => {
      log.exercises.forEach((exercise: any) => {
        const muscleGroup = exercise.muscleGroup;
        if (muscleGroup && volumeByMuscle[muscleGroup] !== undefined) {
          // Calculate volume (weight × reps × sets)
          const volume = exercise.sets.reduce((total: number, set: any) => {
            return total + (set.weight || 0) * (set.reps || 0);
          }, 0);
          volumeByMuscle[muscleGroup] += volume;
        }
      });
    });

    // Convert to chart data format
    return Object.entries(volumeByMuscle).map(([muscle, volume]) => ({
      month: muscle,
      desktop: Math.round(volume / 1000), // Convert to thousands for better display
    }));
  };

  const chartData = calculateWeeklyVolume();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div
          className={`flex ${
            isMobile ? "flex-col" : "w-full justify-between"
          } gap-5`}
        >
          <CardTitle>Weekly Volume</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousWeek}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), "MMM d")}{" "}
              - {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), "MMM d")}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextWeek}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BarChart height={isMobile ? 300 : 590} data={chartData} />
      </CardContent>
    </Card>
  );
}
