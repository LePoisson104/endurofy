"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkoutHistoryList } from "@/components/cards/workout-history-card";
import { WorkoutHistoryStats } from "@/components/cards/workout-stats-card";
import { WorkoutDetailModal } from "@/components/modals/workout-log-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListFilterPlus } from "lucide-react";

import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";

interface WorkoutLogHistoryProps {
  logs: WorkoutLog[] | any;
  onDeleteLog: (logId: string) => void;
  onSelectDate: (date: Date) => void;
}

export function WorkoutLogHistory({
  logs,
  onDeleteLog,
  onSelectDate,
}: WorkoutLogHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(
    null
  );
  const isMobile = useIsMobile();

  // Ensure logs is an array and sort by date (newest first)
  // Handle different data structures that might come from API
  const getLogsArray = (): WorkoutLog[] => {
    if (!logs) return [];
    if (Array.isArray(logs)) return logs;
    if (typeof logs === "object" && logs.data && Array.isArray(logs.data))
      return logs.data;
    return [];
  };

  const sortedLogs = [...getLogsArray()].sort(
    (a: WorkoutLog, b: WorkoutLog) =>
      new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime()
  );

  // Filter logs based on search query
  const filteredLogs = sortedLogs.filter(
    (log: WorkoutLog) =>
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      format(parseISO(log.workoutDate), "MMMM d, yyyy")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      log.dayId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatLogDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (logToDelete) {
      onDeleteLog(logToDelete);
      setLogToDelete(null);
    }
  };

  // Toggle expanded log
  const toggleExpandLog = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  // Handle workout selection for modal
  const handleSelectWorkout = (workout: WorkoutLog) => {
    setSelectedWorkout(workout);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedWorkout(null);
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <WorkoutHistoryStats workouts={logs} />
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ListFilterPlus className="w-4 h-4" />
              Filter
            </Button>
            <Input placeholder="Search workouts" />
          </div>
          <WorkoutHistoryList
            workouts={logs}
            onSelectWorkout={handleSelectWorkout}
          />
        </div>
      </main>

      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
