"use client";

import { useState, useEffect } from "react";
import { getDayRange } from "@/helper/get-day-range";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { UnifiedAnalyticsOverview } from "@/components/analytics/unified-analytics-overview";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30day");
  const [startDate, setStartDate] = useState<Date | undefined>(
    getDayRange({ options: "30d" }).startDate || undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    getDayRange({ options: "30d" }).endDate || undefined
  );

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

  const handleReset = () => {
    setSelectedPeriod("30day");
    setStartDate(getDayRange({ options: "30d" }).startDate || undefined);
    setEndDate(getDayRange({ options: "30d" }).endDate || undefined);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Filters */}
      <AnalyticsFilters
        selectedPeriod={selectedPeriod}
        startDate={startDate}
        endDate={endDate}
        onPeriodChange={setSelectedPeriod}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={handleReset}
      />

      {/* Unified Overview */}
      <UnifiedAnalyticsOverview />
    </div>
  );
}
