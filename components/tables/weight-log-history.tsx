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

export default function WeightLogHistory({
  weightHistory,
  goal,
}: {
  weightHistory: any;
  goal: string;
}) {
  const handleWeightUnit = (weight_unit: string, rateChange: number) => {
    if (weight_unit === "lb" && Math.abs(rateChange) > 1) {
      return "lbs";
    } else if (weight_unit === "lb" && Math.abs(rateChange) < 1) {
      return "lb";
    } else if (weight_unit === "kg" && Math.abs(rateChange) > 1) {
      return "kg";
    } else if (weight_unit === "kg" && Math.abs(rateChange) < 1) {
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
        <span className="text-green-400 flex items-center">
          <ChevronDown className="h-4 w-4" />
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    } else if (goal === "lose" && rateChange > 0) {
      return (
        <span className="text-red-400 flex items-center">
          <ChevronUp className="h-4 w-4" />
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    } else if (goal === "gain" && rateChange < 0) {
      return (
        <span className="text-red-400 flex items-center">
          <ChevronDown className="h-4 w-4" />
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    } else if (goal === "gain" && rateChange > 0) {
      return (
        <span className="text-green-400 flex items-center">
          <ChevronUp className="h-4 w-4" />
          {Math.abs(rateChange)}
          {handleWeightUnit(weight_unit, rateChange)}
        </span>
      );
    } else {
      return (
        <span className="text-gray-400 flex items-center">
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">
              Weight History
            </CardTitle>
            <History className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            {weightHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="text-center">
                    <TableHead>Actions</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>
                      Weight (
                      {weightHistory?.data?.[0]?.weight_unit === "lb"
                        ? "lbs"
                        : "kg"}
                      )
                    </TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weightHistory?.data?.map((entry: any, index: number) => {
                    const prevWeight =
                      index < weightHistory?.data?.length - 1
                        ? weightHistory?.data?.[index + 1].weight
                        : entry.weight;
                    const change = entry.weight - prevWeight;
                    return (
                      <TableRow key={entry.log_date}>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" side="right">
                              <DropdownMenuItem
                                onClick={() =>
                                  alert(`Edit entry from ${entry.log_date}`)
                                }
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  alert(`Delete entry from ${entry.log_date}`)
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          {format(new Date(entry.log_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {Number(entry.weight)}{" "}
                          <span className="text-xs text-muted-foreground">
                            {entry.weight_unit === "lb" ? "lbs" : "kg"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {handleRateChangeColor(
                            entry.rateChange,
                            goal,
                            entry.weight_unit
                          )}
                        </TableCell>
                        <TableCell>{entry.note}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
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
