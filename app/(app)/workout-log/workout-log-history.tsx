"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { WorkoutHistoryList } from "@/components/cards/workout-history-card";
import { WorkoutDetailView } from "./workout-detail-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListFilterPlus, Search } from "lucide-react";
import { WorkoutFiltersModal } from "@/components/modals/filters-modal";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useGetWorkoutLogQuery } from "@/api/workout-log/workout-log-api-slice";
import { startOfWeek, endOfWeek } from "date-fns";

import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";
import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";

interface WorkoutLogHistoryProps {
  selectedProgram: WorkoutProgram | null;
}

export function WorkoutLogHistory({ selectedProgram }: WorkoutLogHistoryProps) {
  const user = useSelector(selectCurrentUser);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(
    null
  );
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [endDate, setEndDate] = useState<Date>(
    endOfWeek(new Date(), { weekStartsOn: 0 })
  );

  const {
    data: workoutLogsData,
    isLoading: isLoadingWorkoutLogs,
    isFetching: isFetchingWorkoutLogs,
  } = useGetWorkoutLogQuery({
    userId: user?.user_id,
    programId: selectedProgram?.programId,
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd"),
  });

  // Handle URL parameters for workout persistence
  useEffect(() => {
    const workoutId = searchParams.get("workoutId");
    if (
      workoutId &&
      workoutLogsData &&
      !isLoadingWorkoutLogs &&
      !isFetchingWorkoutLogs
    ) {
      const logs = getLogsArray();
      const workout = logs.find((log) => log.workoutLogId === workoutId);
      if (workout && workout.workoutLogId !== selectedWorkout?.workoutLogId) {
        setSelectedWorkout(workout);
      }
    } else if (!workoutId && selectedWorkout) {
      // Clear selected workout when no workoutId in URL
      setSelectedWorkout(null);
    }
  }, [
    workoutLogsData,
    searchParams,
    selectedWorkout?.workoutLogId,
    isLoadingWorkoutLogs,
    isFetchingWorkoutLogs,
  ]);

  // Ensure logs is an array and sort by date (newest first)
  // Handle different data structures that might come from API
  const getLogsArray = (): WorkoutLog[] => {
    if (!workoutLogsData) return [];
    if (Array.isArray(workoutLogsData)) return workoutLogsData;
    if (
      typeof workoutLogsData === "object" &&
      workoutLogsData.data &&
      Array.isArray(workoutLogsData.data)
    )
      return workoutLogsData.data;
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
    // Update URL with workout ID for persistence
    const params = new URLSearchParams(searchParams.toString());
    params.set("workoutId", workout.workoutLogId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedWorkout(null);
    // Remove workout ID from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("workoutId");
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  // Check if we should show detail view (either selectedWorkout exists or workoutId in URL)
  const workoutId = searchParams.get("workoutId");
  const shouldShowDetailView = selectedWorkout || workoutId;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl">
        {!shouldShowDetailView ? (
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
              workouts={
                isLoadingWorkoutLogs || isFetchingWorkoutLogs
                  ? undefined
                  : filteredLogs
              }
              onSelectWorkout={handleSelectWorkout}
              isLoading={isLoadingWorkoutLogs || isFetchingWorkoutLogs}
              isFetching={isFetchingWorkoutLogs}
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
            <WorkoutDetailView
              workout={selectedWorkout}
              isLoading={
                isLoadingWorkoutLogs ||
                isFetchingWorkoutLogs ||
                !selectedWorkout
              }
            />
          </div>
        )}
      </main>

      {/* Filters Modal */}
      <WorkoutFiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        setHistoryStartDate={setStartDate}
        setHistoryEndDate={setEndDate}
      />
    </div>
  );
}
