"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

export function NotificationSettings() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Manage your mobile and desktop push notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row justify-between"
              } items-start gap-4`}
            >
              <div className="space-y-1">
                <Label htmlFor="push-all" className="text-base">
                  All notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable all push notifications.
                </p>
              </div>
              <Switch id="push-all" defaultChecked />
            </div>

            <Separator />

            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row justify-between"
              } items-start gap-4`}
            >
              <div className="space-y-1">
                <Label htmlFor="push-reminders" className="text-base">
                  Weight Log Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notify me to log my daily weight.
                </p>
              </div>
              <Switch id="push-reminders" defaultChecked />
            </div>

            <Separator />

            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row justify-between"
              } items-start gap-4`}
            >
              <div className="space-y-1">
                <Label htmlFor="push-reminders" className="text-base">
                  Workout Log Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notify me to log my workouts.
                </p>
              </div>
              <Switch id="push-reminders" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
