"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LineChart from "@/components/charts/line-chart";
import BarChart from "@/components/charts/bar-chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import {
  BarChart3,
  LineChart as LineChartIcon,
  FileDown,
  CalendarIcon,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const StatisticsPage = () => {
  const [dateRange, setDateRange] = useState<
    "7days" | "30days" | "90days" | "custom"
  >("30days");
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    setDateRange(value as "7days" | "30days" | "90days" | "custom");

    const today = new Date();
    switch (value) {
      case "7days":
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case "30days":
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case "90days":
        setStartDate(subDays(today, 90));
        setEndDate(today);
        break;
      // For custom, keep current dates
    }
  };

  // Format selected date range for display
  const formatDateRange = () => {
    if (dateRange !== "custom") {
      return `Last ${
        dateRange === "7days"
          ? "7 days"
          : dateRange === "30days"
          ? "30 days"
          : "90 days"
      }`;
    }
    return `${format(startDate, "MMM dd, yyyy")} - ${format(
      endDate,
      "MMM dd, yyyy"
    )}`;
  };

  return (
    <div className="p-[1rem] space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-2xl font-bold">Statistics</div>
          <p className="text-sm text-muted-foreground">
            Track your progress and analyze your data
          </p>
        </div>
      </div>

      {/* Filters & Controls */}
      <Card>
        <CardContent>
          <div className="flex justify-between mb-4 gap-4">
            <div>
              {/* Date Range */}
              <div className="space-y-2 ">
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger>
                    <label className="text-sm font-medium">Start Date</label>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {dateRange === "custom" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(startDate, "PP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(endDate, "PP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </div>

            <Button variant="outline" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export Data
            </Button>
          </div>
          {/* Chart Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chart Type</label>
            <div className="flex gap-2">
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setChartType("line")}
              >
                <LineChartIcon className="h-4 w-4 mr-2" />
                Line
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Bar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      <Card>
        <CardContent className="p-0">
          <div
            className={`h-[600px] w-full ${
              chartType === "line" ? "lg:pb-17 sm:pb-0" : "p-0"
            }`}
          >
            {chartType === "line" ? (
              <LineChart hideSelect={true} />
            ) : (
              <BarChart height={500} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPage;
