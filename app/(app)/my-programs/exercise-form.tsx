"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Exercise } from "./page";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
interface ExerciseFormProps {
  onAddExercise: (exercise: Omit<Exercise, "id">) => void;
}

export function ExerciseForm({ onAddExercise }: ExerciseFormProps) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState(3);
  const [minReps, setMinReps] = useState(8);
  const [maxReps, setMaxReps] = useState(12);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!name.trim()) {
      setError("Please enter an exercise name");
      return;
    }

    if (sets < 1) {
      setError("Sets must be at least 1");
      return;
    }

    if (minReps < 1) {
      setError("Min reps must be at least 1");
      return;
    }

    if (maxReps < minReps) {
      setError("Max reps must be greater than or equal to min reps");
      return;
    }

    // Add exercise
    onAddExercise({
      name: name.trim(),
      sets,
      minReps,
      maxReps,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setName("");
    setSets(3);
    setMinReps(8);
    setMaxReps(12);
    setNotes("");
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="exercise-name">Exercise Name</Label>
        <Input
          id="exercise-name"
          placeholder="e.g., Bench Press"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-sm"
        />
      </div>
      <div className="w-full flex flex-col space-y-2">
        <Label htmlFor="exercise-type">Body Part</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Body Part" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chest">Chest</SelectItem>
            <SelectItem value="shoulders">Shoulders</SelectItem>
            <SelectItem value="triceps">Triceps</SelectItem>
            <SelectItem value="back">Back</SelectItem>
            <SelectItem value="biceps">Biceps</SelectItem>
            <SelectItem value="forearms">Forearms</SelectItem>
            <SelectItem value="quadriceps">Quadriceps</SelectItem>
            <SelectItem value="hamstrings">Hamstrings</SelectItem>
            <SelectItem value="glutes">Glutes</SelectItem>
            <SelectItem value="abs">Abs</SelectItem>
            <SelectItem value="adductors">Adductors</SelectItem>
            <SelectItem value="abductors">Abductors</SelectItem>
            <SelectItem value="calves">Calves</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Action</Label>
        <RadioGroup
          className="flex flex-col sm:flex-row gap-4"
          value={"bilateral"}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bilateral" id="bilateral" />
            <Label htmlFor="bilateral">Bilateral</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unilateral" id="unilateral" />
            <Label htmlFor="unilateral">Unilateral</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sets">Sets</Label>
          <Input
            id="sets"
            type="number"
            min="1"
            value={sets}
            onChange={(e) => setSets(Number.parseInt(e.target.value) || 1)}
            className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min-reps">Min Reps</Label>
          <Input
            id="min-reps"
            type="number"
            min="1"
            value={minReps}
            onChange={(e) => setMinReps(Number.parseInt(e.target.value) || 1)}
            className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-reps">Max Reps</Label>
          <Input
            id="max-reps"
            type="number"
            min="1"
            value={maxReps}
            onChange={(e) => setMaxReps(Number.parseInt(e.target.value) || 1)}
            className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" className="mt-4 w-fit">
          Add Exercise
        </Button>
      </div>
    </form>
  );
}
