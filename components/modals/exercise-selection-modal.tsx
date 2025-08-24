"use client";

import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, EllipsisVertical, Trash2, Pencil } from "lucide-react";
import AddExerciseModal from "./add-exercise-modal";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import AddExerciseConfirmDialog from "@/components/dialog/add-exercise-confim";
import {
  useCreateManualWorkoutExerciseMutation,
  useUpdateWorkoutProgramExerciseMutation,
  useDeleteWorkoutProgramExerciseMutation,
} from "@/api/workout-program/workout-program-api-slice";

import type { Exercise } from "@/interfaces/workout-program-interfaces";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import DeleteDialog from "../dialog/delete-dialog";
import CustomBadge from "../badges/custom-badge";
import BodyPartBadge from "../badges/bodypart-badge";

interface ExerciseWithProgram extends Exercise {
  programName: string;
  programType: string;
  programId: string;
  dayId: string;
}

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
  isAddingExercise?: boolean;
  dayId: string;
}

export default function ExerciseSelectionModal({
  isOpen,
  setIsOpen,
  onSelectExercise,
  isAddingExercise = false,
  dayId,
}: ExerciseSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isEditExerciseModalOpen, setIsEditExerciseModalOpen] = useState(false);
  const [showAddExerciseConfirmDialog, setShowAddExerciseConfirmDialog] =
    useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseWithProgram | null>(null);
  const [exerciseToEdit, setExerciseToEdit] =
    useState<ExerciseWithProgram | null>(null);
  const [exerciseToDelete, setExerciseToDelete] =
    useState<ExerciseWithProgram | null>(null);

  const isMobile = useIsMobile();
  const workoutPrograms = useSelector(selectWorkoutProgram);
  const isDark = useGetCurrentTheme();

  const [
    createManualWorkoutExercise,
    { isLoading: isCreatingManualWorkoutExercise },
  ] = useCreateManualWorkoutExerciseMutation();

  const [updateWorkoutProgramExercise, { isLoading: isUpdatingExercise }] =
    useUpdateWorkoutProgramExerciseMutation();

  const [deleteWorkoutProgramExercise, { isLoading: isDeletingExercise }] =
    useDeleteWorkoutProgramExerciseMutation();

  // Extract all unique exercises from workout programs
  const getAllExercises = useCallback((): ExerciseWithProgram[] => {
    if (!workoutPrograms || !Array.isArray(workoutPrograms)) return [];

    const allExercises: ExerciseWithProgram[] = [];
    const exerciseKeys = new Set<string>();

    workoutPrograms.forEach((program: any) => {
      program.workoutDays?.forEach((day: any) => {
        day.exercises?.forEach((exercise: Exercise) => {
          // Create unique identifier using all key properties
          const uniqueKey = `${exercise.exerciseName}-${exercise.sets}-${exercise.minReps}-${exercise.maxReps}-${exercise.bodyPart}-${exercise.laterality}`;

          if (!exerciseKeys.has(uniqueKey)) {
            exerciseKeys.add(uniqueKey);
            allExercises.push({
              ...exercise,
              programName: program.programName || "Unknown Program",
              programType: program.programType || "unknown",
              programId: program.programId || "",
              dayId: day.dayId || "",
            });
          }
        });
      });
    });

    return allExercises.sort((a, b) =>
      a.exerciseName.localeCompare(b.exerciseName)
    );
  }, [workoutPrograms]);

  // Filter exercises based on search term
  const filteredExercises = getAllExercises().filter(
    (exercise) =>
      exercise.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.laterality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if exercise is from manual program
  const isManualExercise = (exercise: ExerciseWithProgram): boolean => {
    return exercise.programType === "manual";
  };

  const handleAddNewExercise = async (exercise: Exercise) => {
    try {
      await createManualWorkoutExercise({
        dayId: dayId,
        payload: {
          exerciseName: exercise.exerciseName,
          bodyPart: exercise.bodyPart,
          sets: exercise.sets,
          minReps: exercise.minReps,
          maxReps: exercise.maxReps,
          laterality: exercise.laterality,
          exerciseOrder: 1,
        },
      }).unwrap();
      toast.success("Exercise added to exercise selection");
      setIsAddExerciseModalOpen(false);
      setSearchTerm(exercise.exerciseName);
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to create exercise. Please try again.");
      }
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setExerciseName(exercise.exerciseName);
    setSelectedExercise(exercise as ExerciseWithProgram);
    setShowAddExerciseConfirmDialog(true);
  };

  const handleConfirmAddExercise = () => {
    if (selectedExercise) {
      onSelectExercise(selectedExercise);
      setShowAddExerciseConfirmDialog(false);
      setIsOpen(false);
    }
  };

  const handleEditExercise = (exercise: ExerciseWithProgram) => {
    setExerciseToEdit(exercise);
    setIsEditExerciseModalOpen(true);
  };

  const handleUpdateExercise = async (updatedExercise: Exercise) => {
    if (!exerciseToEdit) return;

    try {
      await updateWorkoutProgramExercise({
        dayId: exerciseToEdit.dayId,
        exerciseId: exerciseToEdit.exerciseId,
        programId: exerciseToEdit.programId,
        payload: {
          exerciseName: updatedExercise.exerciseName,
          bodyPart: updatedExercise.bodyPart,
          sets: updatedExercise.sets,
          minReps: updatedExercise.minReps,
          maxReps: updatedExercise.maxReps,
          laterality: updatedExercise.laterality,
          exerciseOrder: updatedExercise.exerciseOrder,
        },
      }).unwrap();
      toast.success("Exercise updated successfully");
      setIsEditExerciseModalOpen(false);
      setExerciseToEdit(null);
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to update exercise. Please try again.");
      }
    }
  };

  const handleDeleteExercise = (exercise: ExerciseWithProgram) => {
    setExerciseToDelete(exercise);
    setShowDeleteConfirmDialog(true);
  };

  const handleConfirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;

    try {
      await deleteWorkoutProgramExercise({
        programId: exerciseToDelete.programId,
        dayId: exerciseToDelete.dayId,
        exerciseId: exerciseToDelete.exerciseId,
      }).unwrap();
      toast.success("Exercise deleted successfully");
      setShowDeleteConfirmDialog(false);
      setExerciseToDelete(null);
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to delete exercise. Please try again.");
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={`bg-card max-h-[80vh] ${
            isMobile ? "max-w-[95vw] w-[95vw] p-4" : "max-w-2xl"
          }`}
        >
          <DialogHeader className="mb-4">
            <DialogTitle>Select Exercise</DialogTitle>
            <DialogDescription>
              Select an exercise to add to your workout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {/* Search and Create Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setIsAddExerciseModalOpen(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Exercise List */}
            <ScrollArea className="h-100 w-full">
              {filteredExercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-2">
                  <div className="text-muted-foreground">
                    {searchTerm
                      ? "No exercises found"
                      : "No exercises available"}
                  </div>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsAddExerciseModalOpen(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Exercise
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredExercises.map((exercise) => (
                    <Card
                      key={`${exercise.exerciseName}-${exercise.bodyPart}-${exercise.exerciseId}`}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border rounded-md"
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      <CardContent className="px-4 py-3 flex justify-between items-center">
                        <div className="flex justify-between items-start flex-1">
                          <div className="space-y-2">
                            <div
                              className={`flex ${
                                isMobile
                                  ? "flex-col"
                                  : "flex-row items-center gap-2"
                              }`}
                            >
                              <h3 className="font-medium text-sm">
                                {exercise.exerciseName}
                              </h3>
                              <h3
                                className={`text-sm ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                {exercise.programName}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <CustomBadge title={exercise.laterality} />
                              <BodyPartBadge bodyPart={exercise.bodyPart} />
                            </div>
                            <div
                              className={`text-sm ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              {exercise.sets} sets • {exercise.minReps}-
                              {exercise.maxReps} reps
                            </div>
                          </div>
                        </div>

                        {/* Show ellipsis menu only for manual exercises */}
                        {isManualExercise(exercise) && (
                          <div
                            className="ml-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <EllipsisVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditExercise(exercise)}
                                  className="flex items-center gap-2"
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteExercise(exercise)}
                                  variant="destructive"
                                  className="flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        setIsOpen={setIsAddExerciseModalOpen}
        onAddExercise={handleAddNewExercise}
        isAddingExercise={isCreatingManualWorkoutExercise}
        title="Create Exercise"
      />

      {/* Edit Exercise Modal */}
      <AddExerciseModal
        isOpen={isEditExerciseModalOpen}
        setIsOpen={setIsEditExerciseModalOpen}
        onAddExercise={handleUpdateExercise}
        isAddingExercise={isUpdatingExercise}
        title="Edit Exercise"
        initialExercise={
          exerciseToEdit
            ? {
                exerciseId: exerciseToEdit.exerciseId,
                exerciseName: exerciseToEdit.exerciseName,
                bodyPart: exerciseToEdit.bodyPart,
                sets: exerciseToEdit.sets,
                minReps: exerciseToEdit.minReps,
                maxReps: exerciseToEdit.maxReps,
                laterality: exerciseToEdit.laterality,
                exerciseOrder: exerciseToEdit.exerciseOrder,
              }
            : undefined
        }
        isEditing={true}
      />

      {/* Add Exercise Confirmation Dialog */}
      <AddExerciseConfirmDialog
        showDeleteDialog={showAddExerciseConfirmDialog}
        setShowDeleteDialog={setShowAddExerciseConfirmDialog}
        exerciseName={exerciseName}
        setIsAddingExercise={handleConfirmAddExercise}
      />

      <DeleteDialog
        showDeleteDialog={showDeleteConfirmDialog}
        setShowDeleteDialog={setShowDeleteConfirmDialog}
        handleDelete={handleConfirmDeleteExercise}
        isDeleting={isDeletingExercise}
        title="Delete Exercise"
        children={
          <>
            Are you sure you want to delete this{" "}
            <span
              className={`${
                isDark ? "text-blue-400" : "text-blue-500"
              } font-bold`}
            >
              {exerciseToDelete?.exerciseName}?
            </span>
            This action cannot be undone.
          </>
        }
      />
    </>
  );
}
