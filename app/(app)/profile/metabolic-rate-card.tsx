"use client";

import { useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { selectUserInfo } from "@/api/user/user-slice";
import { getActivityMultiplier } from "@/helper/constants/activity-level-contants";

export default function MetabolicRateCard() {
  const userInfo = useSelector(selectUserInfo);

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = useCallback(
    (bmr: number) => {
      return Math.round(
        bmr * getActivityMultiplier(userInfo?.activity_level || "")
      );
    },
    [userInfo?.activity_level]
  );

  const tdee = calculateTDEE(userInfo?.bmr || 0);

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Metabolic Rate & Activity</CardTitle>
        <CardDescription>
          Your energy expenditure based on your metrics and activity level
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Basal Metabolic Rate (BMR)
              </h3>
              <p className="text-3xl font-bold mt-1">
                {userInfo?.bmr} calories/day
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The number of calories your body needs to maintain basic
                functions at rest
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Activity Level
              </h3>
              <p className="text-lg font-medium capitalize mt-1">
                {userInfo?.activity_level?.includes("_")
                  ? userInfo?.activity_level?.replace("_", " ")
                  : userInfo?.activity_level}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {userInfo?.activity_level === "sedentary" &&
                  "Little or no exercise"}
                {userInfo?.activity_level === "lightly_active" &&
                  "Light exercise 1-3 days/week"}
                {userInfo?.activity_level === "moderately_active" &&
                  "Moderate exercise 4-5 days/week"}
                {userInfo?.activity_level === "very_active" &&
                  "Intense exercise 6-7 days/week"}
                {userInfo?.activity_level === "extra_active" &&
                  "Very intensive exercise, physical job or twice daily training"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Daily Energy Expenditure (TDEE)
              </h3>
              <p className="text-3xl font-bold mt-1">{tdee} calories/day</p>
              <p className="text-sm text-muted-foreground mt-1">
                The total calories you burn each day based on your BMR and
                activity level
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Weight Management
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-sm font-medium">
                    To Lose Weight ~{" "}
                    {userInfo?.starting_weight_unit === "lb"
                      ? "1lb/week"
                      : "0.5kg/week"}
                  </p>
                  <p className="text-lg font-bold">{tdee - 500} cal/day</p>
                  <p className="text-xs text-muted-foreground">
                    500 calorie deficit
                  </p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-sm font-medium">
                    To Gain Weight ~{" "}
                    {userInfo?.starting_weight_unit === "lb"
                      ? "1lb/week"
                      : "0.5kg/week"}
                  </p>
                  <p className="text-lg font-bold">{tdee + 500} cal/day</p>
                  <p className="text-xs text-muted-foreground">
                    500 calorie surplus
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
