import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { selectWeightStates } from "@/api/user/user-slice";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface WeightForm {
  weight: number;
  weightUnit: string;
  caloriesIntake: number;
  date: string;
  notes: string;
}

export default function WeightForm() {
  const weightStates = useSelector(selectWeightStates);
  const [weightForm, setWeightForm] = useState<WeightForm>({
    weight: 0,
    weightUnit: weightStates.current_weight_unit,
    date: "",
    notes: "",
    caloriesIntake: 0,
  });
  const [calendarDate, setCalendarDate] = useState<Date>();

  useEffect(() => {
    setWeightForm((prev) => ({
      ...prev,
      date: calendarDate ? format(calendarDate, "MM/dd/yyyy") : "",
    }));
  }, [calendarDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    weightForm.date = format(weightForm.date, "yyyy-MM-dd");
    weightForm.caloriesIntake = Math.round(weightForm.caloriesIntake);
    console.log(weightForm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weight" className="text-sm ">
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
            defaultValue={weightForm.date}
            onChange={(e) => {
              setWeightForm({ ...weightForm, date: e.target.value });
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
        />
      </div>
      <Button type="submit" className="w-full">
        Add Entry
      </Button>
    </form>
  );
}
