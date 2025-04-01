"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import ErrorAlert from "@/components/alerts/error-alert";
import { useResendOTPMutation } from "@/api/auth/auth-api-slice";
import { useVerifyUpdateEmailMutation } from "@/api/user/user-api-slice";
import LogoutNotice from "@/components/modals/logout-notice";
interface VerifyOTPModalProps {
  pendingEmail: string;
  userId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const maskEmail = (email: string) => {
  if (!email) return;
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 3) return email;
  return `${localPart[0]}${"*".repeat(localPart.length - 3)}${localPart.slice(
    -2
  )}@${domain}`;
};

export default function VerifyOTPModal({
  pendingEmail,
  userId,
  isOpen,
  setIsOpen,
}: VerifyOTPModalProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(900);
  const [error, setError] = useState<string | null>(null);
  const [verifyEmailChange, { isLoading: isVerifying }] =
    useVerifyUpdateEmailMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();
  const [openLogoutNotice, setOpenLogoutNotice] = useState(false);

  useEffect(() => {
    setOtp("");
    setTimeLeft(900);
    setError(null);
  }, [pendingEmail, userId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    if (!pendingEmail || !userId) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, pendingEmail, userId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleVerify = async () => {
    if (!userId || !pendingEmail) {
      setError("Missing user information. Please try signing up again.");
      return;
    }
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      await verifyEmailChange({
        userId: userId,
        otp: otp,
      }).unwrap();
      setOtp("");
      setTimeLeft(900);
      setOpenLogoutNotice(true);
      setIsOpen(false);
    } catch (err: any) {
      if (!err.status) {
        setError("No Server Response");
      } else if (err.status === 400) {
        setError(err.data?.message);
      } else if (err.status === 404) {
        setError(err.data?.message);
      } else {
        setError(err.data?.message || "An error occurred during verification.");
      }
    }
  };

  const handleResend = async () => {
    if (!userId || !pendingEmail) {
      setError("Missing user information. Please try signing up again.");
      return;
    }
    try {
      const response = await resendOTP({
        user_id: userId,
        email: pendingEmail,
      }).unwrap();
      setOtp("");
      setTimeLeft(900);
    } catch (err: any) {
      if (!err.status) {
        setError("No Server Response");
      } else if (err.status === 400) {
        setError(err.data?.message);
      } else if (err.status === 404) {
        setError(err.data?.message);
      } else {
        setError(err.data?.message || "An error occurred during resending.");
      }
    }
  };

  const handleComplete = useCallback((value: string) => {
    setOtp(value);
    setError(null);
  }, []);

  return (
    <>
      <ErrorAlert error={error} setError={setError} />
      <LogoutNotice isOpen={openLogoutNotice} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-center">
              Verify your email
            </DialogTitle>
            <div className="text-center text-muted-foreground text-sm">
              We've sent a verification code to your email
              <div className="font-medium text-primary mt-1">
                {maskEmail(pendingEmail)}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleComplete}
                disabled={isVerifying || !pendingEmail || !userId}
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
          </div>

          <div className="text-center text-sm flex items-center justify-center gap-1">
            <Button
              className="w-[100px]"
              onClick={handleVerify}
              disabled={
                otp.length !== 6 || isVerifying || !pendingEmail || !userId
              }
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>

          <div className="text-center text-sm flex items-center justify-center gap-1 text-muted-foreground">
            Didn't receive a code?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={handleResend}
              disabled={isResending || !pendingEmail || !userId}
            >
              {isResending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Resend"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
