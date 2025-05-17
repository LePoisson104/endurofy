import { useState, useEffect } from "react";

export default function usePersist() {
  const [persist, setPersist] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has previously chosen to persist
    const persisted = localStorage.getItem("Endurofy-persist");
    if (persisted) {
      setPersist(JSON.parse(persisted));
    }
  }, []);

  const updatePersist = (value: boolean) => {
    setPersist(value);
    localStorage.setItem("Endurofy-persist", JSON.stringify(value));
  };

  return { persist, setPersist: updatePersist };
}
