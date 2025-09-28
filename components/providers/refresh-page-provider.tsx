"use client";
import { useEffect, useState } from "react";
import usePullToRefresh from "@/hooks/use-pull-to-refresh";
import { Loader2 } from "lucide-react";

export function RefreshPageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOrDrawerOpen, setIsModalOrDrawerOpen] = useState(false);
  const [isPulledDown, refresh] = usePullToRefresh(200, isModalOrDrawerOpen);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  useEffect(() => {
    // Function to check if any modal or drawer is open
    const checkModalDrawerState = () => {
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      );
      const drawerContent = document.querySelector(
        '[data-slot="drawer-content"]'
      );
      const isOpen = !!(dialogContent || drawerContent);
      setIsModalOrDrawerOpen(isOpen);
    };

    // Check immediately
    checkModalDrawerState();

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(checkModalDrawerState);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state", "data-slot"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (refresh && isStandalone && !isRefreshing && !isModalOrDrawerOpen) {
      setIsRefreshing(true);
      // Add a small delay to show the refresh animation
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [refresh, isStandalone, isRefreshing, isModalOrDrawerOpen]);

  return (
    <>
      {(isPulledDown || isRefreshing) &&
        isStandalone &&
        !isModalOrDrawerOpen && (
          <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center bg-transparent p-6 standalone:pt-16">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
      {children}
    </>
  );
}
