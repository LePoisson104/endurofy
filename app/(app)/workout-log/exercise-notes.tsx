import { toast } from "sonner";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateExerciseNotesMutation } from "@/api/workout-log/workout-log-api-slice";
import type { Exercise } from "@/interfaces/workout-program-interfaces";

export default function ExerciseNotes({
  exerciseNotes,
  setExerciseNotes,
  getExerciseNotes,
  getWorkoutExerciseId,
  hasAnyLoggedSets,
  exercise,
}: {
  exerciseNotes: { [id: string]: string };
  setExerciseNotes: React.Dispatch<
    React.SetStateAction<{ [id: string]: string }>
  >;
  getExerciseNotes: (workoutExerciseId: string) => string;
  getWorkoutExerciseId: (exerciseId: string) => string;
  hasAnyLoggedSets: boolean;
  exercise: Exercise;
}) {
  const [updateExerciseNotes, { isLoading: isUpdatingExerciseNotes }] =
    useUpdateExerciseNotesMutation();

  const debouncedSaveNote = useDebounceCallback(
    async (workoutExerciseId: string, notes: string) => {
      if (!workoutExerciseId && notes.trim() === "") {
        return;
      }

      try {
        await updateExerciseNotes({
          workoutExerciseId: workoutExerciseId,
          exerciseNotes: notes.trim(),
        }).unwrap();
      } catch (error: any) {
        if (error) {
          toast.error(error.data.message);
        } else {
          toast.error("Internal server error. Failed to save exercise notes");
        }
      }
    },
    2000
  );
  // Get the current value for a textarea (local state takes precedence over saved notes)
  const getCurrentNoteValue = (workoutExerciseId: string): string => {
    // If we have local changes, use those
    if (exerciseNotes[workoutExerciseId] !== undefined) {
      return exerciseNotes[workoutExerciseId];
    }

    // Otherwise, use the saved notes from the database
    return getExerciseNotes(workoutExerciseId) || "";
  };

  const handleNotesChange = (workoutExerciseId: string, notes: string) => {
    // Update UI immediately
    setExerciseNotes((prev) => ({
      ...prev,
      [workoutExerciseId]: notes,
    }));

    // Save to API with debounce
    debouncedSaveNote(workoutExerciseId, notes);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="workout-notes">
        Exercise Notes
        <span className="text-sm text-slate-500">
          {isUpdatingExerciseNotes
            ? "(Saving...)"
            : getExerciseNotes(getWorkoutExerciseId(exercise.exerciseId)) !== ""
            ? "(Saved)"
            : "(Optional)"}
        </span>
      </Label>
      <Textarea
        id="workout-notes"
        placeholder={
          hasAnyLoggedSets
            ? "Add notes about this exercise... (max 200 characters)"
            : "No sets logged yet"
        }
        maxLength={200}
        className="min-h-[80px]"
        value={getCurrentNoteValue(getWorkoutExerciseId(exercise.exerciseId))}
        onChange={(e) =>
          handleNotesChange(
            getWorkoutExerciseId(exercise.exerciseId),
            e.target.value
          )
        }
        disabled={!hasAnyLoggedSets}
      />
    </div>
  );
}
