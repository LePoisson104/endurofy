import type { WorkoutProgram } from "../my-programs/page";

// Sample workout programs
export const sampleWorkoutPrograms: WorkoutProgram[] = [
  {
    id: "1",
    name: "Beginner Strength Program",
    description: "A simple 3-day full body program for beginners",
    createdAt: "2023-04-10T12:00:00Z",
    days: [
      {
        day: "monday",
        title: "Chest Day",
        exercises: [
          { id: "e1", name: "Squat", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e2", name: "Bench Press", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e3", name: "Bent Over Row", sets: 3, minReps: 8, maxReps: 12 },
        ],
      },
      {
        day: "wednesday",
        title: "Back Day",
        exercises: [
          { id: "e4", name: "Deadlift", sets: 3, minReps: 6, maxReps: 10 },
          {
            id: "e5",
            name: "Overhead Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          { id: "e6", name: "Pull-ups", sets: 3, minReps: 5, maxReps: 10 },
        ],
      },
      {
        day: "friday",
        title: "Legs Day",
        exercises: [
          { id: "e7", name: "Squat", sets: 3, minReps: 8, maxReps: 12 },
          {
            id: "e8",
            name: "Incline Bench Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          { id: "e9", name: "Barbell Row", sets: 3, minReps: 8, maxReps: 12 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Push Pull Legs",
    description: "Classic 6-day PPL split for intermediate lifters",
    createdAt: "2023-05-15T14:30:00Z",
    days: [
      {
        day: "monday",
        title: "Push Day",
        exercises: [
          { id: "e10", name: "Bench Press", sets: 4, minReps: 6, maxReps: 10 },
          {
            id: "e11",
            name: "Overhead Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          {
            id: "e12",
            name: "Incline Dumbbell Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          {
            id: "e13",
            name: "Tricep Pushdowns",
            sets: 3,
            minReps: 10,
            maxReps: 15,
          },
        ],
      },
      {
        day: "tuesday",
        title: "Pull Day",
        exercises: [
          { id: "e14", name: "Deadlift", sets: 3, minReps: 5, maxReps: 8 },
          { id: "e15", name: "Pull-ups", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e16", name: "Barbell Row", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e17", name: "Bicep Curls", sets: 3, minReps: 10, maxReps: 15 },
        ],
      },
      {
        day: "wednesday",
        title: "Legs Day",
        exercises: [
          { id: "e18", name: "Squat", sets: 4, minReps: 6, maxReps: 10 },
          {
            id: "e19",
            name: "Romanian Deadlift",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          { id: "e20", name: "Leg Press", sets: 3, minReps: 10, maxReps: 15 },
          { id: "e21", name: "Calf Raises", sets: 4, minReps: 12, maxReps: 20 },
        ],
      },
      {
        day: "thursday",
        title: "Push Day",
        exercises: [
          {
            id: "e22",
            name: "Incline Bench Press",
            sets: 4,
            minReps: 6,
            maxReps: 10,
          },
          {
            id: "e23",
            name: "Dumbbell Shoulder Press",
            sets: 3,
            minReps: 8,
            maxReps: 12,
          },
          { id: "e24", name: "Cable Flyes", sets: 3, minReps: 10, maxReps: 15 },
          {
            id: "e25",
            name: "Skull Crushers",
            sets: 3,
            minReps: 10,
            maxReps: 15,
          },
        ],
      },
      {
        day: "friday",
        title: "Pull Day",
        exercises: [
          { id: "e26", name: "Barbell Row", sets: 4, minReps: 6, maxReps: 10 },
          { id: "e27", name: "Lat Pulldown", sets: 3, minReps: 8, maxReps: 12 },
          { id: "e28", name: "Face Pulls", sets: 3, minReps: 12, maxReps: 15 },
          {
            id: "e29",
            name: "Hammer Curls",
            sets: 3,
            minReps: 10,
            maxReps: 15,
          },
        ],
      },
      {
        day: "saturday",
        title: "Legs Day",
        exercises: [
          { id: "e30", name: "Front Squat", sets: 4, minReps: 6, maxReps: 10 },
          { id: "e31", name: "Lunges", sets: 3, minReps: 8, maxReps: 12 },
          {
            id: "e32",
            name: "Leg Extensions",
            sets: 3,
            minReps: 10,
            maxReps: 15,
          },
          {
            id: "e33",
            name: "Seated Calf Raises",
            sets: 4,
            minReps: 12,
            maxReps: 20,
          },
        ],
      },
    ],
  },
];
