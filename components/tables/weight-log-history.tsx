import { EllipsisVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useCallback, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { History, ChevronDown, ChevronUp } from "lucide-react";
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
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

type WeightLogHistoryProps = {
  weightHistory: any;
  goal: string;
  startDate: string;
  endDate: string;
  userId: string;
  options: string;
  setOptions: (options: string) => void;
  setWeightLogData: (weightLogData: any) => void;
  setModalOpen: (modalOpen: boolean) => void;
};

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
}: WeightLogHistoryProps) {
  const isDark = useGetCurrentTheme();
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();

  const parsedStart = parse(startDate, "yyyy-MM-dd", new Date());
  const parsedEnd = parse(endDate, "yyyy-MM-dd", new Date());

  const [showNotes, setShowNotes] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [deleteWeightLog] = useDeleteWeightLogMutation();

  const areAllNotesEmpty = useCallback((): boolean => {
    if (!weightHistory?.data) return true;
    return weightHistory?.data.every(
      (log: any) => log.notes === null || log.notes.length === 0
    );
  }, [weightHistory]);

  const isNotesEmpty = areAllNotesEmpty();
  const scrollRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="right">
                <DropdownMenuItem
                  onClick={() => {
                    setWeightLogData(row.original);
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
                      weightLogId: row.original.weight_log_id,
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 60,
      },
      {
        accessorKey: "log_date",
        header: "Date",
        cell: ({ row }) => {
          const date = new Date(row.original.log_date);
          const dateFormat =
            isMobile && date.getFullYear() === new Date().getFullYear()
              ? format(date, "MMM d")
              : format(date, "MMM d, yyyy");
          return <div className="text-center">{dateFormat}</div>;
        },
        size: 100,
      },
      {
        accessorKey: "weight",
        header: () => (
          <span>
            Weight (
            {weightHistory?.data?.[0]?.weight_unit === "lb" ? "lbs" : "kg"})
          </span>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {Number(row.original.weight)}{" "}
            <span className="text-xs text-muted-foreground">
              {row.original.weight_unit === "lb" ? "lbs" : "kg"}
            </span>
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "weightChange",
        header: "Daily Rate",
        cell: ({ row }) => (
          <div className="text-center">
            {handleRateChangeColor(
              row.original.weightChange,
              goal,
              row.original.weight_unit,
              "",
              isDark
            )}
          </div>
        ),
        size: 100,
        enableHiding: true,
      },
      {
        accessorKey: "weeklyRate",
        header: "Weekly Rate",
        cell: ({ row }) => (
          <div className="text-center">
            {handleRateChangeColor(
              row.original.weeklyRate,
              goal,
              row.original.weight_unit,
              "",
              isDark
            )}
          </div>
        ),
        size: 100,
        enableHiding: true,
      },
      {
        accessorKey: "calories_intake",
        header: "Calories (Kcal)",
        cell: ({ row }) => (
          <div className="text-center">
            {Number(row.original.calories_intake)}{" "}
            <span className="text-xs text-muted-foreground">Kcal</span>
          </div>
        ),
        size: 100,
        enableHiding: true,
      },
      ...(showNotes && !isNotesEmpty
        ? [
            {
              accessorKey: "notes",
              header: "Notes",
              cell: ({ row }: { row: any }) => {
                return <div className="text-left">{row.original.notes}</div>;
              },
              size: 200,
            },
          ]
        : []),
    ],
    [isMobile, goal, isDark, showNotes, isNotesEmpty, weightHistory?.data]
  );

  const table = useReactTable({
    data: weightHistory?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      columnVisibility: {
        weightChange: !isMobile,
        weeklyRate: !isMobile,
        calories_intake: !isMobile,
      },
    },
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 60,
    overscan: 20,
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
            <div className="flex gap-2 items-center">
              {!isNotesEmpty && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="h-9"
                >
                  {showNotes ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Notes
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Notes
                    </>
                  )}
                </Button>
              )}
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
            </div>
          </CardHeader>
          <CardContent>
            {weightHistory?.data?.length > 0 ? (
              <div ref={scrollRef} className="h-[480px] overflow-auto">
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                  }}
                >
                  <table className="w-full border-collapse">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b">
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              colSpan={header.colSpan}
                              style={{
                                width: header.getSize(),
                                minWidth: header.getSize(),
                              }}
                              className="py-4 px-2 text-sm font-medium text-muted-foreground whitespace-nowrap"
                            >
                              {header.isPlaceholder ? null : (
                                <div
                                  className={
                                    header.column.getCanSort()
                                      ? "cursor-pointer select-none hover:text-foreground"
                                      : ""
                                  }
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getIsSorted() === "asc" ? (
                                    <ChevronUp className="ml-2 inline-block h-4 w-4" />
                                  ) : header.column.getIsSorted() === "desc" ? (
                                    <ChevronDown className="ml-2 inline-block h-4 w-4" />
                                  ) : null}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {virtualizer
                        .getVirtualItems()
                        .map((virtualRow, index) => {
                          const row = rows[virtualRow.index];
                          return (
                            <tr
                              key={row.id}
                              className={`hover:bg-muted/50 transition-colors ${
                                virtualRow.index % 2 === 0 ? "bg-muted/20" : ""
                              }`}
                              style={{
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${
                                  virtualRow.start - index * virtualRow.size
                                }px)`,
                              }}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td
                                  key={cell.id}
                                  className="py-3 px-2 text-sm border-b border-border/50 whitespace-nowrap"
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
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
