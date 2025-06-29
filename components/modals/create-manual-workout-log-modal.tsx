import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CreateManualWorkoutLogModal({
  logName,
  setLogName,
  isLoading,
  setIsOpen,
}: {
  logName: string;
  setLogName: (logName: string) => void;
  isLoading: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <Dialog onOpenChange={setIsOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Create Workout Log</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Create Workout Log</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Input
                id="logName"
                name="logName"
                placeholder="Workout Log Name"
                value={logName}
                onChange={(e) => setLogName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isLoading}
              className={`${isMobile ? "w-full" : "w-[100px]"}`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
