"use client";

import { useIsMobile } from "@/hooks/use-mobile";

export default function AnalyticsPage() {
  const isMobile = useIsMobile();

  return <div className="flex min-h-screen flex-col p-[1rem] space-y-6"></div>;
}
