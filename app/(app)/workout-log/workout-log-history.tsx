"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  useGetWorkoutLogQuery,
  useGetWokroutLogPaginationQuery,
} from "@/api/workout-log/workout-log-api-slice";
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
  const [currentStartDate, setCurrentStartDate] = useState<Date>(startDate);
  const [currentEndDate, setCurrentEndDate] = useState<Date>(endDate);

  // Infinite scroll state
  const [allWorkoutLogs, setAllWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    data: workoutLogsData,
    isLoading: isLoadingWorkoutLogs,
    isFetching: isFetchingWorkoutLogs,
  } = useGetWorkoutLogQuery(
    {
      userId: user?.user_id,
      programId: selectedProgram?.programId,
      startDate: format(currentStartDate, "yyyy-MM-dd"),
      endDate: format(currentEndDate, "yyyy-MM-dd"),
    },
    {
      skip: true,
    }
  );

  const {
    data: workoutLogPaginationData,
    isLoading: isLoadingWorkoutLogPagination,
    isFetching: isFetchingWorkoutLogPagination,
  } = useGetWokroutLogPaginationQuery(
    {
      userId: user?.user_id,
      programId: selectedProgram?.programId,
      offset: offset,
      limit: 10,
    },
    {
      skip: !selectedProgram?.programId || !user?.user_id,
    }
  );

  // Reset infinite scroll state when filters change
  useEffect(() => {
    setAllWorkoutLogs([]);
    setCurrentStartDate(startDate);
    setCurrentEndDate(endDate);
    setHasMoreData(true);
    setIsLoadingMore(false);
    setIsInitialLoad(true);
  }, [startDate, endDate, selectedProgram?.programId]);

  useEffect(() => {
    if (workoutLogPaginationData && !isLoadingWorkoutLogPagination) {
      setAllWorkoutLogs((prev) => [
        ...prev,
        ...workoutLogPaginationData.data.workoutLogsData,
      ]);
      setHasMoreData(workoutLogPaginationData.data.hasMore);
      setIsLoadingMore(false);
      setIsInitialLoad(false);
    }
  }, [workoutLogPaginationData, isLoadingWorkoutLogPagination]);

  // Handle URL parameters for workout persistence
  useEffect(() => {
    const workoutId = searchParams.get("workoutId");
    if (workoutId && allWorkoutLogs.length > 0) {
      const workout = allWorkoutLogs.find(
        (log) => log.workoutLogId === workoutId
      );
      if (workout && workout.workoutLogId !== selectedWorkout?.workoutLogId) {
        setSelectedWorkout(workout);
      }
    } else if (!workoutId && selectedWorkout) {
      setSelectedWorkout(null);
    }
  }, [allWorkoutLogs, searchParams, selectedWorkout?.workoutLogId]);

  // Infinite scroll callback
  const loadMoreWorkouts = useCallback(() => {
    if (isLoadingMore || !hasMoreData || isFetchingWorkoutLogPagination) {
      return;
    }
    setIsLoadingMore(true);
    setOffset(workoutLogPaginationData?.data?.nextOffset);
  }, [isLoadingMore, hasMoreData, isFetchingWorkoutLogPagination]);

  // Filter logs based on search query
  const filteredLogs = allWorkoutLogs.filter(
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
              workouts={filteredLogs}
              onSelectWorkout={handleSelectWorkout}
              isLoading={isLoadingWorkoutLogPagination}
              isFetching={isFetchingWorkoutLogPagination}
              onLoadMore={loadMoreWorkouts}
              hasMoreData={hasMoreData}
              isInitialLoad={isInitialLoad}
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
