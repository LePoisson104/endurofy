"use client";

import { useState, useEffect, useMemo } from "react";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useSelector } from "react-redux";
import { ProgressionFiltersWrapper } from "@/components/progression/progression-filters-wrapper";
import { ProgressionStats } from "@/components/progression/progression-stats";
import { SessionHistory } from "@/components/progression/session-history";
import { VolumeChart } from "@/components/progression/volume-chart";
import { WeightChart } from "@/components/progression/weight-chart";
import {
  useGetPersonalRecordQuery,
  useGetWorkoutProgressionQuery,
} from "@/api/workout-progression/workout-progression-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import type {
  Exercise,
  WorkoutProgram,
} from "@/interfaces/workout-program-interfaces";
import { getDayRange } from "@/helper/get-day-range";
import { StatData } from "@/interfaces/progression-interfaces";
import {
  Award,
  ChartNoAxesColumn,
  TrendingUp,
  Target,
  FileX,
} from "lucide-react";
import WorkoutProgressionSkeleton from "@/components/skeletons/workout-progression-skeleton";

interface weightChartData {
  date: string;
  set1: number;
  set2: number;
  [key: string]: any;
}

const STORAGE_KEYS = {
  SELECTED_PROGRAM: "progression_selectedProgram",
  SELECTED_EXERCISE: "progression_selectedExercise",
  SELECTED_PERIOD: "progression_selectedPeriod",
};

