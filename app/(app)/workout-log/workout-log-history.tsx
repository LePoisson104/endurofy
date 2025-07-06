"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";

import type { WorkoutLog } from "@/interfaces/workout-log-interfaces";
import type { WorkoutProgram } from "@/interfaces/workout-program-interfaces";

interface WorkoutLogHistoryProps {
  selectedProgram: WorkoutProgram;
}

export function WorkoutLogHistory({ selectedProgram }: WorkoutLogHistoryProps) {
  const user = useSelector(selectCurrentUser);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(
    null
  );
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Infinite scroll state
  const [allWorkoutLogs, setAllWorkoutLogs] = useState<WorkoutLog[]>([]);

  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [fetchFromBackend, setFetchFromBackend] = useState(false);
  const [fetchFromBackendPagination, setFetchFromBackendPagination] =
    useState(true);
  const [limit, setLimit] = useState(localStorage.getItem("limit") || "10");
  const [isClearingFilters, setIsClearingFilters] = useState(false);

  const { data: workoutLogsData, isLoading: isLoadingWorkoutLogs } =
    useGetWorkoutLogQuery(
      {
        userId: user?.user_id,
        programId: selectedProgram?.programId,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
      },
      {
        skip: !fetchFromBackend || !startDate || !endDate || !user?.user_id,
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
      limit: limit,
    },
    {
      skip: !selectedProgram || !user?.user_id || !fetchFromBackendPagination,
    }
  );

  // Use useMemo for date filtering to avoid infinite loops
  const dateFilteredLogs = useMemo(() => {
    if (!allWorkoutLogs.length) {
      return [];
    }

    // If no date filters, return all logs
    if (!startDate || !endDate) {
      return allWorkoutLogs;
    }

    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");

    const doesStartLogExist = allWorkoutLogs.find(
      (log) => log.workoutDate.split("T")[0] === startDateStr
    );
    const doesEndLogExist = allWorkoutLogs.find(
      (log) => log.workoutDate.split("T")[0] === endDateStr
    );

    if (startDateStr === endDateStr && doesStartLogExist && doesEndLogExist) {
      return allWorkoutLogs.filter((log) => {
        const logDate = log.workoutDate.split("T")[0];
        return logDate === startDateStr;
      });
    }

    if (!doesStartLogExist || !doesEndLogExist) {
      setFetchFromBackend(true);
      setFetchFromBackendPagination(false);
    }

    if (workoutLogsData) {
      return workoutLogsData.data;
    }

    return allWorkoutLogs.filter((log) => {
      const logDate = log.workoutDate.split("T")[0];
      return logDate >= startDateStr && logDate <= endDateStr;
    });
  }, [
    allWorkoutLogs,
    fetchFromBackend,
    fetchFromBackendPagination,
    workoutLogsData,
    startDate,
    endDate,
  ]);

  // Apply search filter to date-filtered logs
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) {
      return dateFilteredLogs;
    }

    const query = searchQuery.toLowerCase();
    return dateFilteredLogs.filter(
      (log: WorkoutLog) =>
        log.title.toLowerCase().includes(query) ||
        format(parseISO(log.workoutDate), "MMMM d, yyyy")
          .toLowerCase()
          .includes(query) ||
        log.dayId.toLowerCase().includes(query)
    );
  }, [dateFilteredLogs, searchQuery]);

  useEffect(() => {
    const date = searchParams.get("date");
    const tab = searchParams.get("tab");
    const currentTab = localStorage.getItem("selectedTab");

    if (date && tab && currentTab === "history") {
      // You need to use router to modify URL params, not searchParams directly
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("date");
      newSearchParams.delete("tab");

      // Update the URL without the parameters
      router.replace(`/workout-log?${newSearchParams.toString()}`);
    }
  }, [searchParams, router]);

  // Reset infinite scroll state when program changes (not dates!)
  useEffect(() => {
    setAllWorkoutLogs([]);
    setHasMoreData(true);
    setIsLoadingMore(false);
    setIsInitialLoad(true);
    setOffset(0);
    localStorage.removeItem("limit");
  }, [selectedProgram]); // Only reset on program change

  useEffect(() => {
    if (workoutLogsData?.data.length > 0) {
      setAllWorkoutLogs(
        workoutLogsData.data.toSorted((a: WorkoutLog, b: WorkoutLog) => {
          const aDate = new Date(a.workoutDate);
          const bDate = new Date(b.workoutDate);
          return bDate.getTime() - aDate.getTime();
        })
      );
      localStorage.setItem(
        "limit",
        workoutLogsData?.data.length > 0
          ? workoutLogsData?.data.length.toString()
          : "10"
      );
    }
  }, [workoutLogsData]);

  // Handle new data from pagination
  useEffect(() => {
    if (workoutLogPaginationData && !isLoadingWorkoutLogPagination) {
      const newData = workoutLogPaginationData.data.workoutLogsData;

      // Pagination load - merge data, replacing existing logs with updated ones
      setAllWorkoutLogs((prev) => {
        // If this is initial load (offset 0) or clearing filters, replace all data
        if (offset === 0 || isClearingFilters) {
          return [...newData].sort((a: WorkoutLog, b: WorkoutLog) => {
            const aDate = new Date(a.workoutDate);
            const bDate = new Date(b.workoutDate);
            return bDate.getTime() - aDate.getTime();
          });
        }

        // For pagination (offset > 0), merge with existing data
        const logMap = new Map(
          prev.map((log: WorkoutLog) => [log.workoutLogId, log])
        );

        // Add or replace logs from new data
        newData.forEach((log: WorkoutLog) => {
          logMap.set(log.workoutLogId, log);
        });

        // Convert back to array and sort by date (newest first)
        const updatedLogs = Array.from(logMap.values()).sort(
          (a: WorkoutLog, b: WorkoutLog) => {
            const aDate = new Date(a.workoutDate);
            const bDate = new Date(b.workoutDate);
            return bDate.getTime() - aDate.getTime();
          }
        );

        return updatedLogs;
      });

      localStorage.setItem(
        "limit",
        allWorkoutLogs.length + newData.length > 0
          ? (allWorkoutLogs.length + newData.length).toString()
          : "10"
      );
      setHasMoreData(workoutLogPaginationData.data.hasMore);
      setIsLoadingMore(false);
      setIsInitialLoad(false);
      setIsClearingFilters(false); // Reset clearing filters state
    }
  }, [
    workoutLogPaginationData,
    isLoadingWorkoutLogPagination,
    isClearingFilters,
  ]);

  // Handle URL parameters for workout persistence and update selectedWorkout with fresh data
  useEffect(() => {
    const workoutId = searchParams.get("workoutId");

    if (workoutId && allWorkoutLogs.length > 0) {
      const workout = allWorkoutLogs.find(
        (log: WorkoutLog) => log.workoutLogId === workoutId
      );

      if (workout) {
        setSelectedWorkout(workout);
      } else {
        handleBackToList();
      }
    } else if (
      workoutId &&
      allWorkoutLogs.length === 0 &&
      !isInitialLoad &&
      !isLoadingWorkoutLogPagination
    ) {
      // Only call handleBackToList if data has actually been loaded (not initial state)
      handleBackToList();
    } else if (!workoutId && selectedWorkout) {
      setSelectedWorkout(null);
    }
  }, [
    allWorkoutLogs,
    searchParams,
    isInitialLoad,
    isLoadingWorkoutLogPagination,
  ]);

  // Infinite scroll callback
  const loadMoreWorkouts = useCallback(() => {
    if (isLoadingMore || !hasMoreData || isFetchingWorkoutLogPagination) {
      return;
    }
    setIsLoadingMore(true);
    // Calculate next offset based on current data length
    const nextOffset = allWorkoutLogs.length;
    setOffset(nextOffset);
  }, [
    isLoadingMore,
    hasMoreData,
    isFetchingWorkoutLogPagination,
    allWorkoutLogs.length,
  ]);

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

  // Clear filters function
  const clearDateFilters = () => {
    setIsClearingFilters(true); // Signal that we're clearing filters
    setStartDate(undefined);
    setEndDate(undefined);
    setFetchFromBackend(false);
    setFetchFromBackendPagination(true);
    setOffset(0);
    setHasMoreData(true);
    setIsLoadingMore(false);
    setIsInitialLoad(true);
    setLimit("10"); // Reset to default limit
    localStorage.setItem("limit", "10"); // Reset localStorage limit

    // Don't clear allWorkoutLogs immediately - keep existing data until new data arrives
  };

  // Check if we should show detail view (either selectedWorkout exists or workoutId in URL)
  const workoutId = searchParams.get("workoutId");
  const shouldShowDetailView = selectedWorkout || workoutId;

  // Check if filters are active
  const hasActiveFilters = startDate || endDate;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl">
        {!shouldShowDetailView ? (
          // Workout List View
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className={`flex gap-2 ${isMobile ? "flex-col" : "flex-row"}`}>
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={() => setIsFiltersModalOpen(true)}
                >
                  <ListFilterPlus className="w-4 h-4" />
                  Filters
                </Button>

                {/* Clear filters button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearDateFilters}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

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

            {/* Filter status */}
            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground">
                {startDate && endDate && (
                  <span className="ml-2">
                    {filteredLogs.length} workouts from{" "}
                    {format(startDate, "MMM d, yyyy")} to{" "}
                    {format(endDate, "MMM d, yyyy")}
                  </span>
                )}
              </div>
            )}

            {/* Workout List */}
            <WorkoutHistoryList
              workouts={filteredLogs} // Pass filtered logs
              onSelectWorkout={handleSelectWorkout}
              isLoading={isLoadingWorkoutLogPagination || isClearingFilters}
              isFetching={isFetchingWorkoutLogPagination}
              onLoadMore={loadMoreWorkouts}
              hasMoreData={hasMoreData && !hasActiveFilters} // Disable load more when filtering
              isInitialLoad={isInitialLoad || isClearingFilters}
            />
          </div>
        ) : (
          // Workout Detail View
          <div className="space-y-6">
            {/* Back Button */}

            {/* Workout Detail */}
            <WorkoutDetailView
              workoutLogType={
                selectedProgram?.programType === "manual" ? "manual" : "program"
              }
              workout={selectedWorkout}
              isLoading={isLoadingWorkoutLogs || isLoadingWorkoutLogPagination}
              handleBackToList={handleBackToList}
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
        handleClearDateFilters={clearDateFilters}
      />
    </div>
  );
}
