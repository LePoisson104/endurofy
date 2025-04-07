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
import { useCreateWeightLogMutation } from "@/api/weight-log/weight-log-api-slice";

interface WeightForm {
  weight: number;
  weightUnit: string;
  caloriesIntake: number;
  logDate: string;
  notes: string;
}

export default function WeightForm({
  setError,
}: {
  setError: (error: string) => void;
}) {
  const weightStates = useSelector(selectWeightStates);
  const user = useSelector(selectCurrentUser);
  const [weightForm, setWeightForm] = useState<WeightForm>({
    weight: 0,
    weightUnit: weightStates.current_weight_unit,
    logDate: "",
    notes: "",
    caloriesIntake: 0,
  });
  const [calendarDate, setCalendarDate] = useState<Date>();
  const [createWeightLog, { isLoading }] = useCreateWeightLogMutation();

  useEffect(() => {
    setWeightForm((prev) => ({
      ...prev,
      logDate: calendarDate ? format(calendarDate, "MM/dd/yyyy") : "",
    }));
  }, [calendarDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    weightForm.logDate = format(weightForm.logDate, "yyyy-MM-dd");
    weightForm.caloriesIntake = Math.round(weightForm.caloriesIntake);

    try {
      await createWeightLog({
        userId: user?.user_id,
        weightLogPayload: weightForm,
      }).unwrap();
      setWeightForm({
        weight: 0,
        weightUnit: weightStates.current_weight_unit,
        logDate: "",
        notes: "",
        caloriesIntake: 0,
      });
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
          Weight ({weightForm.weightUnit === "lb" ? "lbs" : "kg"})
        </Label>
        <Input
          id="weight"
          type="number"
          placeholder="Enter weight"
          className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm"
          value={weightForm?.weight || ""}
          onChange={(e) => {
            let value = Number.parseFloat(e.target.value);
            if (value < 1) value = 1;
            if (value > 1000) value = 1000;
            setWeightForm({ ...weightForm, weight: value });
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
          value={weightForm?.caloriesIntake || ""}
          onChange={(e) => {
            let value = Number.parseFloat(e.target.value);
            if (value < 1) value = 1;
            if (value > 100000) value = 100000;
            setWeightForm({ ...weightForm, caloriesIntake: value });
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
              />
            </PopoverContent>
          </Popover>
          <Input
            id="date"
            type="text"
            pattern="\d{2}/\d{2}/\d{4}"
            placeholder="MM/DD/YYYY"
            className="placeholder:text-sm w-full"
            defaultValue={weightForm.logDate}
            onChange={(e) => {
              setWeightForm({ ...weightForm, logDate: e.target.value });
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
          value={weightForm.notes}
          onChange={(e) =>
            setWeightForm({ ...weightForm, notes: e.target.value })
          }
          maxLength={50}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : "Add Entry"}
      </Button>
    </form>
  );
}
