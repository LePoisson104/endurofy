"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
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
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useGetWorkoutProgramQuery } from "@/api/workout-program/workout-program-api-slice";
import type { Exercise } from "@/interfaces/workout-program-interfaces";
import AddExerciseModal from "./add-exercise-modal";

interface ExerciseSelectionModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
  isAddingExercise?: boolean;
}

export default function ExerciseSelectionModal({
  isOpen,
  setIsOpen,
  onSelectExercise,
  isAddingExercise = false,
}: ExerciseSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const user = useSelector(selectCurrentUser);

  // Fetch user's workout programs to get all exercises
  const { data: workoutPrograms, isLoading } = useGetWorkoutProgramQuery({
    userId: user?.user_id,
  });

  // Extract all unique exercises from workout programs
  const getAllExercises = (): Exercise[] => {
    if (!workoutPrograms?.data || !Array.isArray(workoutPrograms.data))
      return [];

    const allExercises: Exercise[] = [];
    const exerciseNames = new Set<string>();

    workoutPrograms.data.forEach((program: any) => {
      program.workoutDays?.forEach((day: any) => {
        day.exercises?.forEach((exercise: Exercise) => {
          // Use exercise name as unique identifier to avoid duplicates
          if (!exerciseNames.has(exercise.exerciseName)) {
            exerciseNames.add(exercise.exerciseName);
            allExercises.push(exercise);
          }
        });
      });
    });

    return allExercises.sort((a, b) =>
      a.exerciseName.localeCompare(b.exerciseName)
    );
  };

  // Filter exercises based on search term
  const filteredExercises = getAllExercises().filter(
    (exercise) =>
      exercise.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    setIsAddExerciseModalOpen(false);
    setIsOpen(false);
  };

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card max-w-2xl max-h-[80vh]">
          <DialogHeader className="mb-4">
            <DialogTitle>Select Exercise</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                Create Exercise
              </Button>
            </div>

            <Separator />

            {/* Exercise List */}
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-muted-foreground">
                    Loading exercises...
                  </div>
                </div>
              ) : filteredExercises.length === 0 ? (
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
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-medium">
                              {exercise.exerciseName}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {exercise.laterality}
                              </Badge>
                              <Badge className="text-xs bg-blue-500 text-white">
                                {exercise.bodyPart}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
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

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        setIsOpen={setIsAddExerciseModalOpen}
        onAddExercise={handleAddNewExercise}
        isAddingExercise={isAddingExercise}
      />
    </>
  );
}
