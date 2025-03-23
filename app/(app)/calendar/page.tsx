"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, addDays, isToday, parseISO } from "date-fns";
import { CheckCircle2, Clock, CheckSquare, AlertCircle } from "lucide-react";

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());

  // Generate the week days starting from the selected date's week
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mock tasks for the selected day
  const dailyTasks = [
    { id: 1, title: "Morning meditation", completed: true, priority: "medium" },
    { id: 2, title: "Team standup", completed: false, priority: "high" },
    { id: 3, title: "Workout session", completed: false, priority: "medium" },
    {
      id: 4,
      title: "Review project proposal",
      completed: false,
      priority: "high",
    },
    { id: 5, title: "Evening run", completed: false, priority: "low" },
  ];

  // Mock schedule for the week
  const weeklySchedule = [
    {
      id: 1,
      title: "Workout",
      startTime: "07:00",
      endTime: "08:00",
      days: [0, 2, 4], // Monday, Wednesday, Friday
      category: "fitness",
    },
    {
      id: 2,
      title: "Team Meeting",
      startTime: "09:00",
      endTime: "10:00",
      days: [1, 3], // Tuesday, Thursday
      category: "work",
    },
    {
      id: 3,
      title: "Lunch",
      startTime: "12:00",
      endTime: "13:00",
      days: [0, 1, 2, 3, 4], // Monday to Friday
      category: "personal",
    },
    {
      id: 4,
      title: "Project Planning",
      startTime: "14:00",
      endTime: "16:00",
      days: [1], // Tuesday
      category: "work",
    },
    {
      id: 5,
      title: "Family Time",
      startTime: "18:00",
      endTime: "19:30",
      days: [6], // Sunday
      category: "personal",
    },
    {
      id: 6,
      title: "Movie Night",
      startTime: "20:00",
      endTime: "22:00",
      days: [5], // Saturday
      category: "entertainment",
    },
  ];

  // Helper function to get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fitness":
        return "bg-green-100 border-green-500 text-green-700";
      case "work":
        return "bg-blue-100 border-blue-500 text-blue-700";
      case "personal":
        return "bg-purple-100 border-purple-500 text-purple-700";
      case "entertainment":
        return "bg-amber-100 border-amber-500 text-amber-700";
      default:
        return "bg-gray-100 border-gray-500 text-gray-700";
    }
  };

  // Helper function to get priority indicator
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "low":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  // Helper to format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}${
      minutes !== "00" ? ":" + minutes : ""
    }${hour >= 12 ? "pm" : "am"}`;
  };

  // Generate time slots for the day view (e.g., 7am to 10pm)
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7; // Start at 7am
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="flex min-h-screen">
      {/* Left Column - 1/4 width */}
      <div className="w-1/4 border-r p-4 flex flex-col">
        {/* Calendar */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => setDate(newDate || new Date())}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Daily Tasks */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Tasks for {format(date, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2 rounded border ${
                    task.completed
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckSquare
                      className={`h-5 w-5 ${
                        task.completed ? "text-green-500" : "text-gray-300"
                      }`}
                    />
                    <span
                      className={
                        task.completed ? "line-through text-gray-500" : ""
                      }
                    >
                      {task.title}
                    </span>
                  </div>
                  {getPriorityIndicator(task.priority)}
                </div>
              ))}

              {dailyTasks.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No tasks for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - 3/4 width */}
      <div className="w-3/4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`p-2 text-center font-medium ${
                    isToday(day) ? "bg-blue-50 rounded-t" : ""
                  }`}
                >
                  <div>{format(day, "EEE")}</div>
                  <div
                    className={`text-sm ${
                      isToday(day) ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {format(day, "MMM d")}
                  </div>
                </div>
              ))}

              {/* Time slots and events */}
              {weekDays.map((day, dayIndex) => (
                <div
                  key={`day-${dayIndex}`}
                  className="relative min-h-[600px] border-t"
                >
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <div
                      key={`time-${timeIndex}`}
                      className="h-12 border-b border-gray-100 relative"
                    >
                      {timeIndex === 0 && (
                        <div className="absolute -left-8 -top-3 text-xs text-gray-500 w-7 text-right">
                          {formatTime(timeSlot)}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Events for this day */}
                  {weeklySchedule
                    .filter((event) => event.days.includes(dayIndex))
                    .map((event) => {
                      const startHour = parseInt(event.startTime.split(":")[0]);
                      const endHour = parseInt(event.endTime.split(":")[0]);
                      const startMinutes = parseInt(
                        event.startTime.split(":")[1]
                      );
                      const endMinutes = parseInt(event.endTime.split(":")[1]);

                      // Calculate position and height
                      const startPosition =
                        (startHour - 7) * 48 + startMinutes * 0.8;
                      const duration =
                        (endHour - startHour) * 48 +
                        (endMinutes - startMinutes) * 0.8;

                      return (
                        <div
                          key={`event-${event.id}-${dayIndex}`}
                          className={`absolute left-0 right-0 mx-1 p-1 rounded border-l-4 shadow-sm text-xs ${getCategoryColor(
                            event.category
                          )}`}
                          style={{
                            top: `${startPosition}px`,
                            height: `${duration}px`,
                          }}
                        >
                          <div className="font-medium truncate">
                            {event.title}
                          </div>
                          <div className="flex items-center text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
