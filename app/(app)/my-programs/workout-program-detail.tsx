"use client";

import { useState } from "react";
import { ArrowLeft, Edit, Trash2, X } from "lucide-react";
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
import { DaySchedule } from "./day-scheldule";
import DeleteProgramDialog from "@/components/dialog/delete-program";
import type {
  WorkoutProgram,
  DayOfWeek,
  Exercise,
} from "../../../interfaces/workout-program-interfaces";
import AddExerciseModal from "@/components/modals/add-exercise-modal";

interface WorkoutProgramDetailProps {
  program: WorkoutProgram;
  onBack: () => void;
  onUpdate: (program: WorkoutProgram) => void;
  onDelete: (programId: string) => void;
  isDeleting: boolean;
}

export function WorkoutProgramDetail({
  program,
  onBack,
  onUpdate,
  onDelete,
  isDeleting,
}: WorkoutProgramDetailProps) {
  const allDays = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
    7: "sunday",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(
    program.workoutDays.length > 0
      ? (allDays[
          program.workoutDays[0].dayNumber as keyof typeof allDays
        ] as DayOfWeek)
      : null
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
      exerciseId: Math.random().toString(36).substring(2, 9),
    };

    // Check if the day already exists in the program
    const dayExists = editedProgram.workoutDays.some(
      (day) => day.dayId === activeDay
    );

    if (dayExists) {
      // Add exercise to existing day
      setEditedProgram({
        ...editedProgram,
        workoutDays: editedProgram.workoutDays.map((day) =>
          day.dayId === activeDay
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
        workoutDays: [
          ...editedProgram.workoutDays,
          {
            dayId: activeDay,
            exercises: [newExercise],
            dayName: "",
            dayNumber: 0,
          },
        ],
      });
    }
  };

  // Handle removing an exercise from a day
  const handleRemoveExercise = (day: DayOfWeek, exerciseId: string) => {
    setEditedProgram({
      ...editedProgram,
      workoutDays: editedProgram.workoutDays.map((workoutDay) =>
        workoutDay.dayId === day
          ? {
              ...workoutDay,
              exercises: workoutDay.exercises.filter(
                (exercise) => exercise.exerciseId !== exerciseId
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
      workoutDays: editedProgram.workoutDays.map((workoutDay) =>
        workoutDay.dayId === day
          ? {
              ...workoutDay,
              exercises: workoutDay.exercises.map((exercise) =>
                exercise.exerciseId === updatedExercise.exerciseId
                  ? updatedExercise
                  : exercise
              ),
            }
          : workoutDay
      ),
    });
  };

  // Handle canceling changes
  const handleCancelChanges = () => {
    setEditedProgram({ ...program });
    setIsEditing(false);
  };

  // Handle deleting the program
  const handleDeleteProgram = () => {
    onDelete(program.programId);
    setShowDeleteDialog(false);
  };

  // Get exercises for the active day
  const getExercisesForActiveDay = () => {
    if (!activeDay) return [];
    const activeWorkoutDay = editedProgram.workoutDays.find((day) => {
      return allDays[day?.dayNumber as keyof typeof allDays] === activeDay;
    });

    return activeWorkoutDay ? activeWorkoutDay.exercises : [];
  };

  const getDayName = (day: DayOfWeek) => {
    if (!activeDay) return "";
    const activeWorkoutDay = editedProgram.workoutDays.find((d) => {
      return allDays[d?.dayNumber as keyof typeof allDays] === day;
    });

    return activeWorkoutDay ? activeWorkoutDay.dayName : "";
  };

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
                Close
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
                  value={editedProgram.programName}
                  onChange={(e) =>
                    setEditedProgram({
                      ...editedProgram,
                      programName: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <CardTitle>{program.programName}</CardTitle>
            )}
            {isEditing ? (
              <div className="space-y-2 mt-5">
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
        {!isEditing && (
          <CardContent>
            <div className="text-xs text-slate-500">
              Created on {formatCreatedDate(program.createdAt)}
            </div>
            {new Date(program.createdAt).toISOString().split("T")[0] !==
              new Date(program.updatedAt).toISOString().split("T")[0] && (
              <div className="text-xs text-slate-500">
                Updated on {formatCreatedDate(program.updatedAt)}
              </div>
            )}
          </CardContent>
        )}
        {isEditing && (
          <div className="flex justify-end pr-5">
            <Button>Save changes</Button>
          </div>
        )}
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
              {Object.values(allDays).map((day) => {
                const dayData = editedProgram.workoutDays.find((d) => {
                  return allDays[d.dayNumber as keyof typeof allDays] === day;
                });
                const exerciseCount = dayData?.exercises.length || 0;

                return (
                  <TabsTrigger key={day} value={day} className="relative">
                    {formatDayName(day as DayOfWeek).slice(0, 3)}
                    {exerciseCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                        {exerciseCount}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.values(allDays).map((day) => (
              <TabsContent key={day} value={day} className="space-y-4">
                {activeDay === day && (
                  <>
                    {/* Day name */}
                    <div>
                      {!isEditing ? (
                        <h3 className="text-lg font-medium">
                          {getDayName(day as DayOfWeek)}
                        </h3>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            className="w-fit placeholder:text-slate-500"
                            placeholder="Day name"
                            value={getDayName(day as DayOfWeek)}
                            onChange={(e) => {
                              const updatedDays = editedProgram.workoutDays.map(
                                (d) => {
                                  if (
                                    allDays[
                                      d.dayNumber as keyof typeof allDays
                                    ] === day
                                  ) {
                                    return { ...d, dayName: e.target.value };
                                  }
                                  return d;
                                }
                              );
                              setEditedProgram({
                                ...editedProgram,
                                workoutDays: updatedDays,
                              });
                            }}
                          />
                          <Button>Save</Button>
                        </div>
                      )}
                    </div>
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
                      <div className="flex justify-end">
                        <AddExerciseModal />
                      </div>
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
        isDeleting={isDeleting}
      />
    </div>
  );
}
