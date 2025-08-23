"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CreateExercise,
  Exercise,
} from "../../interfaces/workout-program-interfaces";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ExerciseForm({
  onAddExercise,
  isAddingExercise,
  initialExercise,
  isEditing = false,
}: {
  onAddExercise: (exercise: Exercise) => void;
  isAddingExercise?: boolean;
  initialExercise?: Partial<Exercise>;
  isEditing?: boolean;
}) {
  const isMobile = useIsMobile();
  const [exerciseName, setExerciseName] = useState("");
  const [bodyPart, setBodyPart] = useState<string>("");
  const [laterality, setLaterality] = useState<string>("bilateral");
  const [sets, setSets] = useState<number | null>(null);
  const [minReps, setMinReps] = useState<number | null>(null);
  const [maxReps, setMaxReps] = useState<number | null>(null);
  const [exerciseOrder, setExerciseOrder] = useState<number>(1);

  // Pre-fill form when editing
  useEffect(() => {
    if (initialExercise) {
      setExerciseName(initialExercise.exerciseName || "");
      setBodyPart(initialExercise.bodyPart?.toLowerCase() || "");
      setLaterality(initialExercise.laterality || "bilateral");
      setSets(initialExercise.sets || null);
      setMinReps(initialExercise.minReps || null);
      setMaxReps(initialExercise.maxReps || null);
      setExerciseOrder(initialExercise.exerciseOrder || 1);
    }
  }, [initialExercise]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (
      !exerciseName ||
      !bodyPart ||
      !laterality ||
      !sets ||
      !minReps ||
      !maxReps
    ) {
      toast.error("All fields are required");
      return;
    }

    // Validate min and max reps
    if (minReps > maxReps) {
      toast.error("Minimum reps cannot be greater than maximum reps");
      return;
    }

    // Create the exercise object
    const exerciseData: CreateExercise = {
      exerciseName,
      bodyPart,
      laterality: laterality as "bilateral" | "unilateral",
      sets,
      minReps,
      maxReps,
      exerciseOrder: exerciseOrder,
    };

    // Include exerciseId if editing
    const finalExercise =
      isEditing && initialExercise?.exerciseId
        ? ({
            ...exerciseData,
            exerciseId: initialExercise.exerciseId,
          } as Exercise)
        : (exerciseData as Exercise);

    // Call the onAddExercise callback
    onAddExercise(finalExercise);

    // Reset form only if not editing (editing will close the modal)
    if (!isEditing) {
      setExerciseName("");
      setBodyPart("");
      setLaterality("bilateral");
      setSets(null);
      setMinReps(null);
      setMaxReps(null);
      setExerciseOrder(1);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exercise-name">Exercise Name</Label>
          <Input
            id="exercise-name"
            placeholder="e.g., Bench Press"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="w-full flex flex-col space-y-2">
          <Label htmlFor="exercise-type">Body Part</Label>
          <Select
            value={bodyPart || initialExercise?.bodyPart}
            onValueChange={(value) => setBodyPart(value)}
          >
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Select body part" />
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
        <div className="space-y-2 mb-5">
          <Label>Laterality</Label>
          <RadioGroup
            className="flex flex-col sm:flex-row gap-4"
            value={laterality}
            onValueChange={(value) => setLaterality(value)}
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

        <div
          className={`flex justify-between gap-4 ${isMobile ? "flex-col" : ""}`}
        >
          <div className="space-y-2 w-full">
            <Label htmlFor="sets">Sets</Label>
            <Input
              id="sets"
              type="number"
              placeholder="Enter number of sets"
              value={sets || ""}
              onChange={(e) => setSets(Number.parseInt(e.target.value))}
              className="flex-1 placeholder:text-sm text-sm"
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="min-reps">Min Reps</Label>
            <Input
              id="min-reps"
              type="number"
              placeholder="Enter min reps"
              value={minReps || ""}
              onChange={(e) => setMinReps(Number.parseInt(e.target.value))}
              className="flex-1 placeholder:text-sm text-sm"
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="max-reps">Max Reps</Label>
            <Input
              id="max-reps"
              type="number"
              placeholder="Enter max reps"
              value={maxReps || ""}
              onChange={(e) => setMaxReps(Number.parseInt(e.target.value))}
              className="flex-1 placeholder:text-sm text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className={`mt-4 ${isEditing ? "w-[150px]" : "w-[120px]"}`}
            disabled={
              !exerciseName ||
              !bodyPart ||
              !laterality ||
              !sets ||
              !minReps ||
              !maxReps ||
              isAddingExercise
            }
          >
            {isAddingExercise ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEditing ? (
              "Update Exercise"
            ) : (
              "Add Exercise"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
