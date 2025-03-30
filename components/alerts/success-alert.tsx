import { Alert, AlertDescription } from "@/components/ui/alert";
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
          className="animate-in slide-down border border-grey-500 text-green-600"
        >
          <CircleCheck className="h-4 w-4" />
          <AlertDescription className="text-green-600">
            {success}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
