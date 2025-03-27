"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import AppLogo from "@/components/app-logo";
import ErrorAlert from "@/components/alerts/error-alert";
import SuccessAlert from "@/components/alerts/success-alert";

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle OTP verification
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, let's say "123456" is the correct code
      if (otp === "123456") {
        setSuccess("Verification successful!");
        // Redirect after successful verification
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError("Invalid verification code.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Reset timer
      setTimeLeft(60);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Handle OTP complete
  const handleComplete = useCallback((value: string) => {
    setOtp(value);
    setError(null);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <AppLogo />
        <Card className="w-full bg-background border-none shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Verify your email
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a verification code to your email
              <div className="font-medium text-primary mt-1">
                j********@example.com
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ErrorAlert error={error} setError={setError} />
            <SuccessAlert success={success} setSuccess={setSuccess} />

            <div className="flex flex-col items-center justify-center space-y-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleComplete}
                disabled={isSubmitting}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <div className="text-sm text-muted-foreground">
                {timeLeft > 0 ? (
                  <span>Code expires in {formatTime(timeLeft)}</span>
                ) : (
                  <span>Code expired</span>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-[100px]"
              onClick={handleVerify}
              disabled={otp.length !== 6 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Verify</>
              )}
            </Button>

            <div className="text-center text-sm flex items-center justify-center gap-1">
              Didn't receive a code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={handleResend}
                disabled={timeLeft > 0 || isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </>
                ) : (
                  "Resend"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
