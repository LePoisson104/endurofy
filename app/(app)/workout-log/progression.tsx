"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Target,
  Activity,
  Calendar,
  BarChart3,
} from "lucide-react";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { useSelector } from "react-redux";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Progression() {
  const isMobile = useIsMobile();
  const programs = useSelector(selectWorkoutProgram);

  const [exercises, setExercises] = useState<any>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    if (programs) {
      const activeProgram = programs.find((program) => program.isActive === 1);

      if (activeProgram) {
        const allExercises = activeProgram.workoutDays.flatMap(
          (day) => day.exercises
        );
        setExercises(allExercises);
        setSelectedExercise(allExercises[0].exerciseName);
        setSelectedProgram(activeProgram.programName);
      }
    }
  }, [programs]);

  // Group exercises by body part
  const exercisesByBodyPart = useMemo(() => {
    const grouped = exercises.reduce((acc: any, exercise: any) => {
      const bodyPart = exercise.bodyPart || "Other";
      if (!acc[bodyPart]) {
        acc[bodyPart] = [];
      }
      acc[bodyPart].push(exercise);
      return acc;
    }, {});

    // Sort body parts alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  }, [exercises]);

  const periods = [
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "day range", label: "Day Range" },
  ];

  const stats = [
    {
      title: "Total Volume",
      value: "45,280 kg",
      change: "+12.5%",
      trend: "up",
      icon: Dumbbell,
    },
    {
      title: "Workouts Completed",
      value: "24",
      change: "+8.3%",
      trend: "up",
      icon: Activity,
    },
    {
      title: "Max Weight",
      value: "120 kg",
      change: "+5.0%",
      trend: "up",
      icon: Target,
    },
    {
      title: "Avg. Session Time",
      value: "62 min",
      change: "-3.2%",
      trend: "down",
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex gap-2">
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger>
            <SelectValue placeholder={selectedProgram} />
          </SelectTrigger>
          <SelectContent>
            {programs?.map((program) => (
              <SelectItem key={program.programId} value={program.programName}>
                {program.programName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger>
            <SelectValue placeholder={selectedExercise} />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(exercisesByBodyPart).map((bodyPart) => (
              <SelectGroup key={bodyPart}>
                <SelectLabel>{bodyPart}</SelectLabel>
                {exercisesByBodyPart[bodyPart].map((exercise: any) => (
                  <SelectItem
                    key={exercise.exerciseId}
                    value={exercise.exerciseName}
                  >
                    {exercise.exerciseName}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4`}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent
                className={`${isMobile ? "p-4" : "px-6 py-3"} space-y-7`}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <p className="font-semibold">{stat.title}</p>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p
                    className={`text-sm ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            Progress Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center space-y-2">
              <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No Data Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
