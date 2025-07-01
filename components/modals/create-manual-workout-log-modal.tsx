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
  handleCreateWorkoutLog,
  isOpen,
  setIsOpen,
}: {
  logName: string;
  setLogName: (logName: string) => void;
  isLoading: boolean;
  handleCreateWorkoutLog: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateWorkoutLog();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        Create Workout Log
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <form onSubmit={handleSubmit}>
              <Button
                disabled={isLoading}
                className={`${isMobile ? "w-full" : "w-[100px]"}`}
                type="submit"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
