import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function BMIDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Info className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            BMI Categories
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Body Mass Index (BMI) is a measure of body fat based on height and
            weight. Here&apos;s how the categories break down:
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-blue-400">Underweight</span>
            <span>&lt; 18.5</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-green-400">Normal weight</span>
            <span>18.5 - 24.9</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-yellow-400">Overweight</span>
            <span>25 - 29.9</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-red-400">Obesity</span>
            <span>&ge; 30</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
