"use client";

import { Edit, Trash2, Save, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Exercise } from "../../../interfaces/workout-program-interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DayScheduleProps {
  exercises: Exercise[];
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateExercise: (exercise: Exercise) => void;
  isEditing?: boolean;
}

export function DaySchedule({
  exercises,
  onRemoveExercise,
  onUpdateExercise,
  isEditing = true,
}: DayScheduleProps) {
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );
  const [editedExercise, setEditedExercise] = useState<Exercise | null>(null);

  // Start editing an exercise
  const handleStartEditing = (exercise: Exercise) => {
    setEditingExerciseId(exercise.exerciseId);
    setEditedExercise({ ...exercise });
  };

  // Cancel editing
  const handleCancelEditing = () => {
    setEditingExerciseId(null);
    setEditedExercise(null);
  };

  // Save edited exercise
  const handleSaveExercise = () => {
    if (editedExercise) {
      onUpdateExercise(editedExercise);
      setEditingExerciseId(null);
      setEditedExercise(null);
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
        <h3 className="text-lg font-medium">No exercises for this day</h3>
        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? "Add exercises using the form below."
            : "There are no exercises scheduled for this day."}
        </p>
      </div>
    );
  }

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exercise</TableHead>
              <TableHead className="w-[120px] text-center">Sets</TableHead>
              <TableHead className="w-[120px] text-center">Rep Range</TableHead>
              <TableHead className="w-[120px] text-center">
                Laterality
              </TableHead>
              {isEditing && (
                <TableHead className="w-[120px] text-right pr-4.5">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.exerciseId}>
                {editingExerciseId === exercise.exerciseId && editedExercise ? (
                  <>
                    <TableCell>
                      <div className="space-y-2">
                        <Label htmlFor="exercise-name" className="sr-only">
                          Exercise Name
                        </Label>
                        <Input
                          id="exercise-name"
                          placeholder="Exercise name"
                          value={editedExercise.exerciseName}
                          onChange={(e) =>
                            setEditedExercise({
                              ...editedExercise,
                              exerciseName: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Label htmlFor="exercise-sets" className="sr-only">
                        Sets
                      </Label>
                      <Input
                        id="exercise-sets"
                        type="number"
                        min="1"
                        value={editedExercise.sets}
                        onChange={(e) =>
                          setEditedExercise({
                            ...editedExercise,
                            sets: Number.parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-16 text-center mx-auto flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Label htmlFor="exercise-min-reps" className="sr-only">
                          Min Reps
                        </Label>
                        <Input
                          id="exercise-min-reps"
                          type="number"
                          min="1"
                          value={editedExercise.minReps}
                          onChange={(e) =>
                            setEditedExercise({
                              ...editedExercise,
                              minReps: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-16 text-center flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm text-sm"
                        />
                        <span>-</span>
                        <Label htmlFor="exercise-max-reps" className="sr-only">
                          Max Reps
                        </Label>
                        <Input
                          id="exercise-max-reps"
                          type="number"
                          min="1"
                          value={editedExercise.maxReps}
                          onChange={(e) =>
                            setEditedExercise({
                              ...editedExercise,
                              maxReps: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-16 text-center flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-sm text-sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Label htmlFor="exercise-sets" className="sr-only">
                        Laterality
                      </Label>
                      <Select
                        value={editedExercise.action}
                        onValueChange={(value) =>
                          setEditedExercise({
                            ...editedExercise,
                            action: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bilateral">Bilateral</SelectItem>
                          <SelectItem value="unilateral">Unilateral</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEditing}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSaveExercise}
                        >
                          <Save className="h-4 w-4" />
                          <span className="sr-only">Save</span>
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <div className="font-medium">{exercise.exerciseName}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {exercise.sets}
                    </TableCell>
                    <TableCell className="text-center">
                      {exercise.minReps} - {exercise.maxReps}
                    </TableCell>
                    <TableCell className="text-center">
                      {exercise.action}
                    </TableCell>
                    {isEditing && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEditing(exercise)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              onRemoveExercise(exercise.exerciseId)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
