import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, LogOut, User } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUserInfo } from "@/api/user/user-slice";
import {
  convertHeight,
  getHeightInFeetAndMeters,
} from "@/helper/weight-height-converter";
import { calculateAge } from "@/helper/calculate-age";
import { Button } from "@/components/ui/button";
import LogoutBtn from "@/components/buttons/logout-btn";

interface ProfileHeaderProps {
  onEdit: () => void;
  isEditing: boolean;
}

export default function ProfileHeader({
  onEdit,
  isEditing,
}: ProfileHeaderProps) {
  const userInfo = useSelector(selectUserInfo);
  const age = calculateAge(userInfo?.birth_date || "");
  const destructive =
    "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60";

  const userHeight = getHeightInFeetAndMeters(
    userInfo?.height || 0,
    userInfo?.height_unit || ""
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-muted">
            <AvatarFallback className="bg-[#FE9496] text-white text-2xl font-bold">
              {userInfo?.first_name?.charAt(0).toUpperCase()}
              {userInfo?.last_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">
              {userInfo?.first_name?.charAt(0).toUpperCase()}
              {userInfo?.first_name?.slice(1)}{" "}
              {userInfo?.last_name?.charAt(0).toUpperCase()}
              {userInfo?.last_name?.slice(1)}
            </h1>
            <p className="text-muted-foreground">{userInfo?.email}</p>

            <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                <User className="h-3.5 w-3.5" />
                <span>{userInfo?.gender === "male" ? "Male" : "Female"}</span>
              </div>
              <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                Age: {age}
              </div>
              <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                Height: {userHeight} (
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
              </div>
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-center flex-col gap-4">
              <LogoutBtn
                className={`w-[120px] flex justify-center items-center py-[7px] font-medium gap-1 rounded-sm text-sm ${destructive}`}
                icon={<LogOut className="h-4 w-4" />}
              />
              <Button
                variant="secondary"
                className="gap-1.5 w-[120px]"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
