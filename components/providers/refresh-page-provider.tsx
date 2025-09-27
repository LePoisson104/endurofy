"use client";
import { useEffect, useState } from "react";
import usePullToRefresh from "@/hooks/use-pull-to-refresh";
import { Loader } from "lucide-react";

export function RefreshPageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPulledDown, refresh] = usePullToRefresh();
  const [isStandalone, setIsStandalone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  useEffect(() => {
    if (refresh && isStandalone && !isRefreshing) {
      setIsRefreshing(true);
      // Add a small delay to show the refresh animation
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [refresh, isStandalone, isRefreshing]);

  return (
    <>
      {(isPulledDown || isRefreshing) && isStandalone && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center bg-background p-6 standalone:pt-16">
          <Loader className="w-5 h-5 animate-spin" />
        </div>
      )}
      {children}
    </>
  );
}
