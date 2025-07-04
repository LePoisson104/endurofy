"use client";

import { useEffect, useState, useRef } from "react";
import {
  Edit,
  Trash2,
  X,
  EllipsisVertical,
  Plus,
  Loader2,
  Minus,
  CalendarIcon,
} from "lucide-react";
import { format, parseISO, parse, isValid } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DaySchedule } from "./day-scheldule";
import type {
  WorkoutProgram,
  AllDays,
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
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import DeleteDialog from "@/components/dialog/delete-dialog";

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
  const currentDayRef = useRef<HTMLButtonElement>(null);
  const previousActiveDayRef = useRef<AllDays | null>(null);

  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [allDays, setAllDays] = useState<Record<number, AllDays>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddExerciseWarning, setShowAddExerciseWarning] = useState(false);
  const [context, setContext] = useState("");
  const [activeDay, setActiveDay] = useState<AllDays | null>(null);
  const [editedProgram, setEditedProgram] = useState<WorkoutProgram>({
    ...program,
  });
  const [numberOfDays, setNumberOfDays] = useState(0);

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
  const [reorderWorkoutProgramExercise] =
    useReorderWorkoutProgramExerciseMutation();

  // Format created date
  const formatDate = (dateString: string) => {
    const dateFormat = format(parseISO(dateString), "MMMM d, yyyy");
    const timeFormat = format(parseISO(dateString), "h:mm a");
    return `${dateFormat} at ${timeFormat}`;
  };

  // Format day name
  const formatDayName = (day: AllDays) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  useEffect(() => {
    setEditedProgram({
      ...program,
      startingDate: format(new Date(program.startingDate), "MM/dd/yyyy"),
    });
    setAllDays(
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
          }
    );
  }, [program]);

  useEffect(() => {
    if (!isEditing) {
      setNumberOfDays(
        program.programType === "custom"
          ? Math.max(...program.workoutDays.map((d) => d.dayNumber)) + 1
          : 7
      );
    } else if (isEditing) {
      setNumberOfDays(
        program.programType === "custom"
          ? Math.max(...program.workoutDays.map((d) => d.dayNumber))
          : 7
      );
    }
  }, [program, isEditing]);

  useEffect(() => {
    // Store the current active day before any updates
    if (activeDay) {
      previousActiveDayRef.current = activeDay;
    }

    // If we have a previous active day and it exists in the new program data, restore it
    if (previousActiveDayRef.current) {
      const dayExists = program.workoutDays.some(
        (day) =>
          allDays[day.dayNumber as keyof typeof allDays] ===
          previousActiveDayRef.current
      );

      if (dayExists) {
        setActiveDay(previousActiveDayRef.current);
        return;
      }
    }

    // If no previous active day or it doesn't exist anymore, set to first day
    if (program.workoutDays.length > 0) {
      setActiveDay(
        allDays[
          program.workoutDays[0].dayNumber as keyof typeof allDays
        ] as AllDays
      );
    }
  }, [program, allDays]);

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

  const addCustomDay = () => {
    const newDayNumber = numberOfDays + 1;
    const tempDayId = `temp-${Date.now()}`;

    // Add new day to the edited program state
    setEditedProgram((prev) => ({
      ...prev,
      workoutDays: [
        ...prev.workoutDays,
        {
          dayId: tempDayId,
          dayName: "",
          dayNumber: newDayNumber,
          exercises: [],
        },
      ],
    }));

    setNumberOfDays(newDayNumber);
    // Set the new day as active
    setActiveDay(`D${newDayNumber}` as AllDays);
  };

  const removeCustomDay = () => {
    const dayId = getDayId(activeDay as AllDays);
    if (!dayId) return;

    // Get the day number of the day being removed
    const removedDayNumber = editedProgram.workoutDays.find(
      (day) => day.dayId === dayId
    )?.dayNumber;
    if (!removedDayNumber) return;

    // Update the edited program state
    setEditedProgram((prev) => {
      // Remove the day
      const updatedDays = prev.workoutDays.filter((day) => day.dayId !== dayId);

      // Renumber the remaining days
      const renumberedDays = updatedDays.map((day) => {
        if (day.dayNumber > removedDayNumber) {
          return {
            ...day,
            dayNumber: day.dayNumber - 1,
          };
        }
        return day;
      });

      return {
        ...prev,
        workoutDays: renumberedDays,
      };
    });

    setNumberOfDays(numberOfDays - 1);

    // Set active day to the first available day
    const remainingDays = editedProgram.workoutDays.filter(
      (day) => day.dayId !== dayId
    );
    if (remainingDays.length > 0) {
      const firstRemainingDay = remainingDays[0];
      const dayKey = Object.entries(allDays).find(
        ([_, value]) => value === firstRemainingDay.dayNumber.toString()
      )?.[1];
      if (dayKey) {
        setActiveDay(dayKey as AllDays);
      }
    }
  };

  // Handle adding a new exercise to a day
  const handleAddExercise = async (exercise: Omit<Exercise, "id">) => {
    const dayId = getDayId(activeDay as AllDays);

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
      toast.success("Exercise added successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to add exercise");
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
      toast.success("Exercise updated successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to update exercise");
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
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to reorder exercises");
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
      toast.success("Program description updated successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error(
          "Internal server error. Failed to update program description"
        );
      }
    }
  };

  const handleUpdateProgramDayName = async (day: AllDays) => {
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
        toast.success("Day added successfully");
      } catch (error: any) {
        if (error.status !== 500) {
          toast.error(error.data.message);
        } else {
          toast.error(
            "Internal server error. Failed to update program day name"
          );
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
      toast.success("Day name updated successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to update program day name");
      }
    }
  };

  // Handle deleting a program day
  const handleDeleteProgramDay = async () => {
    try {
      await deleteWorkoutProgramDay({
        programId: program.programId,
        dayId: getDayId(activeDay as AllDays),
      }).unwrap();
      toast.success("Day deleted successfully");
    } catch (error: any) {
      if (error.data.message) {
        toast.error("Internal server error. Failed to delete program day");
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
      toast.success("Exercise deleted successfully");
    } catch (error: any) {
      if (error.status !== 500) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to delete exercise");
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

  const getDayName = (day: AllDays) => {
    if (!activeDay) return "";
    const activeWorkoutDay = editedProgram.workoutDays.find((d) => {
      return allDays[d?.dayNumber as keyof typeof allDays] === day;
    });

    return activeWorkoutDay ? activeWorkoutDay.dayName : "";
  };

  const getDayId = (day: AllDays) => {
    if (!activeDay) return "";
    const activeWorkoutDay = editedProgram.workoutDays.find((d) => {
      return allDays[d?.dayNumber as keyof typeof allDays] === day;
    });

    return activeWorkoutDay ? activeWorkoutDay.dayId : "";
  };

  return (
    <div className="space-y-6">
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
              <div className="flex items-center gap-2">
                <CardTitle>{program.programName}</CardTitle>
                {program.isActive === 1 && (
                  <Badge className="bg-blue-500 text-white border-none">
                    Active
                  </Badge>
                )}
              </div>
            )}
            {isEditing ? (
              <>
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
                {program.programType === "custom" && (
                  <div className="flex flex-col gap-2 mt-5 mb-5">
                    <Label htmlFor="program-start-date">
                      Program Start Date
                    </Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-fit justify-start text-left font-normal"
                            )}
                          >
                            <CalendarIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={
                              editedProgram.startingDate
                                ? isValid(
                                    parse(
                                      editedProgram.startingDate,
                                      "MM/dd/yyyy",
                                      new Date()
                                    )
                                  )
                                  ? parse(
                                      editedProgram.startingDate,
                                      "MM/dd/yyyy",
                                      new Date()
                                    )
                                  : parseISO(editedProgram.startingDate)
                                : undefined
                            }
                            onSelect={function (day) {
                              if (day) {
                                setEditedProgram({
                                  ...editedProgram,
                                  startingDate: format(day, "MM/dd/yyyy"),
                                });
                              } else {
                                setEditedProgram({
                                  ...editedProgram,
                                  startingDate: "",
                                });
                              }
                            }}
                            month={visibleMonth}
                            onMonthChange={(month: Date) =>
                              setVisibleMonth(month)
                            }
                            classNames={{
                              day_selected:
                                "bg-blue-500 text-white hover:bg-amber-600",
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        id="date"
                        type="text"
                        pattern="\d{2}/\d{2}/\d{4}"
                        placeholder="MM/DD/YYYY"
                        className="placeholder:text-sm w-full text-sm"
                        value={editedProgram.startingDate}
                        onChange={(e) => {
                          setEditedProgram({
                            ...editedProgram,
                            startingDate: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
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
                    editedProgram.description === program.description &&
                    editedProgram.startingDate ===
                      format(new Date(program.startingDate), "MM/dd/yyyy"))
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
            {program.programType === "custom" && (
              <div
                className={`text-xs ${
                  isDarkMode ? "text-blue-300" : "text-blue-500"
                }`}
              >
                Starting date: {formatDate(program.startingDate).split("at")[0]}
              </div>
            )}
            <div
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Created on {formatDate(program.createdAt)}
            </div>
            {new Date(program.createdAt).toISOString().split("T")[0] !==
              new Date(program.updatedAt).toISOString().split("T")[0] && (
              <div
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Updated on {formatDate(program.updatedAt)}
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
          {isEditing && !isMobile && program.programType === "custom" && (
            <div className="flex justify-end mb-4 gap-2">
              {getDayId(activeDay as AllDays).includes("temp-") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={removeCustomDay}
                >
                  Remove Day
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={addCustomDay}>
                <Plus className="h-4 w-4 mr-1" />
                Add Day
              </Button>
            </div>
          )}
          <Tabs
            value={activeDay || undefined}
            onValueChange={(value) => setActiveDay(value as AllDays)}
            className="space-y-4"
          >
            <TabsList
              className={`grid w-full grid-cols-7 ${
                program.programType === "custom" &&
                (program.workoutDays.length > 7 || numberOfDays > 7)
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
                    <TabsTrigger
                      key={day}
                      value={day}
                      className="relative"
                      ref={day === activeDay ? currentDayRef : null}
                    >
                      {formatDayName(day as AllDays).slice(0, 3)}
                      {exerciseCount >= 0 &&
                        getDayId(day as AllDays) !== "" &&
                        !getDayId(day as AllDays).includes("temp-") && (
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
                          {getDayName(day as AllDays)}
                        </h3>
                      ) : (
                        <div className="flex gap-2 justify-between items-center">
                          <div className="flex gap-2 items-center w-3/4">
                            <Input
                              className="w-fit placeholder:text-slate-500 text-sm"
                              placeholder="Day name"
                              value={getDayName(day as AllDays)}
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
                                  activeDay as AllDays
                                );
                              }}
                              disabled={
                                isUpdatingDay ||
                                isAddingDay ||
                                getDayName(day as AllDays) ===
                                  program.workoutDays.find(
                                    (d) => d.dayId === getDayId(day as AllDays)
                                  )?.dayName ||
                                getDayName(day as AllDays) === ""
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
                                {getDayId(day as AllDays) !== "" &&
                                  !getDayId(day as AllDays).includes(
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
                                      getDayId(day as AllDays) === "" ||
                                      getDayId(day as AllDays).includes("temp-")
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
                                    <>
                                      {getDayId(activeDay as AllDays).includes(
                                        "temp-"
                                      ) && (
                                        <DropdownMenuItem
                                          variant={"destructive"}
                                          onClick={removeCustomDay}
                                        >
                                          <Minus className="h-4 w-4 mr-1" />
                                          Remove Day
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuItem onClick={addCustomDay}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Day
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (
                                        getDayId(day as AllDays) === "" ||
                                        getDayId(day as AllDays).includes(
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
                                  {getDayId(day as AllDays) !== "" &&
                                    !getDayId(day as AllDays).includes(
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
                    />
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      <DeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        handleDelete={handleDelete}
        isDeleting={isDeleting || isDeletingDay}
        title={`Delete ${context.toLowerCase()}`}
        children={`Are you sure you want to delete this ${context.toLowerCase()}? This action cannot be undone.`}
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
