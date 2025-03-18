"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { NotificationSettings } from "./notification-settings";
// import { ChevronLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SettingsPage() {
  // const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("account");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="p-[1rem] flex flex-col gap-[1rem]">
      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <div className="sticky top-0 bg-background z-10 pb-4">
          <TabsList
            className={isMobile ? "grid grid-cols-2 h-auto" : "flex flex-wrap"}
          >
            <TabsTrigger value="account" className={isMobile ? "py-2" : ""}>
              Account
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className={isMobile ? "py-2" : ""}
            >
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
