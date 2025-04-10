import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectWeightStates } from "@/api/user/user-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  useCreateWeightLogMutation,
  useUpdateWeightLogMutation,
} from "@/api/weight-log/weight-log-api-slice";
import useBreakpoint from "@/hooks/use-break-point";

export interface WeightForm {
  weight: number;
  weightUnit: string;
  caloriesIntake: number;
  logDate: string;
  notes: string;
}

export default function WeightForm({
  weightLogData,
  setError,
  setWeightLogData,
  formData,
  setFormData,
  setModalOpen,
}: {
  weightLogData: any;
  setError: (error: string) => void;
  setWeightLogData: (weightLogData: any) => void;
  formData: WeightForm;
  setFormData: React.Dispatch<React.SetStateAction<WeightForm>>;
  setModalOpen: (modalOpen: boolean) => void;
}) {
  const breakpoint = useBreakpoint();
  const weightStates = useSelector(selectWeightStates);
  const user = useSelector(selectCurrentUser);
  const [calendarDate, setCalendarDate] = useState<Date>();
  const [createWeightLog, { isLoading: isCreating }] =
    useCreateWeightLogMutation();
  const [updateWeightLog, { isLoading: isUpdating }] =
    useUpdateWeightLogMutation();

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
    }
  }, [weightLogData, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      caloriesIntake: Math.round(formData.caloriesIntake),
    };

    try {
      if (weightLogData) {
        await updateWeightLog({
          userId: user?.user_id,
          weightLogId: weightLogData.weight_log_id,
          weightLogPayload: {
            ...submitData,
            logDate: format(submitData.logDate, "yyyy-MM-dd"),
          },
        }).unwrap();
      } else {
        await createWeightLog({
          userId: user?.user_id,
          weightLogPayload: {
            ...submitData,
            logDate: format(submitData.logDate, "yyyy-MM-dd"),
          },
        }).unwrap();
      }

      // Reset form data
      setFormData({
        weight: 0,
        weightUnit: weightStates.current_weight_unit,
        logDate: "",
        notes: "",
        caloriesIntake: 0,
      });
      setWeightLogData(null);
      if (breakpoint !== "lg") {
        setModalOpen(false);
      }
    } catch (error: any) {
      if (!error.status) {
        setError("No Server Response");
      } else if (error.status === 400) {
        setError(error.data?.message);
      } else {
        setError(error.data?.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weight" className="text-sm">
          Weight ({formData.weightUnit === "lb" ? "lbs" : "kg"})
        </Label>
        <Input
          id="weight"
          type="number"
          placeholder="Enter weight"
          className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm"
          value={formData.weight || ""}
          onChange={(e) => {
            let value = Number.parseFloat(e.target.value);
            if (value < 1) value = 1;
            if (value > 1000) value = 1000;
            setFormData({ ...formData, weight: value });
          }}
          required
        />
      </div>
      <div>
        <Label htmlFor="weight" className="text-sm ">
          Expected Calories Intake (Kcal)
        </Label>
        <Input
          id="weight"
          type="number"
          placeholder="Enter calories"
          className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm"
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
                selected={calendarDate}
                onSelect={(day: Date | undefined) => setCalendarDate(day)}
                required
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
          <Input
            id="date"
            type="text"
            pattern="\d{2}/\d{2}/\d{4}"
            placeholder="MM/DD/YYYY"
            className="placeholder:text-sm w-full"
            value={formData.logDate}
            onChange={(e) => {
              setFormData({ ...formData, logDate: e.target.value });
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note" className="text-sm">
          Notes (optional)
        </Label>
        <Input
          id="note"
          placeholder="Add notes (50 characters max)"
          className="placeholder:text-sm"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                weightUnit: weightStates.current_weight_unit,
                logDate: "",
                notes: "",
                caloriesIntake: 0,
              });
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
