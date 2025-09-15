"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { useIsMobile } from "@/hooks/use-mobile";
import Targets from "./targets";

export default function SettingsPage() {
  // const router = useRouter();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") || "account"
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("activeTab", value);
  };

  return (
    <div className="p-[1rem] flex flex-col min-h-screen">
      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <div className="bg-background z-10 border-b mb-2">
          <TabsList className={"grid grid-cols-3 h-auto flex gap-2"}>
            <TabsTrigger value="account" className={isMobile ? "py-2" : ""}>
              Account
            </TabsTrigger>
            <TabsTrigger value="targets" className={isMobile ? "py-2" : ""}>
              Targets
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="targets" className="space-y-6">
          <Targets />
        </TabsContent>
      </Tabs>
    </div>
  );
}
