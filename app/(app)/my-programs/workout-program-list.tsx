"use client";

import { useState } from "react";
import { Calendar, Check, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkoutProgram } from "../../../interfaces/workout-program-interfaces";
import DeleteDialog from "@/components/dialog/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSetProgramAsInactiveMutation,
  useSetProgramAsActiveMutation,
} from "@/api/workout-program/workout-program-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { toast } from "sonner";
import CustomBadge from "@/components/badges/custom-badge";
import {
  ResponsiveMenu,
  createMenuItem,
  createMenuSection,
} from "@/components/ui/responsive-menu";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const user = useSelector(selectCurrentUser);
  const isMobile = useIsMobile();

  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  const [setProgramAsInactive] = useSetProgramAsInactiveMutation();
  const [setProgramAsActive] = useSetProgramAsActiveMutation();
  const [openDrawerProgramId, setOpenDrawerProgramId] = useState<string | null>(
    null
  );

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

  const handleSetProgramAsInactive = async (programId: string) => {
    try {
      await setProgramAsInactive({
        programId: programId,
        userId: user?.user_id,
      }).unwrap();
    } catch (error: any) {
      if (error.data.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to set program as inactive");
      }
    }
  };

  const handleSetProgramAsActive = async (programId: string) => {
    try {
      await setProgramAsActive({
        programId: programId,
        userId: user?.user_id,
      }).unwrap();
    } catch (error: any) {
      if (error.data.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Internal server error. Failed to set program as inactive");
      }
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
      {programs.length === 1 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <h3 className="text-lg font-medium">No workout programs found</h3>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs
            .filter((program) => program.programType !== "manual")
            .map((program) => {
              const menuSections = [
                createMenuSection([
                  createMenuItem("view-details", "View Details", Eye, () =>
                    onSelectProgram(program)
                  ),
                  program.isActive === 1
                    ? createMenuItem(
                        "set-as-inactive",
                        "Set as inactive",
                        Check,
                        () => handleSetProgramAsInactive(program.programId)
                      )
                    : createMenuItem(
                        "set-as-active",
                        "Set as active",
                        Check,
                        () => handleSetProgramAsActive(program.programId)
                      ),
                ]),
                createMenuSection([
                  createMenuItem(
                    "delete",
                    "Delete",
                    Trash2,
                    () => setProgramToDelete(program.programId),
                    {
                      variant: "destructive",
                    }
                  ),
                ]),
              ];

              return (
                <Card
                  key={program.programId}
                  className="overflow-hidden flex flex-col h-[280px] shadow-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{program.programName}</CardTitle>
                          {program.isActive === 1 && (
                            <CustomBadge title="Active" />
                          )}
                        </div>

                        <CardDescription className="line-clamp-2 h-10">
                          {program.description || "No description"}
                        </CardDescription>
                      </div>
                      {isMobile ? (
                        <>
                          <Button
                            onClick={() =>
                              setOpenDrawerProgramId(program.programId)
                            }
                            variant="ghost"
                            size="icon"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          <ResponsiveMenu
                            sections={menuSections}
                            isOpen={openDrawerProgramId === program.programId}
                            setIsOpen={(open) =>
                              setOpenDrawerProgramId(
                                open ? program.programId : null
                              )
                            }
                            dropdownAlign="end"
                            dropdownWidth="w-56"
                          />
                        </>
                      ) : (
                        <ResponsiveMenu
                          sections={menuSections}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span>
                          Created {formatCreatedDate(program.createdAt)}
                        </span>
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
              );
            })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteDialog
        showDeleteDialog={!!programToDelete}
        setShowDeleteDialog={(open) => !open && setProgramToDelete(null)}
        handleDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Program"
      >
        {`Are you sure you want to delete this "${
          programs.find((program) => program.programId === programToDelete)
            ?.programName
        }" program? This action cannot be undone.`}
      </DeleteDialog>
    </div>
  );
}
