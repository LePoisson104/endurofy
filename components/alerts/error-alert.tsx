import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ErrorAlert({
  error,
  setError,
}: {
  error: string | null;
  setError: (error: string) => void;
}) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      // Start timer to dismiss after 5 seconds
      const timer = setTimeout(() => {
        if (alertRef.current) {
          alertRef.current.classList.add("slide-up");
          alertRef.current.classList.remove("slide-down");
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "slideUp") {
      setError("");
    }
  };

  if (!error) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-51 flex justify-center">
      <div className="w-fit px-4 pt-8">
        <Alert
          ref={alertRef}
          variant="destructive"
          onAnimationEnd={handleAnimationEnd}
          className="animate-in slide-down"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
