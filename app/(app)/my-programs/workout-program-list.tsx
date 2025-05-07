"use client";

import { useState } from "react";
import { Calendar, MoreHorizontal } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { WorkoutProgram } from "../../../interfaces/workout-program-interfaces";
import DeleteProgramDialog from "@/components/dialog/delete-program";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutProgramListProps {
  programs: WorkoutProgram[];
  onSelectProgram: (program: WorkoutProgram) => void;
  onDeleteProgram: (programId: string) => void;
  isLoading: boolean;
  isDeleting: boolean;
}

export default function WorkoutProgramList({
  programs,
  onSelectProgram,
  onDeleteProgram,
  isLoading,
  isDeleting,
}: WorkoutProgramListProps) {
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);

  // Count days with exercises
  const countActiveDays = (program: WorkoutProgram) => {
    return program.workoutDays.filter((day) => day.exercises.length >= 0)
      .length;
  };

  // Count total exercises
  const countTotalExercises = (program: WorkoutProgram) => {
    return program.workoutDays.reduce(
      (total, day) => total + day.exercises.length,
      0
    );
  };

  // Format created date
  const formatCreatedDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (programToDelete) {
      onDeleteProgram(programToDelete);
      setProgramToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Skeleton className="w-full h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {programs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <h3 className="text-lg font-medium">No workout programs found</h3>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card
              key={program.programId}
              className="overflow-hidden flex flex-col h-[280px]"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="line-clamp-1">
                      {program.programName}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 h-10">
                      {program.description || "No description"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onSelectProgram(program)}
                      >
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setProgramToDelete(program.programId)}
                      >
                        Delete program
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Created {formatCreatedDate(program.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{countActiveDays(program)} days</Badge>
                  <Badge>{countTotalExercises(program)} exercises</Badge>
                </div>
                <Button
                  className="mt-auto w-full"
                  variant="outline"
                  onClick={() => onSelectProgram(program)}
                >
                  View Program
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteProgramDialog
        showDeleteDialog={!!programToDelete}
        setShowDeleteDialog={(open) => !open && setProgramToDelete(null)}
        handleDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
        context="program"
      />
    </div>
  );
}
