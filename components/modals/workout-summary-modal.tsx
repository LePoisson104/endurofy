"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkoutLog } from "@/interfaces/workout-log-interfaces";
import { formatTime } from "@/components/workout/timer-helper";
import {
  Clock,
  Dumbbell,
  ChartNoAxesColumnDecreasing,
  TrendingUp,
  Check,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutLog: WorkoutLog | null;
}

export default function WorkoutSummaryModal({
  isOpen,
  onClose,
  workoutLog,
}: WorkoutSummaryModalProps) {
  const isDark = useGetCurrentTheme();
  const summaryStats = useMemo(() => {
    if (!workoutLog) {
      return {
        totalExercises: 0,
        totalSets: 0,
        totalVolume: 0,
        duration: 0,
      };
    }

    const totalExercises = workoutLog.workoutExercises.length;
    const totalSets = workoutLog.workoutExercises.reduce(
      (sum, exercise) => sum + exercise.workoutSets.length,
      0
    );

    const totalVolume = workoutLog.workoutExercises.reduce(
      (sum, exercise) =>
        sum +
        exercise.workoutSets.reduce((setSum, set) => {
          const leftReps = set.repsLeft || 0;
          const rightReps = set.repsRight || 0;
          const weight = set.weight || 0;

          // For unilateral exercises, count both sides
          // For bilateral exercises, only count left reps (both sides work together)
          if (exercise.laterality === "unilateral") {
            return setSum + weight * (leftReps + rightReps);
          } else {
            return setSum + weight * leftReps;
          }
        }, 0),
      0
    );

    return {
      totalExercises,
      totalSets,
      totalVolume,
      duration: workoutLog.timer || 0,
    };
  }, [workoutLog]);

  if (!workoutLog) return null;

  const statCards = [
    {
      icon: Clock,
      label: "Duration",
      value: formatTime(summaryStats.duration),
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      icon: Dumbbell,
      label: "Exercises",
      value: summaryStats.totalExercises.toString(),
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
    },
    {
      icon: ChartNoAxesColumnDecreasing,
      label: "Total Sets",
      value: summaryStats.totalSets.toString(),
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      icon: TrendingUp,
      label: "Volume",
      value: `${(summaryStats.totalVolume / 1000).toFixed(1)}K lbs`,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md rounded-3xl p-0 bg-card border-none overflow-hidden"
        closeXButton={true}
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 p-4 pb-6 sm:p-6 sm:pb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-green-500/50"
          >
            <Check
              className="h-8 w-8 sm:h-10 sm:w-10 text-white"
              strokeWidth={3}
            />
          </motion.div>
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
              Workout Completed!
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base mt-1 sm:mt-2">
              Awesome work! Here's what you accomplished
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Stats Grid */}
        <div className="px-4 pb-4 mt-2 sm:px-6 sm:pb-6 sm:mt-3">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="relative group"
              >
                <div
                  className={`p-3 sm:p-4 rounded-2xl bg-card shadow-lg hover:shadow-lg transition-all duration-300 active:scale-95 sm:hover:-translate-y-1 ${
                    isDark ? "border" : "borber-none"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-2 sm:mb-0`}
                  >
                    <stat.icon
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`}
                    />
                  </div>

                  <div className="text-xs font-medium text-muted-foreground mt-1">
                    {stat.label}
                  </div>

                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Motivational message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
          >
            <div className="flex items-start sm:items-center gap-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">
                You're on fire! Keep pushing towards your goals!
              </p>
            </div>
          </motion.div>
        </div>

        <DialogFooter className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
          <Button
            onClick={onClose}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 active:scale-95 shadow-lg shadow-sky-500/30"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
