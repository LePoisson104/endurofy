"use client";

import { useState, useEffect, useMemo } from "react";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useSelector } from "react-redux";
import { ProgressionFiltersWrapper } from "@/components/progression/progression-filters-wrapper";
import { ProgressionStats } from "@/components/progression/progression-stats";
import { SessionHistory } from "@/components/progression/session-history";
import { VolumeChart } from "@/components/progression/volume-chart";
import { WeightChart } from "@/components/progression/weight-chart";

import type { Exercise } from "@/interfaces/workout-program-interfaces";

export default function Progression() {
  const programs = useSelector(selectWorkoutProgram);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (programs) {
      const activeProgram = programs.find((program) => program.isActive === 1);

      if (activeProgram) {
        const allExercises = activeProgram.workoutDays.flatMap(
          (day) => day.exercises
        );
        setExercises(allExercises);
        setSelectedExercise((allExercises[0] as Exercise) || null);
        setSelectedProgram(activeProgram.programName);
      }
    }
  }, [programs]);

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

  const handleReset = () => {
    if (programs) {
      const activeProgram = programs.find((program) => program.isActive === 1);

      if (activeProgram) {
        const allExercises = activeProgram.workoutDays.flatMap(
          (day) => day.exercises
        );
        setSelectedExercise((allExercises[0] as Exercise) || null);
        setSelectedProgram(activeProgram.programName);
      }
    }
    setSelectedPeriod("month");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="space-y-4">
      <ProgressionFiltersWrapper
        programs={programs}
        selectedProgram={selectedProgram}
        selectedExercise={selectedExercise}
        selectedPeriod={selectedPeriod}
        startDate={startDate}
        endDate={endDate}
        exercisesByBodyPart={exercisesByBodyPart}
        onProgramChange={setSelectedProgram}
        onExerciseChange={setSelectedExercise}
        onPeriodChange={setSelectedPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={handleReset}
      />

      <ProgressionStats />

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeightChart />
        <VolumeChart />
      </div>

      <SessionHistory />
    </div>
  );
}
