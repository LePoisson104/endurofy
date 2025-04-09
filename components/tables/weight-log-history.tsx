import {
  ChevronUp,
  ChevronDown,
  EllipsisVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { useCallback, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "../ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { History } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteWeightLogMutation } from "@/api/weight-log/weight-log-api-slice";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

export default function WeightLogHistory({
  weightHistory,
  goal,
  startDate,
  endDate,
  userId,
  setWeightLogData,
  options,
  setOptions,
}: {
  weightHistory: any;
  goal: string;
  startDate: string;
  endDate: string;
  userId: string;
  setWeightLogData: (weightLogData: any) => void;
  options: string;
  setOptions: (options: string) => void;
}) {
  const isMobile = useIsMobile();
  const [deleteWeightLog] = useDeleteWeightLogMutation();
  const areAllNotesEmpty = useCallback((): boolean => {
    if (!weightHistory?.data) return true;
    return weightHistory?.data.every(
      (log: any) => log.notes === null || log.notes.length === 0
    );
  }, [weightHistory]);

  const isNotesEmpty = areAllNotesEmpty();

  const handleWeightUnit = (weight_unit: string, rateChange: number) => {
    if (weight_unit === "lb" && Math.abs(rateChange) > 1) {
      return "lbs";
    } else if (weight_unit === "lb" && Math.abs(rateChange) <= 1) {
      return "lb";
    } else {
      return "kg";
    }
  };

  const handleRateChangeColor = (
    rateChange: number,
    goal: string,
    weight_unit: string
  ) => {
    if (goal === "lose" && rateChange < 0) {
      return (
        <span className="text-green-400 flex items-center justify-center">
          <ChevronDown className="h-4 w-4" />
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    } else if (goal === "lose" && rateChange > 0) {
      return (
        <span className="text-red-400 flex items-center justify-center">
          <ChevronUp className="h-4 w-4" />
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    } else if (goal === "gain" && rateChange < 0) {
      return (
        <span className="text-red-400 flex items-center justify-center">
          <ChevronDown className="h-4 w-4" />
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    } else if (goal === "gain" && rateChange > 0) {
      return (
        <span className="text-green-400 flex items-center justify-center">
          <ChevronUp className="h-4 w-4" />
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    } else {
      return (
        <span className="text-gray-400 flex items-center justify-center">
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    }
  };

  return (
    <>
      {weightHistory ? (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4">
            <div>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <History className="h-4 w-4 text-amber-400" />
                Weight History
              </CardTitle>

              <span className="text-sm text-muted-foreground">
                {format(new Date(startDate), "MMM d, yyyy")} -{" "}
                {format(new Date(endDate), "MMM d, yyyy")}
              </span>
            </div>
            <Select value={options} onValueChange={setOptions}>
              <SelectTrigger
                className="w-fit rounded-lg sm:ml-auto"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  All
                </SelectItem>
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
          <CardContent className="">
            {weightHistory?.data?.length > 0 ? (
              <div>
                <div className="max-h-[440px] overflow-y-auto scroll-bar">
                  <Table className="max-h-[440px] overflow-y-auto scroll-bar">
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="text-center border-b-2">
                        <TableHead className="px-3 sm:px-6 py-4 text-center w-[5%]">
                          Actions
                        </TableHead>
                        <TableHead className="px-3 sm:px-6 py-4 text-center w-[15%]">
                          Date
                        </TableHead>
                        <TableHead className="px-3 sm:px-6 py-4 text-center w-[15%]">
                          Weight (
                          {weightHistory?.data?.[0]?.weight_unit === "lb"
                            ? "lbs"
                            : "kg"}
                          )
                        </TableHead>
                        <TableHead className="px-3 sm:px-6 py-4 text-center w-[15%]">
                          Rate
                        </TableHead>
                        <TableHead className="px-3 sm:px-6 py-4 text-center w-[15%]">
                          Calories (Kcal)
                        </TableHead>
                        {!isNotesEmpty && (
                          <TableHead className="px-3 sm:px-6 py-4 text-center w-[35%]">
                            Notes
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {weightHistory?.data?.map((entry: any, index: number) => {
                        return (
                          <TableRow
                            key={entry.log_date}
                            className={`hover:bg-muted/50 ${
                              index % 2 === 0 ? "bg-muted/20" : ""
                            }`}
                          >
                            <TableCell className="px-3 sm:px-6 py-2 text-center w-[5%]">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <EllipsisVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="center"
                                  side="right"
                                >
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setWeightLogData(entry);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      deleteWeightLog({
                                        userId: userId,
                                        weightLogId: entry.weight_log_id,
                                      })
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell className="px-3 sm:px-6 py-4 text-center w-[15%]">
                              {isMobile
                                ? new Date(entry?.log_date).getFullYear() ===
                                  new Date().getFullYear()
                                  ? format(new Date(entry?.log_date), "MMM d")
                                  : format(
                                      new Date(entry?.log_date),
                                      "MMM d, yyyy"
                                    )
                                : format(
                                    new Date(entry?.log_date),
                                    "MMM d, yyyy"
                                  )}
                            </TableCell>

                            <TableCell className="px-3 sm:px-6 py-4 text-center w-[15%]">
                              {Number(entry.weight)}{" "}
                              <span className="text-xs text-muted-foreground">
                                {entry.weight_unit === "lb" ? "lbs" : "kg"}
                              </span>
                            </TableCell>
                            <TableCell className="px-3 sm:px-6 py-4 text-center w-[15%]">
                              {handleRateChangeColor(
                                entry.rateChange,
                                goal,
                                entry.weight_unit
                              )}
                            </TableCell>
                            <TableCell className="px-3 sm:px-6 py-4 text-center w-[15%]">
                              {Number(entry.calories_intake)}{" "}
                              <span className="text-xs text-muted-foreground">
                                Kcal
                              </span>
                            </TableCell>
                            {!isNotesEmpty && (
                              <TableCell className="px-3 sm:px-6 py-4 w-[35%]">
                                {entry.notes}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-6">
                No weight history found
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Skeleton className="h-[250px] w-full" />
      )}
    </>
  );
}
