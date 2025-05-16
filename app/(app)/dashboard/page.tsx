"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dumbbell,
  Activity,
  Flame,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import BarChart from "@/components/charts/bar-chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import LineChart from "@/components/charts/line-chart";
import { Progress } from "@/components/ui/progress";
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
import { useSelector } from "react-redux";
import { selectUserInfo } from "@/api/user/user-slice";
import DashboardSkeleton from "@/components/skeletons/dashboard-skeleton";
import { selectWeeklyRate } from "@/api/weight-log/weight-log-slice";
import handleRateChangeColor from "@/helper/handle-rate-change";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { useDispatch } from "react-redux";
import { calculateAndSetBMR } from "@/api/user/user-slice";
import { getActivityMultiplier } from "@/helper/constants/activity-level-contants";

export default function DashboardPage() {
  const isDark = useGetCurrentTheme();
  const dispatch = useDispatch();

  const [timeRange, setTimeRange] = useState("90d");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const userInfo = useSelector(selectUserInfo);
  const weeklyRate = useSelector(selectWeeklyRate);

  const currentWeight = Number(userInfo?.current_weight || 0);
  const startWeight = Number(userInfo?.starting_weight || 0);
  const goalWeight = Number(userInfo?.weight_goal || 0);
  const progress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100
      )
    ) || 0
  );

  const TDEE = Number(
    userInfo?.bmr
      ? userInfo?.bmr * getActivityMultiplier(userInfo?.activity_level || "")
      : 0
  );

  useEffect(() => {
    setCurrentDate(getCurrentDate());
    setCurrentTime(getCurrentTime());
  }, []);

  useEffect(() => {
    if (userInfo) {
      dispatch(calculateAndSetBMR());
    }
  }, [userInfo, dispatch]);

  if (userInfo.email === "") {
    return (
      <div className="flex min-h-screen flex-col p-[1rem]">
        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col space-y-6">
            {/* Dashboard Header */}
            <PageTitle
              title="Dashboard"
              subTitle={`${currentDate} | ${currentTime}`}
            />
            {/* Metrics Cards */}
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      {/* Main Content */}
      <main className="flex-1">
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header */}
          <PageTitle
            title="Dashboard"
            subTitle={`${currentDate} | ${currentTime}`}
          />

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xs:grid-cols-4">
            <div className="grid gap-4 md:grid-cols-2 sm:grid-cols-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Workouts
                  </CardTitle>
                  <Dumbbell className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-2">3 / 5 Sessions</p>
                  <Progress value={30} />
                  <p className="text-xs text-muted-foreground mt-2">
                    Progress: 30% of your goal
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Calories Burned
                  </CardTitle>
                  <Flame className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-2">
                    {Number(TDEE).toFixed(0)}{" "}
                    <span className="text-sm text-red-400">Kcal</span>
                  </p>
                  <p className="text-xs">
                    Basal Metabolic Rate (BMR):{" "}
                    <span className="text-sm text-muted-foreground">
                      {userInfo?.bmr} Kcal
                    </span>
                  </p>
                  <p className="text-xs ">
                    Base Line Activity:{" "}
                    <span className="text-sm text-muted-foreground">
                      {Number(TDEE - (userInfo?.bmr || 0)).toFixed(0)} Kcal
                    </span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Weight Progression
                  </CardTitle>
                  <Activity className="h-4 w-4 text-teal-400" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <p className="text-2xl font-bold mb-2">
                      Goal: {goalWeight}{" "}
                      {userInfo?.weight_goal_unit === "lb" ? "lbs" : "kg"}
                    </p>
                    <p className="text-xs text-green-500 flex mt-2">
                      {handleRateChangeColor(
                        weeklyRate,
                        userInfo?.goal || "",
                        userInfo?.starting_weight_unit || "",
                        " since last week",
                        isDark
                      )}
                    </p>
                  </div>
                  <Progress value={progress} />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {startWeight}{" "}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: {currentWeight}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {goalWeight}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Progress: {progress}% of your goal
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Events
                  </CardTitle>
                  <CalendarDays className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent className="flex gap-4">
                  <div className="flex flex-col w-1/2">
                    <p className="text-xl font-bold">Sunday, Mar 24th</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      All-day events
                    </p>
                    <Button className="w-fit">
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <div className="flex gap-2">
                      <div className="w-[1px] h-5 bg-red-400" />
                      <p className="text-sm">Fasted Cardio</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-[1px] h-5 bg-orange-400" />
                      <p className="text-sm">Chest A</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-[1px] h-5 bg-teal-400" />
                      <p className="text-sm">2 miles run</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* workout sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Workout Sessions</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    March 15, 2025 - March 21, 2025
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="h-[300px] overflow-y-auto">
                <div className="space-y-5 ">
                  {recentSales.map((log) => (
                    <div key={log.name}>
                      <div className="flex justify-between mb-5">
                        <div className=" w-3/10">
                          <p className="text-sm font-bold truncate">
                            {log.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {log.program}
                          </p>
                        </div>
                        <div className=" w-3/10 flex justify-center items-center">
                          <p className="text-sm text-muted-foreground">
                            {log.date}
                          </p>
                        </div>
                        <div className="w-3/10 flex justify-end">
                          <Button>View</Button>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Sales */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Sets</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart />
              </CardContent>
            </Card>
            <Card>
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
              <LineChart weightLogData={[]} view={"both"} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

const recentSales = [
  {
    name: "Push A",
    program: "5 day split",
    date: "Mar 15, 2025",
  },
  {
    name: "Pull A",
    program: "5 day split",
    date: "Mar 16, 2025",
  },
  {
    name: "Legs A",
    program: "5 day split",
    date: "Mar 17, 2025",
  },
  {
    name: "Push B",
    program: "5 day split",
    date: "Mar 18, 2025",
  },
  {
    name: "Pull B",
    program: "5 day split",
    date: "Mar 19, 2025",
  },
  {
    name: "Legs B",
    program: "5 day split",
    date: "Mar 20, 2025",
  },
];
