"use client";

import { useEffect, useState } from "react";

export default function usePullToRefresh(threshold: number = 100) {
  const [isPulledDown, setIsPulledDown] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    let startY = 0;
    let isAtTop = false;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start tracking if we're at the top of the page
      if (window.scrollY === 0) {
        isAtTop = true;
        startY = e.touches[0].clientY;
        setIsPulledDown(false);
        setRefresh(false);
      } else {
        isAtTop = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop) return;

      const currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      // Only handle downward pulls when at top of page
      if (pullDistance > 0 && window.scrollY === 0) {
        isPulling = true;
        // Only prevent default for significant pulls to avoid breaking normal scrolling
        if (pullDistance > 10) {
          e.preventDefault();
        }

        if (pullDistance > threshold) {
          setIsPulledDown(true);
          setRefresh(false);
        } else if (pullDistance > 20) {
          // Show indicator after minimal pull
          setIsPulledDown(true);
          setRefresh(false);
        } else {
          setIsPulledDown(false);
          setRefresh(false);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPulling && isAtTop) {
        const currentY = e.changedTouches[0].clientY;
        const pullDistance = currentY - startY;

        if (pullDistance > threshold) {
          setRefresh(true);
          setIsPulledDown(false);
        } else {
          setIsPulledDown(false);
          setRefresh(false);
        }
      }

      isAtTop = false;
      startY = 0;
      isPulling = false;
    };

    // Use non-passive listeners for touchmove to allow preventDefault
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [threshold]);

  return [isPulledDown, refresh];
}
