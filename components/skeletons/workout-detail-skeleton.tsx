"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye } from "lucide-react";

export function WorkoutDetailSkeleton() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Workout Overview Skeleton */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 mt-1" />

          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mt-4">
            {/* Total Exercises */}
            <div className="shadow-none">
              <div className="p-4 text-center">
                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto mb-1" />
                <Skeleton className="h-5 w-8 mx-auto" />
              </div>
            </div>
            {/* Total Sets */}
            <div className="shadow-none">
              <div className="p-4 text-center">
                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto mb-1" />
                <Skeleton className="h-5 w-8 mx-auto" />
              </div>
            </div>
            {/* Volume */}
            <div className="shadow-none">
              <div className="p-4 text-center">
                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto mb-1" />
                <Skeleton className="h-5 w-12 mx-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show Previous Button Skeleton for Mobile */}
      {isMobile && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Show Previous
          </Button>
        </div>
      )}

      {/* Exercises Skeleton */}
      <Card>
        <CardContent>
          <div className="space-y-6">
            {/* Generate 3 exercise skeletons */}
            {Array.from({ length: 3 }).map((_, exerciseIndex) => (
              <div
                key={exerciseIndex}
                className={`${
                  isMobile ? "p-0 border-none" : "p-4 border rounded-lg"
                }`}
              >
                {/* Exercise Header */}
                <div
                  className={`flex mb-4 ${
                    isMobile
                      ? "flex-col justify-start"
                      : "items-center justify-between"
                  }`}
                >
                  <div>
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <div
                    className={`${isMobile ? "text-left mt-2" : "text-right"}`}
                  >
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                {/* Exercise Table Skeleton */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[60px] text-center">
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </TableHead>
                        <TableHead className="w-[100px] text-center">
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </TableHead>
                        <TableHead className="w-[80px] text-center">
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </TableHead>
                        <TableHead className="w-[80px] text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableHead>
                        {!isMobile && (
                          <>
                            <TableHead className="w-[100px] text-center">
                              <Skeleton className="h-4 w-20 mx-auto" />
                            </TableHead>
                            <TableHead className="w-[80px] text-center">
                              <Skeleton className="h-4 w-16 mx-auto" />
                            </TableHead>
                            <TableHead className="w-[80px] text-center">
                              <Skeleton className="h-4 w-16 mx-auto" />
                            </TableHead>
                            <TableHead className="w-[100px] text-center">
                              <Skeleton className="h-4 w-16 mx-auto" />
                            </TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Generate 4 set rows */}
                      {Array.from({ length: 4 }).map((_, setIndex) => (
                        <TableRow key={setIndex}>
                          <TableCell className="text-center">
                            <Skeleton className="h-4 w-4 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-4 w-8 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-4 w-6 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-4 w-6 mx-auto" />
                          </TableCell>
                          {!isMobile && (
                            <>
                              <TableCell className="text-center">
                                <Skeleton className="h-4 w-8 mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <Skeleton className="h-4 w-6 mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <Skeleton className="h-4 w-6 mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <Skeleton className="h-4 w-12 mx-auto" />
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Exercise Notes Skeleton (appears randomly) */}
                {exerciseIndex === 1 && (
                  <div className="mt-4 p-3 rounded-md bg-muted/30">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
