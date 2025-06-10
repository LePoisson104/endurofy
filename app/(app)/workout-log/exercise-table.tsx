import { Exercise } from "../../../interfaces/workout-program-interfaces";
import { SetData } from "../../../interfaces/workout-log-interfaces";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Edit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ExerciseTableProps {
  exercise: Exercise;
  exerciseSets: SetData[];
  updateSetData: (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps" | "leftReps" | "rightReps",
    value: string
  ) => void;
  toggleSetLogged: (
    exerciseId: string,
    setIndex: number,
    exercise: Exercise
  ) => void;
  isFieldInvalid: (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps" | "leftReps" | "rightReps"
  ) => boolean;
  isEditing: boolean;
  hasLoggedSets: boolean;
  isMobile: boolean;
  showPrevious: boolean;
}

export default function ExerciseTable({
  exercise,
  exerciseSets,
  updateSetData,
  toggleSetLogged,
  isFieldInvalid,
  isEditing,
  hasLoggedSets,
  isMobile,
  showPrevious,
}: ExerciseTableProps) {
  // Function to log set data to console
  const logSetData = (
    setData: SetData,
    setIndex: number,
    exercise: Exercise
  ) => {
    console.log("Set Data for Exercise:", exercise.exerciseName);
    console.log("Set Index:", setIndex + 1);
    console.log("Current Set Data:", {
      weight: setData.weight,
      reps: setData.reps,
      leftReps: setData.leftReps,
      rightReps: setData.rightReps,
      isLogged: setData.isLogged,
      exercise: {
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        bodyPart: exercise.bodyPart,
        laterality: exercise.laterality,
      },
    });
  };

  // Handle checkbox toggle with logging
  const handleSetToggle = (
    exerciseId: string,
    setIndex: number,
    exercise: Exercise,
    setData: SetData
  ) => {
    // Log the current set data
    logSetData(setData, setIndex, exercise);

    // Call the original toggle function
    toggleSetLogged(exerciseId, setIndex, exercise);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="w-[60px]">
            <Check className="h-4 w-4 mx-auto" />
          </TableHead>
          <TableHead className="w-[60px] text-center">Set #</TableHead>
          <TableHead className="w-[120px] text-center">Weight (lbs)</TableHead>
          {exercise.laterality === "unilateral" ? (
            <>
              <TableHead className="w-[120px] text-center">Left Reps</TableHead>
              <TableHead className="w-[120px] text-center">
                Right Reps
              </TableHead>
            </>
          ) : (
            <TableHead className="w-[120px] text-center">Reps</TableHead>
          )}
          {(!isMobile || showPrevious) && (
            <>
              <TableHead className="w-[120px] text-center">
                Prev Weight
              </TableHead>
              {exercise.laterality === "unilateral" ? (
                <>
                  <TableHead className="w-[120px] text-center">
                    Prev Left
                  </TableHead>
                  <TableHead className="w-[120px] text-center">
                    Prev Right
                  </TableHead>
                </>
              ) : (
                <TableHead className="w-[120px] text-center">
                  Prev Reps
                </TableHead>
              )}
            </>
          )}
          {isEditing && hasLoggedSets && (
            <TableHead className="w-[120px] text-center">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: exercise.sets }).map((_, setIndex) => {
          const setData = exerciseSets[setIndex] || {
            weight: "",
            reps: "",
            leftReps: "",
            rightReps: "",
            isLogged: false,
          };

          return (
            <TableRow key={setIndex}>
              <TableCell className="text-center">
                <Checkbox
                  checked={setData.isLogged}
                  onCheckedChange={() => {
                    handleSetToggle(
                      exercise.exerciseId,
                      setIndex,
                      exercise,
                      setData
                    );
                  }}
                  className="h-4 w-4"
                />
              </TableCell>
              <TableCell className="font-medium text-center">
                {setIndex + 1}
              </TableCell>
              <TableCell className="text-center">
                <Input
                  placeholder="-"
                  type="number"
                  min="0"
                  step="2.5"
                  value={setData.weight}
                  onChange={(e) =>
                    updateSetData(
                      exercise.exerciseId,
                      setIndex,
                      "weight",
                      e.target.value
                    )
                  }
                  disabled={setData.isLogged}
                  className={`w-20 mx-auto text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    setData.isLogged
                      ? "bg-muted/50"
                      : isFieldInvalid(exercise.exerciseId, setIndex, "weight")
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </TableCell>
              {exercise.laterality === "unilateral" ? (
                <>
                  <TableCell className="text-center">
                    <Input
                      placeholder="-"
                      type="number"
                      min="0"
                      value={setData.leftReps}
                      onChange={(e) =>
                        updateSetData(
                          exercise.exerciseId,
                          setIndex,
                          "leftReps",
                          e.target.value
                        )
                      }
                      disabled={setData.isLogged}
                      className={`w-20 mx-auto text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        setData.isLogged
                          ? "bg-muted/50"
                          : isFieldInvalid(
                              exercise.exerciseId,
                              setIndex,
                              "leftReps"
                            )
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      placeholder="-"
                      type="number"
                      min="0"
                      value={setData.rightReps}
                      onChange={(e) =>
                        updateSetData(
                          exercise.exerciseId,
                          setIndex,
                          "rightReps",
                          e.target.value
                        )
                      }
                      disabled={setData.isLogged}
                      className={`w-20 mx-auto text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        setData.isLogged
                          ? "bg-muted/50"
                          : isFieldInvalid(
                              exercise.exerciseId,
                              setIndex,
                              "rightReps"
                            )
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </TableCell>
                </>
              ) : (
                <TableCell className="text-center">
                  <Input
                    placeholder="-"
                    type="number"
                    min="0"
                    value={setData.reps}
                    onChange={(e) =>
                      updateSetData(
                        exercise.exerciseId,
                        setIndex,
                        "reps",
                        e.target.value
                      )
                    }
                    disabled={setData.isLogged}
                    className={`w-20 mx-auto text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      setData.isLogged
                        ? "bg-muted/50"
                        : isFieldInvalid(exercise.exerciseId, setIndex, "reps")
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </TableCell>
              )}
              {(!isMobile || showPrevious) && (
                <>
                  <TableCell className="text-slate-500 text-center">
                    -
                  </TableCell>
                  {exercise.laterality === "unilateral" ? (
                    <>
                      <TableCell className="text-slate-500 text-center">
                        -
                      </TableCell>
                      <TableCell className="text-slate-500 text-center">
                        -
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-slate-500 text-center">
                      -
                    </TableCell>
                  )}
                </>
              )}
              {isEditing && hasLoggedSets && (
                <TableCell className="text-center">
                  {setData.isLogged ? (
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit set</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete set</span>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
