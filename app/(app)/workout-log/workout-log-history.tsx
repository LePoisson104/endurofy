"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { WorkoutLog } from "./page";

interface WorkoutLogHistoryProps {
  logs: WorkoutLog[];
  onDeleteLog: (logId: string) => void;
  onSelectDate: (date: Date) => void;
}

export function WorkoutLogHistory({
  logs,
  onDeleteLog,
  onSelectDate,
}: WorkoutLogHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter logs based on search query
  const filteredLogs = sortedLogs.filter(
    (log) =>
      log.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      format(parseISO(log.date), "MMMM d, yyyy")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatLogDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (logToDelete) {
      onDeleteLog(logToDelete);
      setLogToDelete(null);
    }
  };

  // Toggle expanded log
  const toggleExpandLog = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Workout History</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <h3 className="text-lg font-medium">No workout logs found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery
                ? "Try a different search term."
                : "Log your first workout to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleExpandLog(log.id)}
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="font-medium">
                        {formatLogDate(log.date)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {log.programName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {log.day}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogToDelete(log.id);
                      }}
                      className="h-8 w-8 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandLog(log.id);
                      }}
                    >
                      {expandedLog === log.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedLog === log.id && (
                  <div className="border-t p-4 ">
                    <div className="space-y-4">
                      {log.exercises.map((exercise: any) => (
                        <div
                          key={exercise.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <div className="text-sm text-slate-500">
                              {exercise.weights.some((w: number) => w > 0)
                                ? `${exercise.weights.join(" / ")} lbs`
                                : "Bodyweight"}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {exercise.completedReps.map(
                              (reps: number, index: number) => (
                                <div key={index} className="text-sm">
                                  <span className="text-slate-500">
                                    Set {index + 1}:
                                  </span>{" "}
                                  <span className="font-medium">
                                    {exercise.weights[index]} lbs × {reps} reps
                                  </span>
                                </div>
                              )
                            )}
                          </div>

                          {exercise.notes && (
                            <div className="text-sm text-slate-600 border-t pt-2 mt-2">
                              <span className="font-medium">Notes:</span>{" "}
                              {exercise.notes}
                            </div>
                          )}
                        </div>
                      ))}

                      {log.notes && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Workout Notes:</h4>
                          <p className="text-sm text-slate-600">{log.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => onSelectDate(parseISO(log.date))}
                        >
                          View/Edit This Log
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!logToDelete}
        onOpenChange={(open) => !open && setLogToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout log? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
