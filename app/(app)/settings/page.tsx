"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { NotificationSettings } from "./notification-settings";
import { useIsMobile } from "@/hooks/use-mobile";
import PrivacySettings from "./privacy-settings";
import Targets from "./targets";

export default function SettingsPage() {
  // const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("account");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="p-[1rem] flex flex-col min-h-screen">
      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <div className="bg-background z-10 border-b mb-2">
          <TabsList className={"grid grid-cols-3 h-auto flex gap-1"}>
            <TabsTrigger value="account" className={isMobile ? "py-2" : ""}>
              Account
            </TabsTrigger>
            <TabsTrigger value="targets" className={isMobile ? "py-2" : ""}>
              Targets
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={isMobile ? "py-2" : ""}
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className={isMobile ? "py-2" : ""}>
              Privacy
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <Targets />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <PrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
