import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useCallback, useRef } from "react";
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
import { parse, format } from "date-fns";
import useBreakpoint from "@/hooks/use-break-point";
import handleRateChangeColor from "@/helper/handle-rate-change";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function WeightLogHistory({
  weightHistory,
  goal,
  startDate,
  endDate,
  userId,
  setWeightLogData,
  options,
  setOptions,
  setModalOpen,
}: {
  weightHistory: any;
  goal: string;
  startDate: string;
  endDate: string;
  userId: string;
  options: string;
  setOptions: (options: string) => void;
  setWeightLogData: (weightLogData: any) => void;
  setModalOpen: (modalOpen: boolean) => void;
}) {
  const isDark = useGetCurrentTheme();
  const breakpoint = useBreakpoint();
  const parsedStart = parse(startDate, "yyyy-MM-dd", new Date());
  const parsedEnd = parse(endDate, "yyyy-MM-dd", new Date());
  const isMobile = useIsMobile();
  const [deleteWeightLog] = useDeleteWeightLogMutation();
  const areAllNotesEmpty = useCallback((): boolean => {
    if (!weightHistory?.data) return true;
    return weightHistory?.data.every(
      (log: any) => log.notes === null || log.notes.length === 0
    );
  }, [weightHistory]);

  const isNotesEmpty = areAllNotesEmpty();
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: weightHistory?.data?.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 50,
    overscan: 50,
  });

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
                {format(parsedStart, "MMM d, yyyy")} -{" "}
                {format(parsedEnd, "MMM d, yyyy")}
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
                <SelectItem value="current-week" className="rounded-lg">
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
          </CardHeader>
          <CardContent className="">
            {weightHistory?.data?.length > 0 ? (
              <div
                ref={scrollRef}
                className="max-h-[440px] relative overflow-y-auto w-full"
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize() + 75}px`,
                    position: "relative",
                  }}
                >
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="text-center border-b-2">
                        <TableHead className="py-4 text-center">
                          Actions
                        </TableHead>
                        <TableHead className="py-4 text-center">Date</TableHead>
                        <TableHead className="py-4 text-center">
                          Weight (
                          {weightHistory?.data?.[0]?.weight_unit === "lb"
                            ? "lbs"
                            : "kg"}
                          )
                        </TableHead>
                        <TableHead className="py-4 text-center">
                          Daily Rate
                        </TableHead>
                        <TableHead className="py-4 text-center">
                          Weekly Rate
                        </TableHead>
                        <TableHead className="py-4 text-center">
                          Calories (Kcal)
                        </TableHead>
                        {!isNotesEmpty && (
                          <TableHead className="py-4 text-center">
                            Notes
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rowVirtualizer
                        .getVirtualItems()
                        .map(({ index, key, size, start }) => {
                          const entry = weightHistory?.data?.[index];
                          return (
                            <TableRow
                              key={key}
                              className={`hover:bg-muted/50 ${
                                index % 2 === 0 ? "bg-muted/20" : ""
                              }`}
                              style={{
                                height: `${size}px`,
                                transform: `translateY(${
                                  start - index * size
                                }px)`,
                              }}
                            >
                              <TableCell className="py-2 text-center ">
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
                                        if (breakpoint !== "lg") {
                                          setModalOpen(true);
                                        }
                                      }}
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        deleteWeightLog({
                                          userId: userId,
                                          weightLogId: entry.weight_log_id,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                              <TableCell className="py-4 text-center">
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

                              <TableCell className="px-1 py-4 text-center">
                                {Number(entry.weight)}{" "}
                                <span className="text-xs text-muted-foreground">
                                  {entry.weight_unit === "lb" ? "lbs" : "kg"}
                                </span>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                {handleRateChangeColor(
                                  entry.weightChange,
                                  goal,
                                  entry.weight_unit,
                                  "",
                                  isDark
                                )}
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                {handleRateChangeColor(
                                  entry.weeklyRate,
                                  goal,
                                  entry.weight_unit,
                                  "",
                                  isDark
                                )}
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                {Number(entry.calories_intake)}{" "}
                                <span className="text-xs text-muted-foreground">
                                  Kcal
                                </span>
                              </TableCell>
                              {!isNotesEmpty && (
                                <TableCell className="py-4 pl-8">
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
        <Skeleton className="h-[440px] w-full" />
      )}
    </>
  );
}
