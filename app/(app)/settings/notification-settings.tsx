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
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function NotificationSettings() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Manage the emails you receive from us.
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
                <Label htmlFor="marketing" className="text-base">
                  Marketing emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about new products, features, and more.
                </p>
              </div>
              <Switch id="marketing" defaultChecked />
            </div>

            <Separator />

            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row justify-between"
              } items-start gap-4`}
            >
              <div className="space-y-1">
                <Label htmlFor="social" className="text-base">
                  Social notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails for friend requests, follows, and more.
                </p>
              </div>
              <Switch id="social" defaultChecked />
            </div>

            <Separator />

            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row justify-between"
              } items-start gap-4`}
            >
              <div className="space-y-1">
                <Label htmlFor="security" className="text-base">
                  Security emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about your account activity and security.
                </p>
              </div>
              <Switch id="security" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

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
                <Label htmlFor="push-mentions" className="text-base">
                  Mentions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notify when someone mentions you in a comment, post, or story.
                </p>
              </div>
              <Switch id="push-mentions" defaultChecked />
            </div>

            <Separator />

            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row justify-between"
              } items-start gap-4`}
            >
              <div className="space-y-1">
                <Label htmlFor="push-reminders" className="text-base">
                  Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notify about upcoming events, tasks, and reminders.
                </p>
              </div>
              <Switch id="push-reminders" defaultChecked />
            </div>
          </div>

          <Button>Save notification preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
