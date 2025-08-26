// use-scroll-behavior.tsx
import { useEffect } from "react";

function useScrollBehavior(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.scrollBehavior = "auto";
    } else {
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = "smooth";
      }, 400);
    }
  }, [isOpen]);
}

export default useScrollBehavior;
