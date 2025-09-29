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
import AppLogo from "@/components/global/app-logo";
import { toast } from "sonner";
import { useVerifyOTPMutation } from "@/api/auth/auth-api-slice";
import { useResendOTPMutation } from "@/api/auth/auth-api-slice";

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@"); // Split into local part and domain
  if (localPart.length <= 3) return email; // If too short, return as is

  return `${localPart[0]}${"*".repeat(localPart.length - 3)}${localPart.slice(
    -2
  )}@${domain}`;
};

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(900);
  const [resendTimeLeft, setResendTimeLeft] = useState(0);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(sessionStorage.getItem("email"));
      setUserId(sessionStorage.getItem("user_id"));
      // Start with 1-minute resend cooldown when page loads
      setResendTimeLeft(60);
    }
  }, []);
  // Handle timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    if (!email || !userId) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, email, userId]);

  // Handle resend timer countdown
  useEffect(() => {
    if (resendTimeLeft <= 0) return;

    const resendTimer = setTimeout(() => {
      setResendTimeLeft(resendTimeLeft - 1);
    }, 1000);

    return () => clearTimeout(resendTimer);
  }, [resendTimeLeft]);

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
    if (!userId || !email) {
      toast.error("Missing user information. Please try signing up again.");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      await verifyOTP({
        user_id: userId,
        email: email,
        otp: otp,
      }).unwrap();
      toast.success("User created successfully");
      setOtp("");
      sessionStorage.clear();
      setTimeLeft(900);
      router.push("/login");
    } catch (err: any) {
      if (!err.status) {
        toast.error("No Server Response");
      } else if (err.status === 400) {
        toast.error(err.data?.message);
      } else if (err.status === 404) {
        toast.error(err.data?.message);
      } else {
        toast.error(
          err.data?.message || "An error occurred during verification."
        );
      }
    }
  };

  // Handle resend code
  const handleResend = async () => {
    if (!userId || !email) {
      toast.error("Missing user information. Please try signing up again.");
      return;
    }
    try {
      const response = await resendOTP({
        user_id: userId,
        email: email,
      }).unwrap();

      toast.success(response?.message);
      setOtp("");
      // Reset timer
      setTimeLeft(900);
      // Start 1-minute resend cooldown
      setResendTimeLeft(60);
    } catch (err: any) {
      if (!err.status) {
        toast.error("No Server Response");
      } else if (err.status === 400) {
        toast.error(err.data?.message);
      } else if (err.status === 404) {
        toast.error(err.data?.message);
      } else {
        toast.error(err.data?.message || "An error occurred during resending.");
      }
    }
  };

  // Handle OTP complete
  const handleComplete = useCallback((value: string) => {
    setOtp(value);
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
              We&apos;ve sent a verification code to your email
              <div className="font-medium text-primary mt-1">
                {maskEmail(email || "")}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleComplete}
                disabled={isVerifying || (!email && !userId)}
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
              disabled={otp.length !== 6 || isVerifying || (!email && !userId)}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Verify</>
              )}
            </Button>

            <div className="text-center text-sm flex items-center justify-center gap-1">
              Didn&apos;t receive a code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={handleResend}
                disabled={
                  isResending || (!email && !userId) || resendTimeLeft > 0
                }
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </>
                ) : resendTimeLeft > 0 ? (
                  `Resend (${resendTimeLeft}s)`
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
