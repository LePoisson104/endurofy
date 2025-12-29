"use client";

import { useState, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { MobileFilterCard } from "@/components/filters/mobile-filter-card";
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";

const PERIODS = [
  { value: "7day", label: "Last 7 Days" },
  { value: "14day", label: "Last 14 Days" },
  { value: "30day", label: "Last 30 Days" },
  { value: "90day", label: "Last 3 months" },
  { value: "day range", label: "Day Range" },
];

interface UnifiedFilterWrapperProps {
  // Common props
  programs: WorkoutProgram[] | null;
  selectedProgram: WorkoutProgram | null | string;
  selectedPeriod: string;
  startDate?: Date;
  endDate?: Date;
  onProgramChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
  onReset: () => void;

  // Customization props
  customFilterSection?: ReactNode; // Render prop for custom filter (Exercise or Day)
  customMobileSecondaryLabel?: ReactNode; // Secondary label for mobile view
  customMobileBadge?: ReactNode; // Badge for mobile view
  customDesktopSummary?: ReactNode; // Desktop summary section

  // Optional customization
  title?: string;
  description?: string;
  useCard?: boolean; // If false, uses plain div for desktop
  useHorizontalLayout?: boolean; // If true, uses horizontal grid layout for desktop
}

function FilterContent({
  programs,
  selectedProgram,
  selectedPeriod,
  startDate,
  endDate,
  onProgramChange,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  customFilterSection,
  useHorizontalLayout = false,
}: Omit<
  UnifiedFilterWrapperProps,
  | "onReset"
  | "customMobileSecondaryLabel"
  | "customMobileBadge"
  | "customDesktopSummary"
  | "title"
  | "description"
  | "useCard"
>) {
  const isDayRange = selectedPeriod === "day range";

  // Handle both WorkoutProgram object and string programId
  const programValue =
    typeof selectedProgram === "string"
      ? programs?.find((p) => p.programId === selectedProgram)?.programName ||
        ""
      : selectedProgram?.programName || "";

  const programSelect = (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Program
      </label>
      <Select
        value={programValue}
        onValueChange={(value) => {
          const programId =
            programs?.find((program) => program.programName === value)
              ?.programId || "";
          onProgramChange(programId);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select program" />
        </SelectTrigger>
        <SelectContent>
          {programs?.map((program) => (
            <SelectItem key={program.programId} value={program.programName}>
              {program.programName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const periodSelect = (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Period
      </label>
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const dateRangePickers = isDayRange && (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Start Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => onStartDateChange?.(date || undefined)}
              disabled={(date) => (endDate ? date > endDate : false)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          End Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => onEndDateChange?.(date || undefined)}
              disabled={(date) => (startDate ? date < startDate : false)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  if (useHorizontalLayout) {
    return (
      <div className="space-y-4">
        {/* Horizontal Grid Layout for Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programSelect}
          {customFilterSection}
          {periodSelect}
        </div>
        {/* Date Range Pickers */}
        {dateRangePickers}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {programSelect}
      {customFilterSection}
      {periodSelect}
      {dateRangePickers}
    </div>
  );
}

export function UnifiedFilterWrapper(props: UnifiedFilterWrapperProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const {
    selectedProgram,
    selectedPeriod,
    startDate,
    endDate,
    customMobileSecondaryLabel,
    customMobileBadge,
    customDesktopSummary,
    title = "Select Program & Filters",
    description = "Choose a program and filters to view detailed analytics",
    useCard = true,
  } = props;

  const getPeriodDisplay = () => {
    if (selectedPeriod === "day range" && startDate && endDate) {
      return `${format(startDate, "MMM d")} - ${format(
        endDate,
        "MMM d, yyyy"
      )}`;
    }
    return PERIODS.find((p) => p.value === selectedPeriod)?.label;
  };

  // Get program name for display
  const programName =
    typeof selectedProgram === "string"
      ? props.programs?.find((p) => p.programId === selectedProgram)
          ?.programName
      : selectedProgram?.programName;

  if (isMobile) {
    return (
      <MobileFilterCard
        open={open}
        onOpenChange={setOpen}
        drawerTitle="Filter Settings"
        drawerDescription={description}
        primaryLabel={programName || ""}
        secondaryLabel={customMobileSecondaryLabel}
        badge={customMobileBadge}
        periodDisplay={getPeriodDisplay() || ""}
        onReset={props.onReset}
      >
        <FilterContent
          programs={props.programs}
          selectedProgram={props.selectedProgram}
          selectedPeriod={props.selectedPeriod}
          startDate={props.startDate}
          endDate={props.endDate}
          onProgramChange={props.onProgramChange}
          onPeriodChange={props.onPeriodChange}
          onStartDateChange={props.onStartDateChange}
          onEndDateChange={props.onEndDateChange}
          customFilterSection={props.customFilterSection}
        />
      </MobileFilterCard>
    );
  }

  // Desktop view
  const content = (
    <>
      <div className={useCard ? "space-y-4" : "space-y-4"}>
        <FilterContent
          programs={props.programs}
          selectedProgram={props.selectedProgram}
          selectedPeriod={props.selectedPeriod}
          startDate={props.startDate}
          endDate={props.endDate}
          onProgramChange={props.onProgramChange}
          onPeriodChange={props.onPeriodChange}
          onStartDateChange={props.onStartDateChange}
          onEndDateChange={props.onEndDateChange}
          customFilterSection={props.customFilterSection}
          useHorizontalLayout={props.useHorizontalLayout}
        />
      </div>

      {customDesktopSummary && (
        <>
          <div className="border-t" />
          {customDesktopSummary}
        </>
      )}

      {!customDesktopSummary && (
        <>
          <div className="border-t" />
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={props.onReset}
              className="shrink-0"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </>
      )}
    </>
  );

  if (useCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{content}</CardContent>
      </Card>
    );
  }

  return <div className="bg-card rounded-lg p-4 space-y-4">{content}</div>;
}
