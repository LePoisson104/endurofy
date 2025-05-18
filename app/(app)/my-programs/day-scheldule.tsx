"use client";

import { Edit, Trash2, Save, X, GripVertical } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DayScheduleProps {
  exercises: Exercise[];
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateExercise: (exercise: Exercise) => void;
  onReorderExercises: (exercises: Exercise[]) => void;
  isEditing?: boolean;
  setError: (error: string) => void;
}

function SortableTableRow({
  exercise,
  isEditing,
  onRemoveExercise,
  onUpdateExercise,
  isDragging,
  setError,
}: {
  exercise: Exercise;
  isEditing: boolean;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateExercise: (exercise: Exercise) => void;
  isDragging: boolean;
  setError: (error: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: exercise.exerciseId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: isEditing ? "grab" : "auto",
    touchAction: "none",
  };

  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );
  const [editedExercise, setEditedExercise] = useState<Exercise | null>(null);

  const handleStartEditing = (exercise: Exercise) => {
    setEditingExerciseId(exercise.exerciseId);
    setEditedExercise({ ...exercise });
  };

  const handleCancelEditing = () => {
    setEditingExerciseId(null);
    setEditedExercise(null);
  };

  const handleSaveExercise = () => {
    if (editedExercise) {
      if (
        editedExercise.sets <= 0 ||
        editedExercise.minReps <= 0 ||
        editedExercise.maxReps <= 0
      ) {
        setError("Sets and reps must be greater than 0");
        return;
      }

      onUpdateExercise(editedExercise);
      setEditingExerciseId(null);
      setEditedExercise(null);
    }
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...(isEditing ? attributes : {})}
      className={isDragging ? "bg-muted/50" : undefined}
    >
      {editingExerciseId === exercise.exerciseId ? (
        <>
          <TableCell className="w-8">
            <button
              {...listeners}
              className="touch-none cursor-grab active:cursor-grabbing"
              aria-label="Drag handle"
            >
              <GripVertical className="h-4 w-4 text-slate-400" />
            </button>
          </TableCell>
          <TableCell>
            <div className="space-y-2">
              <Label htmlFor="exercise-name" className="sr-only">
                Exercise Name
              </Label>
              <Input
                id="exercise-name"
                placeholder="Exercise name"
                value={editedExercise?.exerciseName || ""}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise!,
                    exerciseName: e.target.value,
                  })
                }
                className="w-full text-sm"
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
              value={editedExercise?.sets || ""}
              onChange={(e) =>
                setEditedExercise({
                  ...editedExercise!,
                  sets:
                    e.target.value === "" ? 0 : Number.parseInt(e.target.value),
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
                value={editedExercise?.minReps || ""}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise!,
                    minReps:
                      e.target.value === ""
                        ? 0
                        : Number.parseInt(e.target.value),
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
                value={editedExercise?.maxReps || ""}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise!,
                    maxReps:
                      e.target.value === ""
                        ? 0
                        : Number.parseInt(e.target.value),
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
              value={editedExercise?.laterality}
              onValueChange={(value) =>
                setEditedExercise({
                  ...editedExercise!,
                  laterality: value as "bilateral" | "unilateral",
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
                disabled={
                  editedExercise?.exerciseName === exercise.exerciseName &&
                  editedExercise?.sets === exercise.sets &&
                  editedExercise?.minReps === exercise.minReps &&
                  editedExercise?.maxReps === exercise.maxReps &&
                  editedExercise?.laterality === exercise.laterality
                }
              >
                <Save className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </Button>
            </div>
          </TableCell>
        </>
      ) : (
        <>
          {isEditing && (
            <TableCell className="w-8">
              <button
                {...listeners}
                className="touch-none cursor-grab active:cursor-grabbing"
                aria-label="Drag handle"
              >
                <GripVertical className="h-4 w-4 text-slate-400" />
              </button>
            </TableCell>
          )}
          <TableCell>
            <div className="font-medium">{exercise.exerciseName}</div>
          </TableCell>
          <TableCell className="text-center">{exercise.sets}</TableCell>
          <TableCell className="text-center">
            {exercise.minReps === exercise.maxReps
              ? exercise.minReps
              : `${exercise.minReps} - ${exercise.maxReps}`}
          </TableCell>
          <TableCell className="text-center">{exercise.laterality}</TableCell>
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
                  onClick={() => onRemoveExercise(exercise.exerciseId)}
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
  );
}

export function DaySchedule({
  exercises,
  onRemoveExercise,
  onUpdateExercise,
  onReorderExercises,
  isEditing = true,
  setError,
}: DayScheduleProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sort exercises by exerciseOrder
  const sortedExercises = [...exercises].sort(
    (a, b) => a.exerciseOrder - b.exerciseOrder
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay before drag starts on touch
        tolerance: 5, // 5px of movement allowed during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = sortedExercises.findIndex(
        (ex) => ex.exerciseId === active.id
      );
      const newIndex = sortedExercises.findIndex(
        (ex) => ex.exerciseId === over.id
      );

      const newExercises = arrayMove(sortedExercises, oldIndex, newIndex).map(
        (exercise, index) => ({
          ...exercise,
          exerciseOrder: index + 1,
        })
      );

      onReorderExercises?.(newExercises);
    }
  };

  if (sortedExercises.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
        <h2 className="text-lg font-bold">Rest Day</h2>
        <h3 className="text-md font-medium">No exercises for this day</h3>
        <p className="mt-1 text-sm text-slate-500">
          {isEditing
            ? "Add exercises using the form below."
            : "Click edit to add exercises to this day."}
        </p>
      </div>
    );
  }

  // Render different tables based on edit mode
  if (!isEditing) {
    return (
      <Card className="p-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercise</TableHead>
                <TableHead className="w-[120px] text-center">Sets</TableHead>
                <TableHead className="w-[120px] text-center">
                  Rep Range
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  Laterality
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExercises.map((exercise) => (
                <TableRow key={exercise.exerciseId}>
                  <TableCell>
                    <div className="font-medium">{exercise.exerciseName}</div>
                  </TableCell>
                  <TableCell className="text-center">{exercise.sets}</TableCell>
                  <TableCell className="text-center">
                    {exercise.minReps} - {exercise.maxReps}
                  </TableCell>
                  <TableCell className="text-center">
                    {exercise.laterality}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Exercise</TableHead>
                <TableHead className="w-[120px] text-center">Sets</TableHead>
                <TableHead className="w-[120px] text-center">
                  Rep Range
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  Laterality
                </TableHead>
                <TableHead className="w-[120px] text-right pr-4.5">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={sortedExercises.map((ex) => ex.exerciseId)}
                strategy={verticalListSortingStrategy}
              >
                {sortedExercises.map((exercise) => (
                  <SortableTableRow
                    key={exercise.exerciseId}
                    exercise={exercise}
                    isEditing={isEditing}
                    onRemoveExercise={onRemoveExercise}
                    onUpdateExercise={onUpdateExercise}
                    isDragging={activeId === exercise.exerciseId}
                    setError={setError}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </CardContent>
    </Card>
  );
}
