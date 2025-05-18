"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, X, EllipsisVertical, Plus, Loader2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import AddExerciseWarning from "@/components/dialog/add-exercise-warning";
import {
  useDeleteWorkoutProgramDayMutation,
  useDeleteWorkoutProgramExerciseMutation,
  useUpdateWorkoutProgramDescriptionMutation,
  useUpdateWorkoutProgramDayMutation,
  useUpdateWorkoutProgramExerciseMutation,
  useAddProgramDayMutation,
  useAddExerciseMutation,
  useReorderWorkoutProgramExerciseMutation,
} from "@/api/workout-program/workout-program-api-slice";
import ErrorAlert from "@/components/alerts/error-alert";
import SuccessAlert from "@/components/alerts/success-alert";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

interface WorkoutProgramDetailProps {
  program: WorkoutProgram;
  onBack: () => void;
  onDelete: (programId: string) => void;
  isDeleting: boolean;
}

export function WorkoutProgramDetail({
  program,
  onBack,
  onDelete,
  isDeleting,
}: WorkoutProgramDetailProps) {
  const isMobile = useIsMobile();
  const isDarkMode = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const allDays =
    program.programType === "dayOfWeek"
      ? {
          1: "monday",
          2: "tuesday",
          3: "wednesday",
          4: "thursday",
          5: "friday",
          6: "saturday",
          7: "sunday",
        }
      : {
          1: "D1",
          2: "D2",
          3: "D3",
          4: "D4",
          5: "D5",
          6: "D6",
          7: "D7",
          8: "D8",
          9: "D9",
          10: "D10",
        };
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddExerciseWarning, setShowAddExerciseWarning] = useState(false);
  const [context, setContext] = useState("");
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

  const [deleteWorkoutProgramDay, { isLoading: isDeletingDay }] =
    useDeleteWorkoutProgramDayMutation();
  const [deleteWorkoutProgramExercise] =
    useDeleteWorkoutProgramExerciseMutation();
  const [
    updateWorkoutProgramDescription,
    { isLoading: isUpdatingDescription },
  ] = useUpdateWorkoutProgramDescriptionMutation();
  const [updateWorkoutProgramDay, { isLoading: isUpdatingDay }] =
    useUpdateWorkoutProgramDayMutation();
  const [updateWorkoutProgramExercise] =
    useUpdateWorkoutProgramExerciseMutation();
  const [addProgramDay, { isLoading: isAddingDay }] =
    useAddProgramDayMutation();
  const [addExercise, { isLoading: isAddingExercise }] =
    useAddExerciseMutation();
  const [reorderWorkoutProgramExercise, { isLoading: isReorderingExercise }] =
    useReorderWorkoutProgramExerciseMutation();

  // Format created date
  const formatCreatedDate = (dateString: string) => {
    return format(parseISO(dateString), "MMMM d, yyyy");
  };

  // Format day name
  const formatDayName = (day: DayOfWeek) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const numberOfDays =
    program.programType === "custom"
      ? Math.max(...program.workoutDays.map((d) => d.dayNumber))
      : 7;

  useEffect(() => {
    setEditedProgram(program);
  }, [program]);

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

  // Handle adding a new exercise to a day
  const handleAddExercise = async (exercise: Omit<Exercise, "id">) => {
    const dayId = getDayId(activeDay as DayOfWeek);

    if (dayId === "" || dayId.includes("temp-")) return;

    const exerciseList = editedProgram.workoutDays.find(
      (day) => day.dayId == dayId
    );

    //if exercise list is not empty and length is greater than or equal to 1, then increment by 1
    //else use the default value of 1 that we get from the form
    if (exerciseList && exerciseList.exercises.length >= 1) {
      exercise.exerciseOrder = exerciseList.exercises.length + 1;
    }

    try {
      await addExercise({
        programId: program.programId,
        dayId: dayId,
        payload: exercise,
      }).unwrap();
      setSuccess("Exercise added successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        setError(error.data.message);
      } else {
        setError("Internal server error. Failed to add exercise");
      }
    }
  };

  // Handle updating an exercise
  const handleUpdateExercise = async (updatedExercise: Exercise) => {
    const dayId = editedProgram.workoutDays.find((day) =>
      day.exercises.some(
        (exercise) => exercise.exerciseId === updatedExercise.exerciseId
      )
    )?.dayId;
    const programId = program.programId;
    try {
      await updateWorkoutProgramExercise({
        dayId: dayId,
        exerciseId: updatedExercise.exerciseId,
        programId: programId,
        payload: updatedExercise,
      }).unwrap();
      setSuccess("Exercise updated successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        setError(error.data.message);
      } else {
        setError("Internal server error. Failed to update exercise");
      }
    }
  };

  const handleReorderExercises = async (exercises: Exercise[]) => {
    const dayId = editedProgram.workoutDays.find((day) =>
      day.exercises.some(
        (exercise) => exercise.exerciseId === exercises[0].exerciseId
      )
    )?.dayId;

    try {
      await reorderWorkoutProgramExercise({
        programId: program.programId,
        dayId: dayId,
        payload: exercises,
      }).unwrap();
    } catch (error: any) {
      if (error.status !== 500) {
        setError(error.data.message);
      } else {
        setError("Internal server error. Failed to reorder exercises");
      }
    }
  };

  const handleSaveProgramDescription = async () => {
    const payload = {
      programName: editedProgram.programName,
      description: editedProgram.description,
    };
    try {
      await updateWorkoutProgramDescription({
        userId: user?.user_id,
        programId: program.programId,
        payload: payload,
      }).unwrap();
      setSuccess("Program description updated successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        setError(error.data.message);
      } else {
        setError("Internal server error. Failed to update program description");
      }
    }
  };

  const handleUpdateProgramDayName = async (day: DayOfWeek) => {
    const dayId = getDayId(day);
    const payload = {
      dayName: getDayName(day),
      dayNumber: editedProgram.workoutDays.find((d) => d.dayId === dayId)
        ?.dayNumber,
    };

    if (dayId.includes("temp-")) {
      try {
        await addProgramDay({
          programId: program.programId,
          payload: payload,
        }).unwrap();
        setSuccess("Day added successfully");
      } catch (error: any) {
        if (error.status !== 500) {
          setError(error.data.message);
        } else {
          setError("Internal server error. Failed to update program day name");
        }
      }
      return;
    }

    try {
      await updateWorkoutProgramDay({
        programId: program.programId,
        dayId: dayId,
        payload: payload,
      }).unwrap();
      setSuccess("Day name updated successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        setError(error.data.message);
      } else {
        setError("Internal server error. Failed to update program day name");
      }
    }
  };

  // Handle deleting a program day
  const handleDeleteProgramDay = async () => {
    try {
      await deleteWorkoutProgramDay({
        programId: program.programId,
        dayId: getDayId(activeDay as DayOfWeek),
      }).unwrap();
      setSuccess("Day deleted successfully");
    } catch (error: any) {
      if (error.data.message) {
        setError("Internal server error. Failed to delete program day");
      }
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    const dayId = editedProgram.workoutDays.find((day) =>
      day.exercises.some((exercise) => exercise.exerciseId === exerciseId)
    )?.dayId;
    const programId = program.programId;

    try {
      await deleteWorkoutProgramExercise({
        programId: programId,
        dayId: dayId,
        exerciseId: exerciseId,
      }).unwrap();
      setSuccess("Exercise deleted successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        setError(error.data.message);
      } else {
        setError("Internal server error. Failed to delete exercise");
      }
    }
  };

  // Handle delete action based on context
  const handleDelete = () => {
    if (context === "Program") {
      handleDeleteProgram();
    } else if (context === "Program Day") {
      handleDeleteProgramDay();
    }
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

  const getDayId = (day: DayOfWeek) => {
    if (!activeDay) return "";
    const activeWorkoutDay = editedProgram.workoutDays.find((d) => {
      return allDays[d?.dayNumber as keyof typeof allDays] === day;
    });

    return activeWorkoutDay ? activeWorkoutDay.dayId : "";
  };

  return (
    <div className="space-y-6">
      <ErrorAlert error={error} setError={setError} />
      <SuccessAlert success={success} setSuccess={setSuccess} />
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 arrow-button"
        >
          <svg
            className="arrow-icon transform rotate-180 mr-2"
            viewBox="0 -3.5 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="arrow-icon__tip"
              d="M8 15L14 8.5L8 2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              className="arrow-icon__line"
              x1="13"
              y1="8.5"
              y2="8.5"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
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
                onClick={() => {
                  setContext("Program");
                  setShowDeleteDialog(true);
                }}
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
                  className="text-sm"
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
                  className="min-h-[100px] text-sm"
                />
              </div>
            ) : (
              <CardDescription>{program.description || ""}</CardDescription>
            )}
          </div>
          {isEditing && (
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                disabled={
                  isUpdatingDescription ||
                  (editedProgram.programName === program.programName &&
                    editedProgram.description === program.description)
                }
                className="w-[130px]"
                onClick={handleSaveProgramDescription}
              >
                {isUpdatingDescription ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </CardHeader>
        {!isEditing && (
          <CardContent>
            <div
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Created on {formatCreatedDate(program.createdAt)}
            </div>
            {new Date(program.createdAt).toISOString().split("T")[0] !==
              new Date(program.updatedAt).toISOString().split("T")[0] && (
              <div
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Updated on {formatCreatedDate(program.updatedAt)}
              </div>
            )}
          </CardContent>
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
          {isEditing && !isMobile && (
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Day
              </Button>
            </div>
          )}
          <Tabs
            value={activeDay || undefined}
            onValueChange={(value) => setActiveDay(value as DayOfWeek)}
            className="space-y-4"
          >
            <TabsList
              className={`grid w-full grid-cols-7 ${
                program.programType === "custom" &&
                program.workoutDays.length > 7
                  ? "mb-10"
                  : ""
              }`}
            >
              {Object.values(allDays)
                .slice(0, numberOfDays)
                .map((day) => {
                  const dayData = editedProgram.workoutDays.find((d) => {
                    return allDays[d.dayNumber as keyof typeof allDays] === day;
                  });
                  const exerciseCount = dayData?.exercises.length || 0;

                  return (
                    <TabsTrigger key={day} value={day} className="relative">
                      {formatDayName(day as DayOfWeek).slice(0, 3)}
                      {exerciseCount >= 0 &&
                        getDayId(day as DayOfWeek) !== "" &&
                        !getDayId(day as DayOfWeek).includes("temp-") && (
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
                        <div className="flex gap-2 justify-between items-center">
                          <div className="flex gap-2 items-center w-3/4">
                            <Input
                              className="w-fit placeholder:text-slate-500 text-sm"
                              placeholder="Day name"
                              value={getDayName(day as DayOfWeek)}
                              onChange={(e) => {
                                const dayNumber = Object.entries(allDays).find(
                                  ([_, value]) => value === day
                                )?.[0];

                                if (!dayNumber) return;

                                const existingDayIndex =
                                  editedProgram.workoutDays.findIndex(
                                    (d) =>
                                      allDays[
                                        d.dayNumber as keyof typeof allDays
                                      ] === day
                                  );

                                if (existingDayIndex === -1) {
                                  // Day doesn't exist yet, create a new one
                                  setEditedProgram((prev) => ({
                                    ...prev,
                                    workoutDays: [
                                      ...prev.workoutDays,
                                      {
                                        dayId: `temp-${Date.now()}`,
                                        dayName: e.target.value,
                                        dayNumber: parseInt(dayNumber),
                                        exercises: [],
                                      },
                                    ],
                                  }));
                                } else {
                                  // Update existing day
                                  const updatedDays =
                                    editedProgram.workoutDays.map((d) => {
                                      if (
                                        allDays[
                                          d.dayNumber as keyof typeof allDays
                                        ] === day
                                      ) {
                                        return {
                                          ...d,
                                          dayName: e.target.value,
                                        };
                                      }
                                      return d;
                                    });
                                  setEditedProgram({
                                    ...editedProgram,
                                    workoutDays: updatedDays,
                                  });
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              className="gap-1 w-[80px]"
                              onClick={() => {
                                handleUpdateProgramDayName(
                                  activeDay as DayOfWeek
                                );
                              }}
                              disabled={
                                isUpdatingDay ||
                                isAddingDay ||
                                getDayName(day as DayOfWeek) ===
                                  program.workoutDays.find(
                                    (d) =>
                                      d.dayId === getDayId(day as DayOfWeek)
                                  )?.dayName ||
                                getDayName(day as DayOfWeek) === ""
                              }
                            >
                              {isUpdatingDay || isAddingDay ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                          </div>

                          <div>
                            {!isMobile ? (
                              <div className="flex">
                                {getDayId(day as DayOfWeek) !== "" &&
                                  !getDayId(day as DayOfWeek).includes(
                                    "temp-"
                                  ) && (
                                    <Button
                                      variant={"destructive"}
                                      className="mr-2"
                                      onClick={() => {
                                        setContext("Program Day");
                                        setShowDeleteDialog(true);
                                      }}
                                    >
                                      Delete Day
                                    </Button>
                                  )}
                                <Button
                                  onClick={() => {
                                    if (
                                      getDayId(day as DayOfWeek) === "" ||
                                      getDayId(day as DayOfWeek).includes(
                                        "temp-"
                                      )
                                    ) {
                                      setShowAddExerciseWarning(true);
                                    } else {
                                      setIsOpen(true);
                                    }
                                  }}
                                >
                                  Add Exercise
                                </Button>
                              </div>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <EllipsisVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="center"
                                  side="right"
                                >
                                  {program.programType === "custom" && (
                                    <DropdownMenuItem>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add Day
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (
                                        getDayId(day as DayOfWeek) === "" ||
                                        getDayId(day as DayOfWeek).includes(
                                          "temp-"
                                        )
                                      ) {
                                        setShowAddExerciseWarning(true);
                                      } else {
                                        setIsOpen(true);
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Exercise
                                  </DropdownMenuItem>
                                  {getDayId(day as DayOfWeek) !== "" &&
                                    !getDayId(day as DayOfWeek).includes(
                                      "temp-"
                                    ) && (
                                      <DropdownMenuItem
                                        variant={"destructive"}
                                        className="text-red-500"
                                        onClick={() => {
                                          setContext("Program Day");
                                          setShowDeleteDialog(true);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete Day
                                      </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <DaySchedule
                      exercises={getExercisesForActiveDay()}
                      onRemoveExercise={(exerciseId) =>
                        handleDeleteExercise(exerciseId)
                      }
                      onUpdateExercise={(exercise) =>
                        handleUpdateExercise(exercise)
                      }
                      onReorderExercises={(exercises) =>
                        handleReorderExercises(exercises)
                      }
                      isEditing={isEditing}
                      setError={setError}
                    />
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
        handleDelete={handleDelete}
        isDeleting={isDeleting || isDeletingDay}
        context={context}
      />
      <AddExerciseModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onAddExercise={handleAddExercise}
        isAddingExercise={isAddingExercise}
      />
      <AddExerciseWarning
        showAddExerciseWarning={showAddExerciseWarning}
        setShowAddExerciseWarning={setShowAddExerciseWarning}
      />
    </div>
  );
}
