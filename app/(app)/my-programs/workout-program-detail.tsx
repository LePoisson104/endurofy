"use client";

import { useState } from "react";
import { ArrowLeft, Edit, Trash2, Save, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExerciseForm } from "./exercise-form";
import { DaySchedule } from "./day-scheldule";
import { useIsMobile } from "@/hooks/use-mobile";
import DeleteProgramDialog from "@/components/dialog/delete-program";
import type { WorkoutProgram, DayOfWeek, Exercise } from "./page";

interface WorkoutProgramDetailProps {
  program: WorkoutProgram;
  onBack: () => void;
  onUpdate: (program: WorkoutProgram) => void;
  onDelete: (programId: string) => void;
}

export function WorkoutProgramDetail({
  program,
  onBack,
  onUpdate,
  onDelete,
}: WorkoutProgramDetailProps) {
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(
    program.days.length > 0 ? program.days[0].day : null
  );
  const [editedProgram, setEditedProgram] = useState<WorkoutProgram>({
    ...program,
  });

  // Format created date
  const formatCreatedDate = (dateString: string) => {
    return format(parseISO(dateString), "MMMM d, yyyy");
  };

  // Format day name
  const formatDayName = (day: DayOfWeek) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Handle adding a new exercise to a day
  const handleAddExercise = (exercise: Omit<Exercise, "id">) => {
    if (!activeDay) return;

    const newExercise: Exercise = {
      ...exercise,
      id: Math.random().toString(36).substring(2, 9),
    };

    // Check if the day already exists in the program
    const dayExists = editedProgram.days.some((day) => day.day === activeDay);

    if (dayExists) {
      // Add exercise to existing day
      setEditedProgram({
        ...editedProgram,
        days: editedProgram.days.map((day) =>
          day.day === activeDay
            ? {
                ...day,
                exercises: [...day.exercises, newExercise],
              }
            : day
        ),
      });
    } else {
      // Create new day with the exercise
      setEditedProgram({
        ...editedProgram,
        days: [
          ...editedProgram.days,
          { day: activeDay, exercises: [newExercise], title: "" },
        ],
      });
    }
  };

  // Handle removing an exercise from a day
  const handleRemoveExercise = (day: DayOfWeek, exerciseId: string) => {
    setEditedProgram({
      ...editedProgram,
      days: editedProgram.days.map((workoutDay) =>
        workoutDay.day === day
          ? {
              ...workoutDay,
              exercises: workoutDay.exercises.filter(
                (exercise) => exercise.id !== exerciseId
              ),
            }
          : workoutDay
      ),
    });
  };

  // Handle updating an exercise
  const handleUpdateExercise = (day: DayOfWeek, updatedExercise: Exercise) => {
    setEditedProgram({
      ...editedProgram,
      days: editedProgram.days.map((workoutDay) =>
        workoutDay.day === day
          ? {
              ...workoutDay,
              exercises: workoutDay.exercises.map((exercise) =>
                exercise.id === updatedExercise.id ? updatedExercise : exercise
              ),
            }
          : workoutDay
      ),
    });
  };

  // Handle saving changes
  const handleSaveChanges = () => {
    // Filter out days with no exercises
    const daysWithExercises = editedProgram.days.filter(
      (day) => day.exercises.length > 0
    );

    onUpdate({
      ...editedProgram,
      days: daysWithExercises,
    });
    setIsEditing(false);
  };

  // Handle canceling changes
  const handleCancelChanges = () => {
    setEditedProgram({ ...program });
    setIsEditing(false);
  };

  // Handle deleting the program
  const handleDeleteProgram = () => {
    onDelete(program.id);
    setShowDeleteDialog(false);
  };

  // Get exercises for the active day
  const getExercisesForActiveDay = () => {
    if (!activeDay) return [];
    const activeWorkoutDay = editedProgram.days.find(
      (day) => day.day === activeDay
    );
    return activeWorkoutDay ? activeWorkoutDay.exercises : [];
  };

  // Get all days of the week
  const allDays: DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          My Programs
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelChanges}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveChanges} className="gap-1">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-1">
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="program-name">Program Name</Label>
                <Input
                  id="program-name"
                  value={editedProgram.name}
                  onChange={(e) =>
                    setEditedProgram({ ...editedProgram, name: e.target.value })
                  }
                />
              </div>
            ) : (
              <CardTitle>{program.name}</CardTitle>
            )}
            {isEditing ? (
              <div className="space-y-2 mt-1">
                <Label htmlFor="program-description">Description</Label>
                <Textarea
                  id="program-description"
                  value={editedProgram.description || ""}
                  onChange={(e) =>
                    setEditedProgram({
                      ...editedProgram,
                      description: e.target.value || undefined,
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>
            ) : (
              <CardDescription>{program.description || ""}</CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">
            Created on {formatCreatedDate(program.createdAt)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout Schedule</CardTitle>
          <CardDescription>
            View and manage exercises for each day of your workout program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeDay || undefined}
            onValueChange={(value) => setActiveDay(value as DayOfWeek)}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-7">
              {allDays.map((day) => {
                const dayData = editedProgram.days.find((d) => d.day === day);
                const exerciseCount = dayData?.exercises.length || 0;

                return (
                  <TabsTrigger key={day} value={day} className="relative">
                    {formatDayName(day).slice(0, 3)}
                    {exerciseCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                        {exerciseCount}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {allDays.map((day) => (
              <TabsContent key={day} value={day} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{formatDayName(day)}</h3>
                </div>

                {activeDay === day && (
                  <>
                    <DaySchedule
                      exercises={getExercisesForActiveDay()}
                      onRemoveExercise={(exerciseId) =>
                        handleRemoveExercise(day, exerciseId)
                      }
                      onUpdateExercise={(exercise) =>
                        handleUpdateExercise(day, exercise)
                      }
                      isEditing={isEditing}
                    />

                    {isEditing && (
                      <Card className={`${isMobile ? "border-none" : ""}`}>
                        <CardHeader className={`${isMobile ? "p-0" : ""}`}>
                          <CardTitle className="text-base border-b w-fit border-slate-200">
                            Add Exercise
                          </CardTitle>
                        </CardHeader>
                        <CardContent className={`${isMobile ? "p-0" : ""}`}>
                          <ExerciseForm onAddExercise={handleAddExercise} />
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <DeleteProgramDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        handleDeleteProgram={handleDeleteProgram}
      />
    </div>
  );
}
