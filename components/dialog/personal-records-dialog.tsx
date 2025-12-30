import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

export default function PersonalRecordsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Info className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="px-3 py-8" closeXButton={true}>
        <DialogHeader>
          <DialogTitle className="text-center">
            How Personal Records are Calculated
          </DialogTitle>
          <DialogDescription className="pt-2 text-center">
            Personal records are calculated by comparing your latest completed
            workout log in the selected time period to your first ever completed
            workout log for each exercise.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div>
              <span className="font-medium text-emerald-600 dark:text-emerald-500">
                Improved
              </span>
              <span className="text-muted-foreground">
                {" "}
                — You lifted more weight or did more reps than your first
                workout
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
            <div>
              <span className="font-medium text-cyan-600 dark:text-cyan-500">
                Maintained
              </span>
              <span className="text-muted-foreground">
                {" "}
                — Your performance stayed the same as your first workout
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
            <div>
              <span className="font-medium text-red-400">Regressed</span>
              <span className="text-muted-foreground">
                {" "}
                — You lifted less weight or did fewer reps than your first
                workout
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

