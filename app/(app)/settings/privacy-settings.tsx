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
import { Download, FileDown } from "lucide-react";

export default function PrivacySettings() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Preferences</CardTitle>
          <CardDescription>
            Control how your data is used and shared.
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
                <Label htmlFor="security" className="text-base">
                  Security emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about your account activity and security.
                </p>
              </div>
              <Switch id="security" defaultChecked />
            </div>

            <Separator />

            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row justify-between"
              } items-start gap-4`}
            >
              <div className="space-y-1">
                <Label htmlFor="marketing" className="text-base">
                  Marketing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about new features and special offers.
                </p>
              </div>
              <Switch id="marketing" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Data</CardTitle>
          <CardDescription>
            Download or delete your personal data.
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
                <Label className="text-base">Download your data</Label>
                <p className="text-sm text-muted-foreground">
                  Export all of your personal data in your preferred format.
                </p>
              </div>
              <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className={isMobile ? "flex-1" : ""}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button size="sm" className={isMobile ? "flex-1" : ""}>
                  <Download className="mr-2 h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
