"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DateInput({
  id,
  label,
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  className = "",
  required = false,
  disabled = false,
}: DateInputProps) {
  // Parse date string to Date object for calendar
  const parseDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;

    try {
      if (dateStr.includes("/")) {
        // MM/DD/YYYY format
        const [month, day, year] = dateStr.split("/");
        const parsedDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        // Validate the date is valid
        if (isNaN(parsedDate.getTime())) return undefined;
        return parsedDate;
      } else if (dateStr.includes("-")) {
        // YYYY-MM-DD format
        const parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) return undefined;
        return parsedDate;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  };

  // Format Date object to MM/DD/YYYY string
  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Handle calendar selection
  const handleCalendarSelect = (day: Date | undefined) => {
    if (day) {
      const displayDate = formatDate(day);
      onChange(displayDate);
    }
  };

  // Get default month for calendar
  const getDefaultMonth = (): Date => {
    const parsedDate = parseDate(value);
    return parsedDate || new Date();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-sm">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-fit rounded-lg"
              disabled={disabled}
              type="button"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={parseDate(value)}
              defaultMonth={getDefaultMonth()}
              className="rounded-md border shadow-sm"
              captionLayout="dropdown"
              onSelect={handleCalendarSelect}
              disabled={(date: Date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          className="w-full text-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
