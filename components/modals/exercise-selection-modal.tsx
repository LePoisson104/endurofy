"use client";

import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Search } from "lucide-react";
import AddExerciseModal from "./add-exercise-modal";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import AddExerciseConfirmDialog from "@/components/dialog/add-exercise-confim";
import { useCreateManualWorkoutExerciseMutation } from "@/api/workout-program/workout-program-api-slice";

import type { Exercise } from "@/interfaces/workout-program-interfaces";
import { toast } from "sonner";

interface ExerciseWithProgram extends Exercise {
  programName: string;
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
  const [showAddExerciseConfirmDialog, setShowAddExerciseConfirmDialog] =
    useState(false);

  const [exerciseName, setExerciseName] = useState("");
  const isMobile = useIsMobile();
  const workoutPrograms = useSelector(selectWorkoutProgram);
  const isDark = useGetCurrentTheme();

  const [
    createManualWorkoutExercise,
    { isLoading: isCreatingManualWorkoutExercise },
  ] = useCreateManualWorkoutExerciseMutation();

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
    setShowAddExerciseConfirmDialog(true);
  };

  const handleConfirmAddExercise = () => {
    const selectedExercise = filteredExercises.find(
      (exercise) => exercise.exerciseName === exerciseName
    );
    if (selectedExercise) {
      onSelectExercise(selectedExercise);
      setShowAddExerciseConfirmDialog(false);
      setIsOpen(false);
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
                      key={`${exercise.exerciseName}-${exercise.bodyPart}`}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-b rounded-none"
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      <CardContent className="px-4">
                        <div className="flex justify-between items-start">
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
                              <Badge className="text-xs">
                                {exercise.laterality}
                              </Badge>
                              <Badge className="text-xs bg-blue-500 text-white">
                                {exercise.bodyPart}
                              </Badge>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* create Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        setIsOpen={setIsAddExerciseModalOpen}
        onAddExercise={handleAddNewExercise}
        isAddingExercise={isCreatingManualWorkoutExercise}
        title="Create Exercise"
      />
      <AddExerciseConfirmDialog
        showDeleteDialog={showAddExerciseConfirmDialog}
        setShowDeleteDialog={setShowAddExerciseConfirmDialog}
        exerciseName={exerciseName}
        setIsAddingExercise={handleConfirmAddExercise}
      />
    </>
  );
}
