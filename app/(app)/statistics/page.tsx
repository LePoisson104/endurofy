"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LineChart from "@/components/charts/line-chart";
import BarChart from "@/components/charts/bar-chart";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EllipsisVertical,
  FileImage,
  FileVideo,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("90d");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState("line");
  return (
    <div className="p-[1rem] w-full">
      {/* page header */}
      <div className="flex flex-col mb-6">
        <div className="text-2xl font-bold">Statistics</div>
        <p className="text-sm text-muted-foreground">
          View your progress and statistics
        </p>
      </div>

      {/* Filter section */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Filters</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Download</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileImage className="mr-2 h-4 w-4" />
                <span>Download PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileVideo className="mr-2 h-4 w-4" />
                <span>Download JPG</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Download PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Download CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          {/* date filter */}
          <div
            className={`flex gap-2 mb-2 ${isMobile ? "flex-col" : "flex row"}`}
          >
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-fit rounded-lg"
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

            <div className="flex gap-2">
              <div className="space-y-2 w-fit">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 w-fit">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button variant={"outline"} className="w-fit">
              Reset
            </Button>
          </div>

          {/* tabs */}
          <Tabs
            defaultValue="weight"
            onValueChange={setSelectedTab}
            value={selectedTab}
          >
            <TabsList className="w-full">
              <TabsTrigger value="line">Line Charts</TabsTrigger>
              <TabsTrigger value="bar">Bar Charts</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* charts */}
      <Card className="grid grid-cols-1 gap-4 mt-6 mb-4">
        <CardHeader>
          <CardTitle>
            {selectedTab === "line" ? "Weight log overview" : "Weekly sets"}
          </CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <div className={`w-full ${isMobile ? "h-fit" : "h-[500px]"}`}>
          {selectedTab === "line" ? (
            <LineChart weightLogData={[]} view={"both"} />
          ) : (
            <BarChart className={`${isMobile ? "h-fit" : "h-[500px]"}`} />
          )}
        </div>
      </Card>

      {/* summaries */}
      <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <p className="text-2xl font-bold mb-2">Goal: 173 lbs</p>
              <p className="text-xs text-green-500 flex mt-2">
                <ChevronDown className="h-4 w-4 text-green-500" /> 2 lbs since
                last week
              </p>
            </div>
            <Progress value={33} />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-muted-foreground">185 </p>
              <p className="text-xs text-muted-foreground">Current: 183</p>
              <p className="text-xs text-muted-foreground">173</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Progress: 33% of your goal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
