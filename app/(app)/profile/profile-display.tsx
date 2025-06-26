"use client";

import PersonalInfoCard from "./personal-info-card";
import WeightBMICard from "./weight-bmi-card";
import MetabolicRateCard from "./metabolic-rate-card";

export default function ProfileDisplay() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PersonalInfoCard />
      <WeightBMICard />
      <MetabolicRateCard />
    </div>
  );
}