export default function Progression() {
  const programs = useSelector(selectWorkoutProgram);
  const user = useSelector(selectCurrentUser);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [selectedPeriod, setSelectedPeriod] = useState("7day");
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    getDayRange({ options: "7day" }).startDate || undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    getDayRange({ options: "7day" }).endDate || undefined
  );
  const [statsData, setStatsData] = useState<StatData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: personalRecord, isLoading: isLoadingPersonalRecord } =
    useGetPersonalRecordQuery({
      userId: user?.user_id,
      programId: selectedProgram?.programId,
      exerciseId: selectedExercise?.exerciseId,
    });
  const { data: workoutProgression, isLoading: isLoadingWorkoutProgression } =
    useGetWorkoutProgressionQuery({
      userId: user?.user_id,
      programId: selectedProgram?.programId,
      exerciseId: selectedExercise?.exerciseId,
      startDate: startDate?.toISOString().split("T")[0],
      endDate: endDate?.toISOString().split("T")[0],
    });

  // Load persisted values on mount
  useEffect(() => {
    if (programs && programs.length > 0 && !isInitialized) {
      try {
        const savedProgramId = localStorage.getItem(
          STORAGE_KEYS.SELECTED_PROGRAM
        );
        const savedExerciseId = localStorage.getItem(
          STORAGE_KEYS.SELECTED_EXERCISE
        );
        const savedPeriod = localStorage.getItem(STORAGE_KEYS.SELECTED_PERIOD);

        let programToUse: WorkoutProgram | null = null;

        // Try to find saved program, fallback to active program
        if (savedProgramId) {
          programToUse =
            programs.find((p) => p.programId === savedProgramId) || null;
        }

        if (!programToUse) {
          programToUse =
            programs.find((program) => program.isActive === 1) || null;
        }

        if (programToUse) {
          const allExercises = programToUse.workoutDays.flatMap(
            (day) => day.exercises
          );
          setExercises(allExercises);
          setSelectedProgram(programToUse);

          // Try to find saved exercise
          if (savedExerciseId) {
            const exerciseToUse = allExercises.find(
              (ex) => ex.exerciseId === savedExerciseId
            );
            setSelectedExercise(
              exerciseToUse || (allExercises[0] as Exercise) || null
            );
          } else {
            setSelectedExercise((allExercises[0] as Exercise) || null);
          }
        }

        // Restore period
        if (savedPeriod) {
          setSelectedPeriod(savedPeriod);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading persisted values:", error);
        // Fallback to default behavior
        const activeProgram = programs.find(
          (program) => program.isActive === 1
        );
        if (activeProgram) {
          const allExercises = activeProgram.workoutDays.flatMap(
            (day) => day.exercises
          );
          setExercises(allExercises);
          setSelectedExercise((allExercises[0] as Exercise) || null);
          setSelectedProgram(activeProgram);
        }
        setIsInitialized(true);
      }
    }
  }, [programs, isInitialized]);

  // Persist selectedProgram
  useEffect(() => {
    if (isInitialized && selectedProgram) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_PROGRAM,
        selectedProgram.programId
      );
    }
  }, [selectedProgram, isInitialized]);

  // Persist selectedExercise
  useEffect(() => {
    if (isInitialized && selectedExercise) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_EXERCISE,
        selectedExercise.exerciseId
      );
    }
  }, [selectedExercise, isInitialized]);

  // Persist selectedPeriod
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PERIOD, selectedPeriod);
    }
  }, [selectedPeriod, isInitialized]);

  useEffect(() => {
    const newStats: StatData[] = [];

    if (personalRecord) {
      newStats.push({
        title: "Personal Record",
        value: `${personalRecord?.data?.weight} ${
          personalRecord?.data?.weightUnit === "lb" ? "lbs" : "kg"
        } x ${personalRecord?.data?.reps} ${
          personalRecord?.data?.reps === 1 ? "rep" : "reps"
        }`,
        change: `${(
          ((personalRecord?.data?.bestOneRepMax -
            personalRecord?.data?.initialOneRepMax) /
            personalRecord?.data?.initialOneRepMax) *
          100
        ).toFixed(2)}%`,
        trend:
          personalRecord?.data?.bestOneRepMax >=
          personalRecord?.data?.initialOneRepMax
            ? "up"
            : "down",
        icon: Award,
      });
    }

    if (workoutProgression) {
      newStats.push(
        {
          title: "Weight Increase",
          value: `${workoutProgression?.data?.stats?.weightIncrease} ${
            workoutProgression?.data?.stats?.weightUnit === "lb" ? "lbs" : "kg"
          }`,
          change: `${workoutProgression?.data?.stats?.weightIncrease} ${
            workoutProgression?.data?.stats?.weightUnit === "lb" ? "lbs" : "kg"
          }`,
          trend:
            workoutProgression?.data?.stats?.weightIncrease >= 0
              ? "up"
              : "down",
          icon: TrendingUp,
        },
        {
          title: "Total Volume",
          value: `${workoutProgression?.data?.stats?.totalVolume} ${
            workoutProgression?.data?.stats?.weightUnit === "lb" ? "lbs" : "kg"
          }`,
          change: "",
          trend: "null",
          icon: ChartNoAxesColumn,
        },
        {
          title: "Total Sets",
          value: `${workoutProgression?.data?.stats?.totalSets}`,
          change: "",
          trend: "null",
          icon: Target,
        }
      );
    }

    setStatsData(newStats);
  }, [personalRecord, workoutProgression]);

  useEffect(() => {
    if (selectedPeriod === "7day") {
      setStartDate(getDayRange({ options: "7d" }).startDate || undefined);
      setEndDate(getDayRange({ options: "7d" }).endDate || undefined);
    } else if (selectedPeriod === "14day") {
      setStartDate(getDayRange({ options: "14d" }).startDate || undefined);
      setEndDate(getDayRange({ options: "14d" }).endDate || undefined);
    } else if (selectedPeriod === "30day") {
      setStartDate(getDayRange({ options: "30d" }).startDate || undefined);
      setEndDate(getDayRange({ options: "30d" }).endDate || undefined);
    } else if (selectedPeriod === "90day") {
      setStartDate(getDayRange({ options: "90d" }).startDate || undefined);
      setEndDate(getDayRange({ options: "90d" }).endDate || undefined);
    } else if (selectedPeriod === "day range") {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [selectedPeriod]);

  // Group exercises by body part
  const exercisesByBodyPart = useMemo(() => {
    const grouped = exercises.reduce(
      (acc: Record<string, Exercise[]>, exercise: Exercise) => {
        const bodyPart = exercise.bodyPart || "Other";
        if (!acc[bodyPart]) {
          acc[bodyPart] = [];
        }
        acc[bodyPart].push(exercise);
        return acc;
      },
      {}
    );

    // Sort body parts alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((acc: Record<string, Exercise[]>, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  }, [exercises]);

  const weightChartData: weightChartData[] = useMemo(() => {
    if (!workoutProgression?.data?.weightProgression) return [];

    const grouped: Record<string, any> = {};

    workoutProgression.data.weightProgression.forEach((item: any) => {
      const dateKey = item.date.split("T")[0];

      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey };
      }

      grouped[dateKey][`set${item.setNumber}`] = Number(item.weight);
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [workoutProgression]);

  const volumeChartData: weightChartData[] = useMemo(() => {
    if (!workoutProgression?.data?.volumeProgression) return [];

    const grouped: Record<string, any> = {};

    workoutProgression.data.volumeProgression.forEach((sessionSets: any[]) => {
      sessionSets.forEach((set: any) => {
        const dateKey = set.date.split("T")[0];

        if (!grouped[dateKey]) {
          grouped[dateKey] = { date: dateKey };
        }

        grouped[dateKey][`set${set.setNumber}`] = set.volume;
      });
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [workoutProgression]);

  const handleReset = () => {
    if (programs) {
      const activeProgram = programs.find((program) => program.isActive === 1);

      if (activeProgram) {
        const allExercises = activeProgram.workoutDays.flatMap(
          (day) => day.exercises
        );
        setExercises(allExercises);
        setSelectedExercise((allExercises[0] as Exercise) || null);
        setSelectedProgram(activeProgram);
      }
    }
    setSelectedPeriod("7day");
    setStartDate(getDayRange({ options: "7day" }).startDate || undefined);
    setEndDate(getDayRange({ options: "7day" }).endDate || undefined);

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PROGRAM);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_EXERCISE);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_PERIOD);
  };

  if (isLoadingPersonalRecord && isLoadingWorkoutProgression) {
    return <WorkoutProgressionSkeleton />;
  }

  return (
    <div className="space-y-4">
      <ProgressionFiltersWrapper
        programs={programs}
        selectedProgram={selectedProgram || null}
        selectedExercise={selectedExercise}
        selectedPeriod={selectedPeriod}
        startDate={startDate}
        endDate={endDate}
        exercisesByBodyPart={exercisesByBodyPart}
        onProgramChange={(value) => {
          const newProgram =
            programs?.find((program) => program.programId === value) || null;
          setSelectedProgram(newProgram);

          if (newProgram) {
            const allExercises = newProgram.workoutDays.flatMap(
              (day) => day.exercises
            );
            setExercises(allExercises);
            setSelectedExercise((allExercises[0] as Exercise) || null);
          } else {
            setExercises([]);
            setSelectedExercise(null);
          }
        }}
        onExerciseChange={setSelectedExercise}
        onPeriodChange={setSelectedPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={handleReset}
      />
      {personalRecord?.data !== null && workoutProgression?.data !== null ? (
        <>
          <ProgressionStats statsData={statsData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WeightChart chartData={weightChartData} />
            <VolumeChart chartData={volumeChartData} />
          </div>
          <SessionHistory
            startDate={startDate || new Date()}
            endDate={endDate || new Date()}
            sessionsHistory={workoutProgression?.data?.sessionHistory}
          />
        </>
      ) : (
        <div className="flex flex-col gap-2 justify-center items-center w-full mt-4 border rounded-lg h-[400px] border-dashed text-muted-foreground">
          <FileX /> No Data
        </div>
      )}
    </div>
  );
}
