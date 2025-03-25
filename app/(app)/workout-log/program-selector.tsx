"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkoutProgram } from "../my-programs/page";

interface ProgramSelectorProps {
  programs: WorkoutProgram[];
  selectedProgramId?: string;
  onSelectProgram: (programId: string) => void;
}

export function ProgramSelector({
  programs,
  selectedProgramId,
  onSelectProgram,
}: ProgramSelectorProps) {
  return (
    <div className="space-y-2 mb-3">
      <Select value={selectedProgramId} onValueChange={onSelectProgram}>
        <SelectTrigger id="program-select">
          <SelectValue placeholder="Choose a workout program" />
        </SelectTrigger>
        <SelectContent>
          {programs.map((program) => (
            <SelectItem key={program.id} value={program.id}>
              {program.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
