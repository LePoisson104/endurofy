"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, RotateCcw, Calendar as CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AnalyticsFiltersProps {
  selectedPeriod: string;
  startDate?: Date;
  endDate?: Date;
  onPeriodChange: (period: string) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onReset: () => void;
}

const periodOptions = [
  { value: "7day", label: "7D", fullLabel: "Last 7 Days" },
  { value: "14day", label: "14D", fullLabel: "Last 14 Days" },
  { value: "30day", label: "30D", fullLabel: "Last 30 Days" },
  { value: "90day", label: "90D", fullLabel: "Last 90 Days" },
];

export function AnalyticsFilters({
  selectedPeriod,
  startDate,
  endDate,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: AnalyticsFiltersProps) {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const isCustomRange = selectedPeriod === "day range";
  const hasCustomDates = startDate && endDate;

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="space-y-4">
        {/* Quick Period Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Time Period
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Reset
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onPeriodChange(option.value)}
                className="h-9 px-4"
              >
                {option.label}
              </Button>
            ))}
            <Button
              variant={isCustomRange ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange("day range")}
              className="h-9 px-4"
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Custom
            </Button>
          </div>
        </div>

          {/* Custom Date Range */}
          {isCustomRange && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Custom Date Range
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      From
                    </label>
                    <Popover
                      open={isStartDateOpen}
                      onOpenChange={setIsStartDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "MMM dd, yyyy")
                          ) : (
                            <span>Pick start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            onStartDateChange(date);
                            setIsStartDateOpen(false);
                          }}
                          disabled={(date) =>
                            endDate ? date > endDate : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">To</label>
                    <Popover
                      open={isEndDateOpen}
                      onOpenChange={setIsEndDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "MMM dd, yyyy")
                          ) : (
                            <span>Pick end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            onEndDateChange(date);
                            setIsEndDateOpen(false);
                          }}
                          disabled={(date) =>
                            startDate ? date < startDate : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Date Range Summary */}
                {hasCustomDates && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Showing data from{" "}
                      <span className="font-medium">
                        {format(startDate, "MMM dd")}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {format(endDate, "MMM dd, yyyy")}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </>
        )}
      </div>
    </div>
  );
}
