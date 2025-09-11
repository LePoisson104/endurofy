"use client";

import { Edit, Trash2, Save, X, GripVertical } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";

interface DayScheduleMobileProps {
  exercises: Exercise[];
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateExercise: (exercise: Exercise) => void;
  onReorderExercises: (exercises: Exercise[]) => void;
  isEditing?: boolean;
}

function SortableExerciseCard({
  exercise,
  isEditing,
  onRemoveExercise,
  onUpdateExercise,
  isDragging,
}: {
  exercise: Exercise;
  isEditing: boolean;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateExercise: (exercise: Exercise) => void;
  isDragging: boolean;
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
        toast.error("Sets and reps must be greater than 0");
        return;
      }

      onUpdateExercise(editedExercise);
      setEditingExerciseId(null);
      setEditedExercise(null);
    }
  };

  const isCurrentlyEditing = editingExerciseId === exercise.exerciseId;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(isEditing ? attributes : {})}
      className={`mb-3 ${isDragging ? "bg-muted/50" : ""} ${
        isCurrentlyEditing ? "border-primary" : ""
      }`}
    >
      <CardContent className="p-4">
        {/* Drag Handle */}
        {isEditing && (
          <div className="flex justify-between items-start mb-3">
            <button
              {...listeners}
              className="touch-none cursor-grab active:cursor-grabbing flex items-center p-2 -ml-2 -mt-2"
              aria-label="Drag handle"
            >
              <GripVertical className="h-5 w-5 text-slate-400" />
            </button>
            {!isCurrentlyEditing && (
              <div className="flex gap-1">
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
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {isCurrentlyEditing ? (
          <div className="space-y-4">
            {/* Exercise Name */}
            <div>
              <Label
                htmlFor={`exercise-name-${exercise.exerciseId}`}
                className="text-sm font-medium mb-2 block"
              >
                Exercise Name
              </Label>
              <Input
                id={`exercise-name-${exercise.exerciseId}`}
                placeholder="Exercise name"
                value={editedExercise?.exerciseName || ""}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise!,
                    exerciseName: e.target.value,
                  })
                }
                className="w-full"
              />
            </div>

            {/* Sets and Reps Row */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label
                  htmlFor={`exercise-sets-${exercise.exerciseId}`}
                  className="text-sm font-medium mb-2 block"
                >
                  Sets
                </Label>
                <Input
                  id={`exercise-sets-${exercise.exerciseId}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={editedExercise?.sets || ""}
                  onChange={(e) =>
                    setEditedExercise({
                      ...editedExercise!,
                      sets:
                        e.target.value === ""
                          ? 0
                          : Number.parseInt(e.target.value),
                    })
                  }
                  className="text-center"
                />
              </div>

              <div>
                <Label
                  htmlFor={`exercise-min-reps-${exercise.exerciseId}`}
                  className="text-sm font-medium mb-2 block"
                >
                  Min Reps
                </Label>
                <Input
                  id={`exercise-min-reps-${exercise.exerciseId}`}
                  type="number"
                  min="1"
                  inputMode="numeric"
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
                  className="text-center"
                />
              </div>

              <div>
                <Label
                  htmlFor={`exercise-max-reps-${exercise.exerciseId}`}
                  className="text-sm font-medium mb-2 block"
                >
                  Max Reps
                </Label>
                <Input
                  id={`exercise-max-reps-${exercise.exerciseId}`}
                  type="number"
                  min="1"
                  inputMode="numeric"
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
                  className="text-center"
                />
              </div>
            </div>

            {/* Laterality */}
            <div>
              <Label
                htmlFor={`exercise-laterality-${exercise.exerciseId}`}
                className="text-sm font-medium mb-2 block"
              >
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCancelEditing}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveExercise}
                disabled={
                  editedExercise?.exerciseName === exercise.exerciseName &&
                  editedExercise?.sets === exercise.sets &&
                  editedExercise?.minReps === exercise.minReps &&
                  editedExercise?.maxReps === exercise.maxReps &&
                  editedExercise?.laterality === exercise.laterality
                }
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Exercise Name */}
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {exercise.exerciseName}
              </h3>
            </div>

            {/* Exercise Details Grid */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Sets
                </div>
                <div className="text-lg font-semibold">{exercise.sets}</div>
              </div>

              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Reps
                </div>
                <div className="text-lg font-semibold">
                  {exercise.minReps === exercise.maxReps
                    ? exercise.minReps
                    : `${exercise.minReps}-${exercise.maxReps}`}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Type
                </div>
                <div className="text-sm font-medium capitalize">
                  {exercise.laterality}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DayScheduleMobile({
  exercises,
  onRemoveExercise,
  onUpdateExercise,
  onReorderExercises,
  isEditing = true,
}: DayScheduleMobileProps) {
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
        delay: 300, // Increased delay for better mobile experience
        tolerance: 8, // Increased tolerance for touch
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

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedExercises.map((ex) => ex.exerciseId)}
          strategy={verticalListSortingStrategy}
        >
          {sortedExercises.map((exercise) => (
            <SortableExerciseCard
              key={exercise.exerciseId}
              exercise={exercise}
              isEditing={isEditing}
              onRemoveExercise={onRemoveExercise}
              onUpdateExercise={onUpdateExercise}
              isDragging={activeId === exercise.exerciseId}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
