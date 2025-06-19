"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkoutHistoryList } from "@/components/cards/workout-history-card";
import { WorkoutDetailView } from "./workout-detail-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListFilterPlus, Search } from "lucide-react";
import { WorkoutFiltersModal } from "@/components/modals/filters-modal";

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
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(
    null
  );
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

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

  // Handle workout selection for detail view
  const handleSelectWorkout = (workout: WorkoutLog) => {
    setSelectedWorkout(workout);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedWorkout(null);
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl">
        {!selectedWorkout ? (
          // Workout List View
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFiltersModalOpen(true)}
              >
                <ListFilterPlus className="w-4 h-4" />
                Filters
              </Button>
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Workout List */}
            <WorkoutHistoryList
              workouts={filteredLogs}
              onSelectWorkout={handleSelectWorkout}
            />
          </div>
        ) : (
          // Workout Detail View
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="gap-1 arrow-button"
            >
              <svg
                className="arrow-icon transform rotate-180 mr-2"
                viewBox="0 -3.5 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="arrow-icon__tip"
                  d="M8 15L14 8.5L8 2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  className="arrow-icon__line"
                  x1="13"
                  y1="8.5"
                  y2="8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Back to History
            </Button>

            {/* Workout Detail */}
            <WorkoutDetailView workout={selectedWorkout} />
          </div>
        )}
      </main>

      {/* Filters Modal */}
      <WorkoutFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
      />
    </div>
  );
}
