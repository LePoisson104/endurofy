"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import AppLogo from "@/components/global/app-logo";
import { useForgotPasswordMutation } from "@/api/auth/auth-api-slice";
import ErrorAlert from "@/components/alerts/error-alert";
import SuccessAlert from "@/components/alerts/success-alert";
import { Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      setEmail("");
      setSuccess("Reset password email sent successfully");
    } catch (error: any) {
      console.log(error);
      setError(error.data?.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-10 bg-background">
      <ErrorAlert error={error} setError={setError} />
      <SuccessAlert success={success} setSuccess={setSuccess} />
      <div className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-1 mb-2">
          <Link href="/">
            <AppLogo />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Reset password"
            )}
          </Button>

          <div className="flex items-center gap-3 my-2">
            <Separator className="flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-medium">
              OR
            </span>
            <Separator className="flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Back to login</Link>
          </Button>
        </form>
      </div>
    </div>
  );
}
