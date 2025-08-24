import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUserInfo } from "@/api/user/user-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  useCreateWeightLogMutation,
  useUpdateWeightLogMutation,
} from "@/api/weight-log/weight-log-api-slice";
import useBreakpoint from "@/hooks/use-break-point";
import { getDateRange } from "@/helper/get-day-range";
import { useGetWeightLogDatesQuery } from "@/api/weight-log/weight-log-api-slice";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { toast } from "sonner";

export interface WeightForm {
  weight: number;
  weightUnit: string;
  caloriesIntake: number;
  logDate: string;
  notes: string;
}

export default function WeightForm({
  weightLogData,
  setWeightLogData,
  formData,
  setFormData,
  setModalOpen,
}: {
  weightLogData: any;
  setWeightLogData: (weightLogData: any) => void;
  formData: WeightForm;
  setFormData: React.Dispatch<React.SetStateAction<WeightForm>>;
  setModalOpen: (modalOpen: boolean) => void;
}) {
  const isDark = useGetCurrentTheme();
  const breakpoint = useBreakpoint();
  const userInfo = useSelector(selectUserInfo);
  const user = useSelector(selectCurrentUser);

  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());

  const [createWeightLog, { isLoading: isCreating }] =
    useCreateWeightLogMutation();
  const [updateWeightLog, { isLoading: isUpdating }] =
    useUpdateWeightLogMutation();

  const getWeightLogDates = useGetWeightLogDatesQuery({
    userId: user?.user_id,
    startDate: getDateRange({
      currentMonth: visibleMonth,
    }).startDateOfPreviousMonth,
    endDate: getDateRange({
      currentMonth: visibleMonth,
    }).endDateOfPreviousMonth,
  });

  const highlightedDays = getWeightLogDates?.data?.data?.map(
    (date: any) => new Date(date.log_date)
  );

  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    setFormData((prev: WeightForm) => ({
      ...prev,
      logDate: calendarDate ? format(calendarDate, "MM/dd/yyyy") : "",
    }));
  }, [calendarDate, setFormData]);

  useEffect(() => {
    // if weightLogData is not null, then it's update mode
    if (weightLogData) {
      setFormData({
        weight: weightLogData.weight,
        weightUnit: weightLogData.weight_unit,
        caloriesIntake: weightLogData.calories_intake,
        logDate: format(new Date(weightLogData.log_date), "MM/dd/yyyy"),
        notes: weightLogData.notes || "",
      });
      setNotes(weightLogData.notes || "");
    }
  }, [weightLogData, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      caloriesIntake: Math.round(formData.caloriesIntake),
      notes: notes,
    };

    try {
      // edit weight log
      if (weightLogData) {
        await updateWeightLog({
          userId: user?.user_id,
          weightLogId: weightLogData.weight_log_id,
          weightLogPayload: {
            ...submitData,
            logDate: format(submitData.logDate, "yyyy-MM-dd"),
          },
        }).unwrap();
        toast.success("Weight log updated successfully");
        setCalendarDate(null);
        setVisibleMonth(new Date());
      } else {
        // create weight log
        await createWeightLog({
          userId: user?.user_id,
          weightLogPayload: {
            ...submitData,
            logDate: format(submitData.logDate, "yyyy-MM-dd"),
            weightUnit: userInfo?.current_weight_unit,
          },
        }).unwrap();
        toast.success("Weight log created successfully");
        setCalendarDate(null);
        setVisibleMonth(new Date());
      }

      // Reset form data
      setFormData({
        weight: 0,
        weightUnit: "",
        logDate: "",
        notes: "",
        caloriesIntake: 0,
      });
      setWeightLogData(null);
      setNotes("");
      if (breakpoint !== "lg") {
        setModalOpen(false);
      }
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else if (error.status === 400) {
        toast.error(error.data?.message);
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  const getOutsideModifiers = (date: Date) => {
    const isOutside =
      date.getMonth() !== visibleMonth.getMonth() ||
      date.getFullYear() !== visibleMonth.getFullYear();

    const isHighlighted = highlightedDays.some(
      (d: Date) =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
    );

    if (isOutside && isHighlighted) return "outsideHighlighted";
    if (isOutside && !isHighlighted) return "outsideNonHighlighted";

    return null;
  };

  const modifiers = {
    highlighted: highlightedDays,
    outsideHighlighted: (date: Date) =>
      getOutsideModifiers(date) === "outsideHighlighted",
    outsideNonHighlighted: (date: Date) =>
      getOutsideModifiers(date) === "outsideNonHighlighted",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weight" className="text-sm">
          Weight{" "}
          <span className="text-xs text-muted-foreground">
            ({userInfo?.current_weight_unit === "lb" ? "lbs" : "kg"})
          </span>
        </Label>
        <Input
          id="weight"
          type="number"
          placeholder="Enter weight"
          value={formData.weight || ""}
          onChange={(e) => {
            let value = Number.parseFloat(e.target.value);
            if (value < 1) value = 1;
            if (value > 999) value = 999;
            setFormData({ ...formData, weight: value });
          }}
          required
        />
      </div>
      <div>
        <Label htmlFor="weight" className="text-sm ">
          Expected Calories Intake{" "}
          <span className="text-xs text-muted-foreground">(Kcal)</span>
        </Label>
        <Input
          id="weight"
          type="number"
          placeholder="Enter calories"
          value={formData.caloriesIntake || ""}
          onChange={(e) => {
            let value = Number.parseFloat(e.target.value);
            if (value < 1) value = 1;
            if (value > 100000) value = 100000;
            setFormData({ ...formData, caloriesIntake: value });
          }}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm">
          Date
        </Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-fit justify-start text-left font-normal",
                  !calendarDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={calendarDate || undefined}
                onSelect={(day: Date | undefined) => {
                  if (day) {
                    setCalendarDate(day);
                  } else {
                    setCalendarDate(null);
                  }
                }}
                required
                disabled={(date) => date > new Date()}
                modifiers={modifiers}
                modifiersClassNames={{
                  highlighted: `text-blue-400 ${
                    isDark ? "hover:!bg-blue-500" : "hover:!bg-blue-300"
                  }`,
                  outsideHighlighted: "!text-[#90D5FF] hover:!text-black",
                  outsideNonHighlighted: "text-muted-foreground",
                }}
                month={visibleMonth}
                onMonthChange={(month) => setVisibleMonth(month)}
              />
            </PopoverContent>
          </Popover>
          <Input
            id="date"
            type="text"
            pattern="\d{2}/\d{2}/\d{4}"
            placeholder="MM/DD/YYYY"
            className="w-full"
            value={formData.logDate}
            onChange={(e) => {
              setFormData({ ...formData, logDate: e.target.value });
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note" className="text-sm">
          Notes{" "}
          <span className="text-xs text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="note"
          placeholder="Add notes (50 characters max)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={50}
        />
      </div>
      <div className="flex w-full gap-2">
        {weightLogData && (
          <Button
            type="button"
            className="flex-1"
            variant={"outline"}
            onClick={() => {
              setFormData({
                weight: 0,
                weightUnit: "",
                logDate: "",
                notes: "",
                caloriesIntake: 0,
              });
              setNotes("");
              setWeightLogData(null);
            }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className={weightLogData ? "flex-1" : "w-full"}
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating ? (
            <Loader2 className="animate-spin" />
          ) : weightLogData ? (
            "Update Entry"
          ) : (
            "Add Entry"
          )}
        </Button>
      </div>
    </form>
  );
}
