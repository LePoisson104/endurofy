"use client";
import React from "react";
import {
  getCurrentDate,
  getCurrentTime,
} from "@/helper/get-current-date-n-time";
import { useState, useEffect } from "react";

interface pageTitleProps {
  title: string;
  showCurrentDateAndTime?: boolean;
  subTitle?: string;
}

export default function PageTitle({
  title,
  showCurrentDateAndTime = true,
  subTitle,
}: pageTitleProps) {
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  useEffect(() => {
    setCurrentDate(getCurrentDate());
    setCurrentTime(getCurrentTime());
  }, []);

  return (
    <div className="flex flex-col">
      <div className="text-2xl font-bold">{title}</div>
      {showCurrentDateAndTime ? (
        <p className="text-sm text-muted-foreground">{`${currentDate} | ${currentTime}`}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{subTitle}</p>
      )}
    </div>
  );
}
