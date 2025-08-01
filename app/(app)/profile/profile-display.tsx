import PersonalInfoCard from "./personal-info-card";
import WeightBMICard from "./weight-bmi-card";
import MetabolicRateCard from "./metabolic-rate-card";
import { UserInfo } from "@/interfaces/user-interfaces";

interface ProfileDisplayProps {
  userInfo: UserInfo;
}

export default function ProfileDisplay({ userInfo }: ProfileDisplayProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PersonalInfoCard userInfo={userInfo} />
      <WeightBMICard userInfo={userInfo} />
      <MetabolicRateCard userInfo={userInfo} />
    </div>
  );
}
