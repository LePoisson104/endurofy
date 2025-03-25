"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Exercise } from "./page";

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
        />
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
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about the exercise..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full">
        Add Exercise
      </Button>
    </form>
  );
}
