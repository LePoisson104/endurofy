import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { convertDateFormat } from "@/helper/convert-date-format";
import {
  convertHeight,
  getHeightInFeetAndMeters,
} from "@/helper/weight-height-converter";
import { UserInfo } from "@/interfaces/user-interfaces";

interface PersonalInfoCardProps {
  userInfo: UserInfo;
}

export default function PersonalInfoCard({ userInfo }: PersonalInfoCardProps) {
  const age =
    new Date().getFullYear() -
    new Date(userInfo?.birth_date || "").getFullYear();
  const lastUpdated = convertDateFormat(
    userInfo?.user_profile_updated_at || ""
  );
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
            {userInfo?.birth_date
              ? format(new Date(userInfo?.birth_date), "PPP")
              : ""}
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
