import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  convertHeight,
  getHeightInFeetAndMeters,
} from "@/helper/weight-height-converter";
import { UserInfo } from "@/interfaces/user-interfaces";
import { calculateAge } from "@/helper/calculate-age";
import { formatDateSafely } from "@/helper/parse-date-safely";
import { parseDateAndTimeSafely } from "@/helper/parse-date-safely";

interface PersonalInfoCardProps {
  userInfo: UserInfo;
}

export default function PersonalInfoCard({ userInfo }: PersonalInfoCardProps) {
  const age = calculateAge(userInfo?.birth_date || "");

  const lastUpdated = parseDateAndTimeSafely(
    userInfo?.user_profile_updated_at || ""
  );

  // console.log("lastUpdated", lastUpdated);

  const userHeight = getHeightInFeetAndMeters(
    userInfo?.height || 0,
    userInfo?.height_unit || ""
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Gender
            </h3>
            <p className="text-lg font-medium capitalize">{userInfo?.gender}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Age</h3>
            <p className="text-lg font-medium">{age} years old</p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Birthday
          </h3>
          <p className="text-lg font-medium">
            {formatDateSafely(userInfo?.birth_date || "")}
          </p>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Height</h3>
          <p className="text-lg font-medium">
            {userHeight} (
            {getHeightInFeetAndMeters(
              Math.round(
                convertHeight(
                  userInfo?.height || 0,
                  userInfo?.height_unit || ""
                )
              ),
              userInfo?.height_unit === "cm" ? "ft" : "cm"
            )}
            )
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
