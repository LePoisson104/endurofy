"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Set {
  setNumber: number;
  reps: number;
  weight: number;
  change: number;
}

interface Session {
  id: string;
  date: string;
  totalSets: number;
  maxWeight: number;
  avgWeight: number;
  totalVolume: number;
  totalReps: number;
  change: number;
  sets: Set[];
}

// Dummy data
const SESSIONS: Session[] = [
  {
    id: "session-1",
    date: "Nov 18, 2025",
    totalSets: 4,
    maxWeight: 100,
    avgWeight: 92.5,
    totalVolume: 3700,
    totalReps: 40,
    change: 5.2,
    sets: [
      { setNumber: 1, reps: 10, weight: 80, change: 0 },
      { setNumber: 2, reps: 10, weight: 90, change: 12.5 },
      { setNumber: 3, reps: 10, weight: 100, change: 11.1 },
      { setNumber: 4, reps: 10, weight: 100, change: 0 },
    ],
  },
  {
    id: "session-2",
    date: "Nov 15, 2025",
    totalSets: 4,
    maxWeight: 95,
    avgWeight: 87.5,
    totalVolume: 3500,
    totalReps: 40,
    change: 2.9,
    sets: [
      { setNumber: 1, reps: 10, weight: 75, change: 0 },
      { setNumber: 2, reps: 10, weight: 85, change: 13.3 },
      { setNumber: 3, reps: 10, weight: 95, change: 11.8 },
      { setNumber: 4, reps: 10, weight: 95, change: 0 },
    ],
  },
  {
    id: "session-3",
    date: "Nov 12, 2025",
    totalSets: 4,
    maxWeight: 92.5,
    avgWeight: 85,
    totalVolume: 3400,
    totalReps: 40,
    change: -1.4,
    sets: [
      { setNumber: 1, reps: 10, weight: 75, change: 0 },
      { setNumber: 2, reps: 10, weight: 82.5, change: 10 },
      { setNumber: 3, reps: 10, weight: 92.5, change: 12.1 },
      { setNumber: 4, reps: 10, weight: 90, change: -2.7 },
    ],
  },
  {
    id: "session-4",
    date: "Nov 9, 2025",
    totalSets: 4,
    maxWeight: 90,
    avgWeight: 83.75,
    totalVolume: 3350,
    totalReps: 40,
    change: 4.7,
    sets: [
      { setNumber: 1, reps: 10, weight: 70, change: 0 },
      { setNumber: 2, reps: 10, weight: 80, change: 14.3 },
      { setNumber: 3, reps: 10, weight: 90, change: 12.5 },
      { setNumber: 4, reps: 10, weight: 95, change: 5.6 },
    ],
  },
  {
    id: "session-5",
    date: "Nov 6, 2025",
    totalSets: 3,
    maxWeight: 85,
    avgWeight: 78.3,
    totalVolume: 2350,
    totalReps: 30,
    change: 0,
    sets: [
      { setNumber: 1, reps: 10, weight: 70, change: 0 },
      { setNumber: 2, reps: 10, weight: 80, change: 14.3 },
      { setNumber: 3, reps: 10, weight: 85, change: 6.3 },
    ],
  },
];

export function SessionHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Session History
        </CardTitle>
        <CardDescription>January - June 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {SESSIONS.map((session) => (
            <AccordionItem key={session.id} value={session.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-col w-full pr-4 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm md:text-base">
                      {session.date}
                    </span>
                    <Badge
                      variant={session.change >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {session.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {session.change >= 0 ? "+" : ""}
                      {session.change}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs md:text-sm text-muted-foreground">
                    <span className="text-left">
                      <span className="font-medium text-foreground">
                        {session.totalSets}
                      </span>{" "}
                      sets
                    </span>
                    <span className="text-left">
                      <span className="font-medium text-foreground">
                        {session.totalReps}
                      </span>{" "}
                      reps
                    </span>
                    <span className="text-left">
                      Max:{" "}
                      <span className="font-medium text-foreground">
                        {session.maxWeight}kg
                      </span>
                    </span>
                    <span className="text-left">
                      Avg:{" "}
                      <span className="font-medium text-foreground">
                        {session.avgWeight}kg
                      </span>
                    </span>
                    <span className="text-left col-span-2 md:col-span-1">
                      Volume:{" "}
                      <span className="font-medium text-foreground">
                        {session.totalVolume.toLocaleString()}kg
                      </span>
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-2">
                  <div className="grid grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm font-semibold text-muted-foreground pb-2 border-b">
                    <span>Set</span>
                    <span>Reps</span>
                    <span>Weight</span>
                    <span>Change</span>
                  </div>
                  {session.sets.map((set) => (
                    <div
                      key={set.setNumber}
                      className="grid grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm py-2 hover:bg-muted/50 rounded-md px-2 transition-colors"
                    >
                      <span className="font-medium">Set {set.setNumber}</span>
                      <span>{set.reps} reps</span>
                      <span className="font-medium">{set.weight}kg</span>
                      <span
                        className={`flex items-center gap-1 ${
                          set.change > 0
                            ? "text-green-500"
                            : set.change < 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {set.change > 0 && <TrendingUp className="h-3 w-3" />}
                        {set.change < 0 && <TrendingDown className="h-3 w-3" />}
                        {set.change > 0 ? "+" : ""}
                        {set.change}%
                      </span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
