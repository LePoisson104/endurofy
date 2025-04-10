import { useState, useEffect } from "react";

type Breakpoint = "xs" | "sm" | "md" | "lg";

const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("xs"); // Default to 'xs'

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(min-width: 1280px)").matches) {
        setBreakpoint("lg"); // Large screen
      } else if (window.matchMedia("(min-width: 1024px)").matches) {
        setBreakpoint("md"); // Medium screen
      } else if (window.matchMedia("(min-width: 768px)").matches) {
        setBreakpoint("sm"); // Small screen
      } else {
        setBreakpoint("xs"); // Extra small screen
      }
    };

    // Initial check
    handleResize();

    // Event listener for resize
    window.addEventListener("resize", handleResize);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
};

export default useBreakpoint;
