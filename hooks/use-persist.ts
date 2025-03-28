import { useState, useEffect } from "react";

const usePersist = (): [boolean, (value: boolean) => void] => {
  const [persist, setPersist] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("persist");
      return stored ? JSON.parse(stored) : true;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("persist", JSON.stringify(persist));
    }
  }, [persist]);

  return [persist, setPersist] as const;
};

export default usePersist;
