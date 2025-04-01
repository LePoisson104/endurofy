import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";

export default function FeetInchesSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: number) => void;
}) {
  const [feet, setFeet] = useState("0");
  const [inches, setInches] = useState("0");

  useEffect(() => {
    // Convert inches to feet and inches when value changes
    const totalInches = Number(value);
    setFeet(Math.floor(totalInches / 12).toString());
    setInches((totalInches % 12).toString());
  }, [value]);

  const handleFeetChange = (newFeet: string) => {
    setFeet(newFeet);
    const totalInches = Number(newFeet) * 12 + Number(inches);
    onChange(totalInches);
  };

  const handleInchesChange = (newInches: string) => {
    setInches(newInches);
    const totalInches = Number(feet) * 12 + Number(newInches);
    onChange(totalInches);
  };

  return (
    <div className="flex gap-2">
      <Select value={feet} onValueChange={handleFeetChange}>
        <SelectTrigger>
          <SelectValue placeholder="Feet" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1'</SelectItem>
          <SelectItem value="2">2'</SelectItem>
          <SelectItem value="3">3'</SelectItem>
          <SelectItem value="4">4'</SelectItem>
          <SelectItem value="5">5'</SelectItem>
          <SelectItem value="6">6'</SelectItem>
          <SelectItem value="7">7'</SelectItem>
          <SelectItem value="8">8'</SelectItem>
        </SelectContent>
      </Select>
      <Select value={inches} onValueChange={handleInchesChange}>
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
