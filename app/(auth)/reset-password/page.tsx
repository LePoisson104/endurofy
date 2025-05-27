"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import AppLogo from "@/components/global/app-logo";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { useResetPasswordMutation } from "@/api/auth/auth-api-slice";
import ErrorAlert from "@/components/alerts/error-alert";
import SuccessAlert from "@/components/alerts/success-alert";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  PasswordFormErrors,
  usePasswordValidation,
} from "@/helper/password-validator";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState<PasswordFormErrors>({
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({
    password: false,
    confirmPassword: false,
  });

  // Get email and otp from URL parameters
  const email = searchParams.get("email");
  const otp = searchParams.get("token");

  // Use the reusable password validation
  const { validateField, validateAllFields } = usePasswordValidation(
    password,
    confirmPassword
  );

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "password":
        setPassword(value);
        if (touched.confirmPassword) {
          setFormErrors((prev) => ({
            ...prev,
            confirmPassword: validateField("confirmPassword", confirmPassword),
          }));
        }
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }

    if (touched[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !otp) {
      setError("No parameters found");
      return;
    }
    console.log(email, otp);

    // Mark all fields as touched
    setTouched({
      password: true,
      confirmPassword: true,
    });

    // Validate all fields using the reusable validator
    const newErrors = validateAllFields();
    setFormErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    try {
      const response = await resetPassword({ email, otp, password }).unwrap();
      setSuccess("Password reset successfully, redirecting to login...");

      setPassword("");
      setConfirmPassword("");
      setFormErrors({ password: "", confirmPassword: "" });
      setTouched({ password: false, confirmPassword: false });
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      if (!error.status) {
        setError("No Server Response");
      } else {
        setError(
          error.data?.message || "An error occurred during password reset."
        );
      }
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
            Reset your password
          </h1>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.password && formErrors.password ? "border-red-400" : ""
              }
              autoComplete="new-password"
            />
            {touched.password && formErrors.password && (
              <p className="text-sm text-red-400">{formErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.confirmPassword && formErrors.confirmPassword
                  ? "border-red-400"
                  : ""
              }
              autoComplete="new-password"
            />
            {touched.confirmPassword && formErrors.confirmPassword && (
              <p className="text-sm text-red-400">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              password !== confirmPassword ||
              (password === "" && confirmPassword === "") ||
              (email === null && otp === null)
            }
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
