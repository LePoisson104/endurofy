import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CircleCheck } from "lucide-react";
import { useEffect, useRef } from "react";

export default function SuccessAlert({
  success,
  setSuccess,
}: {
  success: string | null;
  setSuccess: (success: string) => void;
}) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (success) {
      // Start timer to dismiss after 5 seconds
      const timer = setTimeout(() => {
        if (alertRef.current) {
          alertRef.current.classList.add("slide-up");
          alertRef.current.classList.remove("slide-down");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "slideUp") {
      setSuccess("");
    }
  };

  if (!success) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-51 flex justify-center">
      <div className="w-fit px-4 pt-8">
        <Alert
          variant="default"
          ref={alertRef}
          onAnimationEnd={handleAnimationEnd}
          className="animate-in slide-down flex items-center gap-4 border text-green-500"
        >
          <div className="flex items-center justify-center">
            <CircleCheck className="h-5 w-5" />
          </div>
          <div>
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </div>
        </Alert>
      </div>
    </div>
  );
}
