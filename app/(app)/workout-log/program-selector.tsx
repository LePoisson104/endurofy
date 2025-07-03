"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkoutProgram } from "../../../interfaces/workout-program-interfaces";

interface ProgramSelectorProps {
  programs: WorkoutProgram[];
  selectedProgramId: string;
  onSelectProgram: (programId: string) => void;
}

export function ProgramSelector({
  programs,
  selectedProgramId,
  onSelectProgram,
}: ProgramSelectorProps) {
  return (
    <div className="space-y-2 mb-3">
      <Select
        value={selectedProgramId || "manual"}
        onValueChange={onSelectProgram}
      >
        <SelectTrigger id="program-select">
          <SelectValue placeholder="Choose a workout program" />
        </SelectTrigger>

        {programs && (
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program?.programId} value={program?.programId}>
                {program?.programType === "manual"
                  ? "Without Program"
                  : program?.programName}
              </SelectItem>
            ))}
          </SelectContent>
        )}
      </Select>
    </div>
  );
}
