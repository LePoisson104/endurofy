import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useRef, useState } from "react";

export default function FeetInchesSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: number) => void;
}) {
  // Track if this is the initial render
  const isInitialMount = useRef(true);

  // Parse the incoming total inches value - fallback to 0 if invalid
  const totalInches = parseInt(value) || 0;

  // Calculate feet and inches from total inches
  const calculatedFeet = Math.floor(totalInches / 12);
  const calculatedInches = totalInches % 12;

  // Set state with calculated values
  const [feet, setFeet] = useState<number>(calculatedFeet);
  const [inches, setInches] = useState<number>(calculatedInches);

  // Sync with external value changes
  useEffect(() => {
    // Skip the first render to avoid circular updates
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newTotalInches = parseInt(value) || 0;
    const newFeet = Math.floor(newTotalInches / 12);
    const newInches = newTotalInches % 12;

    // Only update if values actually changed
    if (newFeet !== feet) {
      setFeet(newFeet);
    }

    if (newInches !== inches) {
      setInches(newInches);
    }
  }, [value]);

  // Handle feet change without triggering unnecessary state updates
  const handleFeetChange = (newFeetStr: string) => {
    const newFeet = parseInt(newFeetStr) || 0;
    setFeet(newFeet);

    // Calculate and report the total inches
    const newTotalInches = newFeet * 12 + inches;
    onChange(newTotalInches);
  };

  // Handle inches change without triggering unnecessary state updates
  const handleInchesChange = (newInchesStr: string) => {
    const newInches = parseInt(newInchesStr) || 0;
    setInches(newInches);

    // Calculate and report the total inches
    const newTotalInches = feet * 12 + newInches;
    onChange(newTotalInches);
  };

  return (
    <div className="flex gap-2">
      <Select value={feet.toString()} onValueChange={handleFeetChange}>
        <SelectTrigger>
          <SelectValue placeholder="Feet" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">0'</SelectItem>
          <SelectItem value="1">1'</SelectItem>
          <SelectItem value="2">2'</SelectItem>
          <SelectItem value="3">3'</SelectItem>
          <SelectItem value="4">4'</SelectItem>
          <SelectItem value="5">5'</SelectItem>
          <SelectItem value="6">6'</SelectItem>
          <SelectItem value="7">7'</SelectItem>
        </SelectContent>
      </Select>
      <Select value={inches.toString()} onValueChange={handleInchesChange}>
        <SelectTrigger>
          <SelectValue placeholder="Inches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">0''</SelectItem>
          <SelectItem value="1">1''</SelectItem>
          <SelectItem value="2">2''</SelectItem>
          <SelectItem value="3">3''</SelectItem>
          <SelectItem value="4">4''</SelectItem>
          <SelectItem value="5">5''</SelectItem>
          <SelectItem value="6">6''</SelectItem>
          <SelectItem value="7">7''</SelectItem>
          <SelectItem value="8">8''</SelectItem>
          <SelectItem value="9">9''</SelectItem>
          <SelectItem value="10">10''</SelectItem>
          <SelectItem value="11">11''</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
