"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LineChart from "@/components/charts/line-chart";
import { Activity, BarChart3, Plus, Goal } from "lucide-react";
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
import WeightLogHistory from "@/components/tables/weight-log-history";
import { useGetWeightLogByDateQuery } from "@/api/weight-log/weight-log-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { selectWeightStates } from "@/api/user/user-slice";
import { Skeleton } from "@/components/ui/skeleton";
import WeightForm from "@/components/form/weight-form";
import ErrorAlert from "@/components/alerts/error-alert";
import { startOfWeek, endOfWeek } from "date-fns";
import BMIDialog from "@/components/dialog/bmi-dialog";
import { getDayRange } from "@/helper/get-day-range";
import { WeightForm as WeightFormType } from "@/components/form/weight-form";
import { useGetWeeklyWeightDifferenceQuery } from "@/api/weight-log/weight-log-api-slice";
import handleRateChangeColor from "@/helper/handle-rate-change";
import { useIsMobile } from "@/hooks/use-mobile";
import SuccessAlert from "@/components/alerts/success-alert";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function WeightLogPage() {
  const isDark = useGetCurrentTheme();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const user = useSelector(selectCurrentUser);
  const weightStates = useSelector(selectWeightStates);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lineChartOptions, setLineChartOptions] = useState("current-week");
  const [historyOptions, setHistoryOptions] = useState("current-week");
  const [weightLogData, setWeightLogData] = useState<any>(null); // for updating weight log
  const [weightFormData, setWeightFormData] = useState<WeightFormType>({
    weight: 0,
    weightUnit: "",
    caloriesIntake: 0,
    logDate: "",
    notes: "",
  });

  const currentWeight = Number(weightStates.current_weight);
  const startWeight = Number(weightStates.starting_weight);
  const goalWeight = Number(weightStates.weight_goal);

  const weightProgress = useMemo(() => {
    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100
        )
      )
    );
  }, [startWeight, currentWeight, goalWeight]);

  const now = new Date();
  const [startDate, setStartDate] = useState<Date | null>(
    startOfWeek(now, { weekStartsOn: 1 })
  );
  const [endDate, setEndDate] = useState<Date | null>(
    endOfWeek(now, { weekStartsOn: 0 })
  );

  const [startDateForLineChart, setStartDateForLineChart] =
    useState<Date | null>(startOfWeek(now, { weekStartsOn: 1 }));
  const [endDateForLineChart, setEndDateForLineChart] = useState<Date | null>(
    endOfWeek(now, { weekStartsOn: 0 })
  );
  const [view, setView] = useState("both");

  // Function to set history date range
  const setHistoryDateRange = useCallback((options: string, data: any[]) => {
    if (options === "all" && data.length > 0) {
      setStartDate(new Date(data[data.length - 1]?.log_date));
      setEndDate(new Date(data[0]?.log_date));
    } else if (options !== "all" && options !== "current-week") {
      const { startDate, endDate } = getDayRange({ options });
      setStartDate(startDate);
      setEndDate(endDate);
    } else if (options === "current-week") {
      setStartDate(startOfWeek(now, { weekStartsOn: 1 }));
      setEndDate(endOfWeek(now, { weekStartsOn: 1 }));
    }
  }, []);

  // Function to set line chart date range
  const setLineChartDateRange = useCallback((options: string, data: any[]) => {
    if (options === "all" && data.length > 0) {
      setStartDateForLineChart(new Date(data[data.length - 1]?.log_date));
      setEndDateForLineChart(new Date(data[0]?.log_date));
    } else if (options !== "all" && options !== "current-week") {
      const { startDate, endDate } = getDayRange({ options });
      setStartDateForLineChart(startDate);
      setEndDateForLineChart(endDate);
    } else if (options === "current-week") {
      setStartDateForLineChart(startOfWeek(now, { weekStartsOn: 1 }));
      setEndDateForLineChart(endOfWeek(now, { weekStartsOn: 1 }));
    }
  }, []);

  // Memoize query parameters to prevent unnecessary re-renders
  const historyQueryParams = useMemo(
    () => ({
      userId: user?.user_id || "",
      startDate: format(startDate || "", "yyyy-MM-dd"),
      endDate: format(endDate || "", "yyyy-MM-dd"),
      options: historyOptions !== "all" ? "date" : "all",
      withRates: true,
    }),
    [user?.user_id, startDate, endDate, historyOptions]
  );

  const lineChartQueryParams = useMemo(
    () => ({
      userId: user?.user_id || "",
      startDate: format(startDateForLineChart || "", "yyyy-MM-dd"),
      endDate: format(endDateForLineChart || "", "yyyy-MM-dd"),
      options: lineChartOptions !== "all" ? "date" : "all",
      withRates: false,
    }),
    [
      user?.user_id,
      startDateForLineChart,
      endDateForLineChart,
      lineChartOptions,
    ]
  );

  const { data: weightLogWithRates } =
    useGetWeightLogByDateQuery(historyQueryParams);
  const { data: weightLog, isLoading: isLoadingWeightLog } =
    useGetWeightLogByDateQuery(lineChartQueryParams);
  const { data: weeklyWeightDifference } = useGetWeeklyWeightDifferenceQuery({
    userId: user?.user_id || "",
  });

  // Memoize the date range effect to prevent unnecessary updates
  useEffect(() => {
    setHistoryDateRange(historyOptions, weightLogWithRates?.data);
  }, [historyOptions, weightLogWithRates?.data]);

  useEffect(() => {
    setLineChartDateRange(lineChartOptions, weightLogWithRates?.data);
  }, [lineChartOptions, weightLogWithRates?.data]);

  useEffect(() => {
    setCurrentDate(getCurrentDate());
    setCurrentTime(getCurrentTime());
  }, []);

  return (
    <div className="flex min-h-screen flex-col p-[1rem] relative">
      <ErrorAlert error={error} setError={setError} />
      <SuccessAlert success={success} setSuccess={setSuccess} />
      <main className="flex-1">
        <div className="flex flex-col space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <PageTitle
                title="Weight Log"
                subTitle={`${
                  currentDate ? `${currentDate} | ${currentTime}` : ""
                }`}
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
              {!isLoadingWeightLog ? (
                <Card className="md:pb-24 sm:pb-0 h-[500px] ">
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
                    <div className="flex flex-col w-full gap-2">
                      <CardTitle className="flex flex-row items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-400" />
                        Weight log overview
                      </CardTitle>
                      <CardDescription>
                        {format(startDateForLineChart || "", "MMMM d, yyyy")} -{" "}
                        {format(endDateForLineChart || "", "MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <Select value={view} onValueChange={setView}>
                        <SelectTrigger
                          className="w-fit rounded-lg"
                          aria-label="Select a value"
                        >
                          <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="both" className="rounded-lg">
                            View Both
                          </SelectItem>
                          <SelectItem value="weight" className="rounded-lg">
                            View Weight
                          </SelectItem>
                          <SelectItem value="calories" className="rounded-lg">
                            View Calories
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={lineChartOptions}
                        onValueChange={setLineChartOptions}
                      >
                        <SelectTrigger
                          className="w-fit rounded-lg"
                          aria-label="Select a value"
                        >
                          <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem
                            value="current-week"
                            className="rounded-lg"
                          >
                            Current Week
                          </SelectItem>
                          <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                          </SelectItem>
                          <SelectItem value="14d" className="rounded-lg">
                            Last 14 days
                          </SelectItem>
                          <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                          </SelectItem>
                          <SelectItem value="all" className="rounded-lg">
                            All
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>

                  <LineChart weightLogData={weightLog?.data} view={view} />
                </Card>
              ) : (
                <Skeleton className="h-[500px] w-full" />
              )}

              {/* Current Weight & Goal */}
              {weightStates?.current_weight ? (
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">
                      Goal Progress
                    </CardTitle>
                    <Goal className="h-4 w-4 text-teal-400" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`flex justify-between ${
                        isMobile ? "flex-col" : "flex-row"
                      }`}
                    >
                      <p
                        className={`text-2xl font-bold ${
                          isMobile ? "mb-1" : "mb-2"
                        }`}
                      >
                        Goal: {goalWeight}{" "}
                        {weightStates.starting_weight_unit === "lb"
                          ? "lbs"
                          : "kg"}
                      </p>
                      <p className="text-xs flex items-center gap-1 mb-2">
                        {handleRateChangeColor(
                          weeklyWeightDifference?.data?.weeklyDifference,
                          weightStates.goal,
                          weightStates.starting_weight_unit,
                          " since last week",
                          isDark
                        )}
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
                    <div className="flex flex-row items-center gap-2">
                      <CardTitle className="text-base font-medium">
                        Body Mass Index (BMI)
                      </CardTitle>
                      <BMIDialog />
                    </div>
                    <BarChart3 className="h-4 w-4 text-green-400" />
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
                weightHistory={weightLogWithRates}
                goal={weightStates.goal}
                startDate={format(startDate || "", "yyyy-MM-dd")}
                endDate={format(endDate || "", "yyyy-MM-dd")}
                userId={user?.user_id || ""}
                setWeightLogData={setWeightLogData}
                options={historyOptions}
                setOptions={setHistoryOptions}
                setModalOpen={setIsModalOpen}
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
                    <WeightForm
                      setError={setError}
                      weightLogData={weightLogData}
                      setWeightLogData={setWeightLogData}
                      formData={weightFormData}
                      setFormData={setWeightFormData}
                      setModalOpen={setIsModalOpen}
                      setSuccess={setSuccess}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Skeleton className="h-[400px] w-full" />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal for small screens */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Add Weight Entry</DialogTitle>
          </DialogHeader>
          <WeightForm
            setError={setError}
            weightLogData={weightLogData}
            setWeightLogData={setWeightLogData}
            formData={weightFormData}
            setFormData={setWeightFormData}
            setModalOpen={setIsModalOpen}
            setSuccess={setSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
