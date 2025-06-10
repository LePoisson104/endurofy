"use client";

import { useState } from "react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FoodCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

interface DayData {
  date: Date;
  calories: number;
  hasLogs: boolean;
}

export default function FoodCalendar({
  selectedDate,
  onSelectDate,
}: FoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  // Mock data for days with food logs - replace with actual data
  const mockLoggedDays: DayData[] = [
    { date: new Date(2024, 0, 15), calories: 1850, hasLogs: true },
    { date: new Date(2024, 0, 16), calories: 2100, hasLogs: true },
    { date: new Date(2024, 0, 17), calories: 1950, hasLogs: true },
    { date: new Date(2024, 0, 18), calories: 2200, hasLogs: true },
    { date: new Date(2024, 0, 19), calories: 1800, hasLogs: true },
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Get the start and end of the calendar view (complete weeks)
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Get all days to display (including previous/next month days)
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const getDayData = (date: Date): DayData | undefined => {
    return mockLoggedDays.find((day) => isSameDay(day.date, date));
  };

  const getCaloriesBadgeColor = (calories: number): string => {
    if (calories < 1500) return "bg-red-100 text-red-800";
    if (calories > 2500) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayData = getDayData(day);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div key={day.toISOString()} className="relative">
                  <Button
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onSelectDate(day)}
                    className={`h-10 w-full p-0 text-sm relative ${
                      isToday && !isSelected ? "border-2 border-primary" : ""
                    } ${
                      !isCurrentMonth
                        ? "text-muted-foreground/50 hover:text-muted-foreground"
                        : ""
                    }`}
                  >
                    {format(day, "d")}

                    {/* Food log indicator */}
                    {dayData?.hasLogs && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCurrentMonth ? "bg-primary" : "bg-primary/50"
                          }`}
                        />
                      </div>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-sm">This Week</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">5</div>
              <div className="text-xs text-muted-foreground">Days Logged</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">1,980</div>
              <div className="text-xs text-muted-foreground">Avg Calories</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t pt-4 space-y-2">
          <h4 className="font-medium text-sm">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">Has food logs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 border-2 border-primary rounded-full" />
              <span className="text-muted-foreground">Today</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
