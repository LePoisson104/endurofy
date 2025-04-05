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

export default function WeightLogPage() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const user = useSelector(selectCurrentUser);
  const [weight, setWeight] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("90d");
  const { data: weightLog } = useGetWeightLogByDateQuery({
    userId: user?.user_id || "",
    startDate: "2025-03-16",
    endDate: "2025-03-19",
  });

  console.log(weightLog);
  // Mock data
  const currentWeight = 183;
  const heightInInches = 70; // 5'10"
  // BMI formula: (weight in pounds / (height in inches)²) × 703
  const bmi =
    Math.round((currentWeight / Math.pow(heightInInches, 2)) * 703 * 10) / 10;
  const bmiCategory = getBmiCategory(bmi);
  const [date, setDate] = React.useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    setCurrentDate(getCurrentDate());
    setCurrentTime(getCurrentTime());
  }, []);

  // Form component that's reused in both desktop and mobile views
  const WeightForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weight">Weight (lbs)</Label>
        <Input
          id="weight"
          type="number"
          placeholder="Enter weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-fit justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => setDate(day)}
              />
            </PopoverContent>
          </Popover>
          <Input
            id="date"
            type="text"
            pattern="\d{4}-\d{2}-\d{2}"
            placeholder="YYYY-MM-DD"
            defaultValue={format(new Date(), "MM/dd/yyyy")}
            className="w-full"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Notes (optional)</Label>
        <Input
          id="note"
          placeholder="Add notes (50 characters max)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        Add Entry
      </Button>
    </form>
  );

  return (
    <div className="flex min-h-screen flex-col p-[1rem] relative">
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
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">
                    Current Stats
                  </CardTitle>
                  <Activity className="h-4 w-4 text-teal-400" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <p className="text-2xl font-bold mb-2">Goal: 173 lbs</p>
                    <p className="text-xs text-green-500 flex mt-2">
                      <ChevronDown className="h-4 w-4 text-green-500" /> 2 lbs
                      since last week
                    </p>
                  </div>
                  <Progress value={33} />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">185 </p>
                    <p className="text-xs text-muted-foreground">
                      Current: 183
                    </p>
                    <p className="text-xs text-muted-foreground">173</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Progress: 33% of your goal
                  </p>
                </CardContent>
              </Card>

              {/* BMI Chart */}
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
                      <p className="text-sm text-muted-foreground">Your BMI</p>
                      <p className="text-3xl font-bold">{bmi}</p>
                      <p className="text-sm mt-1">{bmiCategory}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        BMI Range
                      </p>
                      <BMIIndicator bmi={bmi} bmiCategory={bmiCategory} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weight History */}
              <WeightLogHistory weightHistory={weightLog} />
            </div>

            {/* Right Column - 1/4 width on large screens, hidden on small screens */}
            <div className="lg:col-span-1 hidden lg:block">
              <Card className="shadow-sm sticky top-20">
                <CardHeader>
                  <CardTitle>Add Weight Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeightForm />
                </CardContent>
              </Card>
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
          <WeightForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function getBmiProgress(bmi: number): number {
  // Returns position percentage for BMI indicator
  if (bmi < 18.5) return (bmi / 18.5) * 18.5;
  if (bmi < 25) return 18.5 + ((bmi - 18.5) / 6.5) * 18.5;
  if (bmi < 30) return 37.0 + ((bmi - 25) / 5) * 18.5;
  if (bmi < 40) return 55.5 + ((bmi - 30) / 10) * 18.5;
  return 74.0; // Max value
}
