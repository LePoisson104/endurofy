"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { selectUserInfo } from "@/api/user/user-slice";
import { convertWeight } from "@/helper/weight-height-converter";
import BMIIndicator from "@/components/global/bmi-indicator";

export default function WeightBMICard() {
  const userInfo = useSelector(selectUserInfo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight & BMI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Current Weight
            </h3>
            <p className="text-lg font-medium">
              {Number(userInfo?.current_weight)} {userInfo?.current_weight_unit}{" "}
              (
              {convertWeight(
                Number(userInfo?.current_weight || 0),
                userInfo?.current_weight_unit || ""
              )}{" "}
              {userInfo?.current_weight_unit === "lb" ? "kg" : "lbs"})
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Goal Weight
            </h3>
            <p className="text-lg font-medium">
              {Number(userInfo?.weight_goal)} {userInfo?.weight_goal_unit} (
              {convertWeight(
                Number(userInfo?.weight_goal || 0),
                userInfo?.weight_goal_unit || ""
              )}{" "}
              {userInfo?.weight_goal_unit === "lb" ? "kg" : "lbs"})
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">
              BMI (Body Mass Index)
            </h3>
            <span
              className={`text-sm font-medium ${
                userInfo?.bmi_category_color || ""
              }`}
            >
              {userInfo?.bmi_category || ""}
            </span>
          </div>
          <p className="text-3xl font-bold mt-1">{userInfo?.bmi || 0}</p>

          {/* BMI Scale Visualization */}
          <div className="mt-4">
            <BMIIndicator
              bmi={userInfo?.bmi || 0}
              bmiCategory={userInfo?.bmi_category || ""}
              showLabels={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
