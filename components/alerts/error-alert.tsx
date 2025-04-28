import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
          onAnimationEnd={handleAnimationEnd}
          className="animate-in slide-down flex items-center gap-4 text-destructive"
        >
          <div className="flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <AlertTitle>Something went wrong!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      </div>
    </div>
  );
}
