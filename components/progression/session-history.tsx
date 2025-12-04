"use client";

import { useMemo } from "react";

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

export function SessionHistory({
  startDate,
  endDate,
  sessionsHistory,
}: {
  startDate: Date;
  endDate: Date;
  sessionsHistory: any;
}) {
  const orderedSessions = useMemo(() => {
    if (!sessionsHistory) return [];
    return [...sessionsHistory].sort(
      (a, b) =>
        new Date(a.workoutDate).getTime() - new Date(b.workoutDate).getTime()
    );
  }, [sessionsHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Session History
        </CardTitle>
        <CardDescription>
          {startDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}{" "}
          -{" "}
          {endDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {orderedSessions.map((session: any) => (
            <AccordionItem
              key={session.workoutLogId}
              value={session.workoutLogId}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-col w-full pr-4 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-sm">
                      {new Date(session.workoutDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        }
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs md:text-sm text-muted-foreground">
                    <span className="text-left">
                      <span className="font-medium text-foreground">
                        {session.sets.length}
                      </span>{" "}
                      sets
                    </span>
                    <span className="text-left">
                      Max:{" "}
                      <span className="font-medium text-foreground">
                        {session.maxWeight}{" "}
                        {session.weightUnit === "lb"
                          ? session.maxWeight <= 1
                            ? "lb"
                            : "lbs"
                          : "kg"}
                      </span>
                    </span>
                    <span className="text-left">
                      Avg:{" "}
                      <span className="font-medium text-foreground">
                        {session.averageWeight}{" "}
                        {session.weightUnit === "lb" ? "lbs" : "kg"}
                      </span>
                    </span>
                    <span className="text-left col-span-3 md:col-span-1">
                      Volume:{" "}
                      <span className="font-medium text-foreground">
                        {session.totalVolume.toLocaleString()}{" "}
                        {session.weightUnit === "lb"
                          ? session.totalVolume <= 1
                            ? "lb"
                            : "lbs"
                          : "kg"}
                      </span>
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-2">
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm font-semibold text-muted-foreground pb-2 border-b">
                    <span>Set</span>
                    <span>Reps</span>
                    <span>Weight</span>
                  </div>
                  {session.sets.map((set) => (
                    <div
                      key={set.setNumber}
                      className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm py-2 hover:bg-muted/50 rounded-md px-2 transition-colors"
                    >
                      <span className="font-medium">Set {set.setNumber}</span>
                      <span>{set.reps} reps</span>
                      <span className="font-medium">
                        {set.weight}{" "}
                        {session.weightUnit === "lb"
                          ? session.weight <= 1
                            ? "lb"
                            : "lbs"
                          : "kg"}
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
