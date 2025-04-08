"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LineChart from "@/components/charts/line-chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  Activity,
  BarChart3,
  Plus,
  CalendarIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BMIIndicator from "@/components/global/bmi-indicator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageTitle from "@/components/global/page-title";
import {
  getCurrentDate,
  getCurrentTime,
} from "@/helper/get-current-date-n-time";
import { useEffect } from "react";
import WeightLogHistory from "@/components/tables/weight-log-history";
import { useGetWeightLogByDateQuery } from "@/api/weight-log/weight-log-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { selectWeightStates } from "@/api/user/user-slice";
import { Skeleton } from "@/components/ui/skeleton";
import WeightForm from "@/components/form/weight-form";
import ErrorAlert from "@/components/alerts/error-alert";
import { startOfWeek, endOfWeek } from "date-fns";

export default function WeightLogPage() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const user = useSelector(selectCurrentUser);
  const [error, setError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("90d");
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  const { data: weightLog } = useGetWeightLogByDateQuery({
    userId: user?.user_id || "",
    // startDate: format(weekStart, "yyyy-MM-dd"),
    // endDate: format(weekEnd, "yyyy-MM-dd"),
    startDate: "2025-04-05",
    endDate: "2025-04-24",
  });

  const weightStates = useSelector(selectWeightStates);
  const currentWeight = Number(weightStates.current_weight);
  const startWeight = Number(weightStates.starting_weight);
  const goalWeight = Number(weightStates.weight_goal);
  const weightProgress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100
      )
    )
  );

  useEffect(() => {
    setCurrentDate(getCurrentDate());
    setCurrentTime(getCurrentTime());
  }, []);

  return (
    <div className="flex min-h-screen flex-col p-[1rem] relative">
      <ErrorAlert error={error} setError={setError} />
      <main className="flex-1">
        <div className="flex flex-col space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <PageTitle
                title="Weight Log"
                subTitle={`${currentDate} | ${currentTime}`}
              />
            </div>
            {/* Mobile add button - only visible on small screens */}
            <Button
              className="lg:hidden flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Weight
            </Button>
          </div>

          {/* Main Content */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
            {/* Left Column - 3/4 width on large screens */}
            <div className="lg:col-span-3 space-y-6">
              {/* Weight Chart */}
              <Card className="md:pb-24 sm:pb-0 h-[500px] ">
                <CardHeader className="flex items-center gap-2 space-y-0  sm:flex-row ">
                  <div className="flex flex-col w-full gap-2">
                    <CardTitle>Weight log overview</CardTitle>
                    <CardDescription>
                      March 15, 2025 - March 21, 2025
                    </CardDescription>
                  </div>

                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                      className="w-[160px] rounded-lg sm:ml-auto"
                      aria-label="Select a value"
                    >
                      <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="90d" className="rounded-lg">
                        Last 3 months
                      </SelectItem>
                      <SelectItem value="30d" className="rounded-lg">
                        Last 30 days
                      </SelectItem>
                      <SelectItem value="7d" className="rounded-lg">
                        Last 7 days
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>

                <LineChart timeRange={timeRange} setTimeRange={setTimeRange} />
              </Card>

              {/* Current Weight & Goal */}
              {weightStates?.current_weight ? (
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">
                      Current Stats
                    </CardTitle>
                    <Activity className="h-4 w-4 text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <p className="text-2xl font-bold mb-2">
                        Goal: {goalWeight}{" "}
                        {weightStates.starting_weight_unit === "lb"
                          ? "lbs"
                          : "kg"}
                      </p>
                      <p className="text-xs text-green-500 flex mt-2">
                        <ChevronDown className="h-4 w-4 text-green-500" /> 2 lbs
                        since last week
                      </p>
                    </div>
                    <Progress value={weightProgress} />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {startWeight}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Current: {currentWeight}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {goalWeight}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Progress: {weightProgress}%
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Skeleton className="h-[220px] w-full" />
              )}

              {/* BMI Chart */}
              {weightStates?.bmi ? (
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">
                      Body Mass Index (BMI)
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Your BMI
                        </p>
                        <p className="text-3xl font-bold">
                          {weightStates?.bmi}
                        </p>
                        <p className="text-sm mt-1">
                          {weightStates?.bmi_category}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <BMIIndicator
                          bmi={weightStates?.bmi}
                          bmiCategory={weightStates?.bmi_category}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Skeleton className="h-[220px] w-full" />
              )}

              {/* Weight History */}
              <WeightLogHistory
                weightHistory={weightLog}
                goal={weightStates.goal}
                startDate={format(weekStart, "yyyy-MM-dd")}
                endDate={format(weekEnd, "yyyy-MM-dd")}
              />
            </div>

            {/* Right Column - 1/4 width on large screens, hidden on small screens */}
            <div className="lg:col-span-1 hidden lg:block">
              {weightStates.current_weight_unit ? (
                <Card className="shadow-sm sticky top-20">
                  <CardHeader>
                    <CardTitle>Add Weight Entry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WeightForm setError={setError} />
                  </CardContent>
                </Card>
              ) : (
                <Skeleton className="h-[330px] w-full" />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal for small screens */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Weight Entry</DialogTitle>
          </DialogHeader>
          <WeightForm setError={setError} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
