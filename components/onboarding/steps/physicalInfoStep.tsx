import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ruler, Weight } from "lucide-react";
import { UserData } from "@/interfaces/userOnboardData";
import ContinueBtn from "./continnueBtn";
import FeetInchesSelect from "@/components/selects/feet-inches-select";

interface PhysicalInfoStepProps {
  data: UserData;
  onNext: (data: Partial<UserData>) => void;
}

// Conversion constants
const CM_TO_INCHES = 0.393701;
const INCHES_TO_CM = 2.54;
const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;

export default function PhysicalInfoStep({
  data,
  onNext,
}: PhysicalInfoStepProps) {
  const [height, setHeight] = useState<number>(data.height || 0);
  const [heightUnit, setHeightUnit] = useState<"ft" | "cm">(
    data.height_unit || "ft"
  );
  const [weight, setWeight] = useState<number>(data.weight || 0);
  const [weightUnit, setWeightUnit] = useState<"lb" | "kg">(
    data.weight_unit || "lb"
  );

  const handleNext = () => {
    if (height > 0 && weight > 0) {
      onNext({
        height,
        height_unit: heightUnit,
        weight,
        weight_unit: weightUnit,
      });
    }
  };

  // Handle height unit changes with proper conversion
  const handleHeightUnitChange = (newUnit: "ft" | "cm") => {
    if (newUnit !== heightUnit && height > 0) {
      let newHeight: number;

      if (newUnit === "cm" && heightUnit === "ft") {
        // Convert from inches to cm
        newHeight = Math.round(height * INCHES_TO_CM);
      } else if (newUnit === "ft" && heightUnit === "cm") {
        // Convert from cm to inches
        newHeight = Math.round(height * CM_TO_INCHES);
      } else {
        newHeight = height;
      }

      setHeight(newHeight);
    }
    setHeightUnit(newUnit);
  };

  // Handle weight unit changes with proper conversion
  const handleWeightUnitChange = (newUnit: "lb" | "kg") => {
    if (newUnit !== weightUnit && weight > 0) {
      let newWeight: number;

      if (newUnit === "kg" && weightUnit === "lb") {
        // Convert lb to kg
        newWeight = Number((weight * LB_TO_KG).toFixed(1));
      } else if (newUnit === "lb" && weightUnit === "kg") {
        // Convert kg to lb
        newWeight = Number((weight * KG_TO_LB).toFixed(1));
      } else {
        newWeight = weight;
      }

      setWeight(newWeight);
    }
    setWeightUnit(newUnit);
  };

  // Special handler for feet/inches selection
  const handleFeetInchesChange = (totalInches: number) => {
    setHeight(totalInches);
  };

  const isValid = height > 0 && weight > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          What's your height and weight?
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Help us calculate your BMI and daily calorie needs
        </p>
      </div>

      <div className="grid gap-4">
        <div className="p-4 hover:shadow-soft transition-shadow">
          <div className="space-y-3">
            <Label
              htmlFor="height"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Ruler className="w-4 h-4 text-primary" />
              Height
            </Label>
            <div className="flex gap-2">
              {heightUnit === "ft" ? (
                <FeetInchesSelect
                  value={height.toString()}
                  onChange={handleFeetInchesChange}
                />
              ) : (
                <Input
                  id="height"
                  type="number"
                  inputMode="numeric"
                  placeholder="Height in cm"
                  value={height || ""}
                  onChange={(e) => {
                    let value = Number.parseFloat(e.target.value) || 0;
                    if (value < 0) value = 0;
                    if (value > 251) value = 251;
                    setHeight(value);
                  }}
                  className="text-center"
                  min="100"
                  max="251"
                />
              )}
              <Select value={heightUnit} onValueChange={handleHeightUnitChange}>
                <SelectTrigger className="w-[140px] h-12">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ft">US units</SelectItem>
                  <SelectItem value="cm">Metric (cm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-4 hover:shadow-soft transition-shadow">
          <div className="space-y-3">
            <Label
              htmlFor="weight"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Weight className="w-4 h-4 text-primary" />
              Current Weight
            </Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                inputMode="decimal"
                placeholder={
                  weightUnit === "kg" ? "Weight in kg" : "Weight in lbs"
                }
                value={weight || ""}
                onChange={(e) => {
                  let value = Number.parseFloat(e.target.value) || 0;
                  if (value < 0) value = 0;
                  if (value > 1000) value = 1000;
                  setWeight(value);
                }}
                className="text-center"
                min="30"
                max="1000"
                step="0.1"
              />
              <Select value={weightUnit} onValueChange={handleWeightUnitChange}>
                <SelectTrigger className="w-[100px] h-12">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <ContinueBtn onClick={handleNext} disabled={!isValid} />
    </div>
  );
}
