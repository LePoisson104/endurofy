"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import ContinuteWithGoogleBtn from "@/components/buttons/continue-with-google-btn";
import AppLogo from "@/components/global/app-logo";
import { PasswordInput } from "@/components/ui/password-input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/api/auth/auth-api-slice";
import { Loader2 } from "lucide-react";
import { validatePasswordField } from "@/helper/password-validator";
import { toast } from "sonner";

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const router = useRouter();
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [signup, { isLoading }] = useSignupMutation();

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
        return value.trim() === "" ? "First name is required" : "";
      case "lastName":
        return value.trim() === "" ? "Last name is required" : "";
      case "email":
        return value.trim() === ""
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Invalid email format"
          : "";
      case "password":
      case "confirmPassword":
        return validatePasswordField(name, value, password);
      default:
        return "";
    }
  };

  useEffect(() => {
    const sessionEmail = sessionStorage.getItem("getStartedEmail");
    if (sessionEmail) {
      setEmail(sessionEmail);
    }
  }, []);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
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

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    const newErrors = {
      firstName: validateField("firstName", firstName),
      lastName: validateField("lastName", lastName),
      email: validateField("email", email),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
    };

    setFormErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    try {
      const response = await signup({
        firstName,
        lastName,
        email,
        password,
      }).unwrap();

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      sessionStorage.setItem("user_id", response?.data?.user.user_id);
      sessionStorage.setItem("email", response?.data?.user.email);

      router.push("/verify-otp");
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else if (error.status === 400) {
        toast.error(error.data?.message);
      } else if (error.status === 404) {
        toast.error("All fields are required.");
      } else if (error.status === 409) {
        toast.error("Email already in use.");
      } else {
        toast.error(error.data?.message || "An error occurred during signup.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-10 bg-background">
      <div className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-1 mb-2">
          {!isStandalone ? (
            <Link href="/">
              <AppLogo />
            </Link>
          ) : (
            <AppLogo />
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            Get started with Endurofy
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Log in
            </Link>
          </p>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="space-y-2 w-full">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  touched.firstName && formErrors.firstName
                    ? "border-red-500"
                    : ""
                } `}
              />
              {touched.firstName && formErrors.firstName && (
                <p className="text-sm text-red-500">{formErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${
                  touched.lastName && formErrors.lastName
                    ? "border-red-500"
                    : ""
                }`}
              />
              {touched.lastName && formErrors.lastName && (
                <p className="text-sm text-red-500">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${
                touched.email && formErrors.email ? "border-red-500" : ""
              }`}
            />
            {touched.email && formErrors.email && (
              <p className="text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.password && formErrors.password ? "border-red-500" : ""
              }
              autoComplete="off"
            />
            {touched.password && formErrors.password && (
              <p className="text-sm text-red-500">{formErrors.password}</p>
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
                  ? "border-red-500"
                  : ""
              }
              autoComplete="off"
            />
            {touched.confirmPassword && formErrors.confirmPassword && (
              <p className="text-sm text-red-500">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              </>
            ) : (
              "Sign up"
            )}
          </Button>

          <div className="flex items-center gap-3 my-2">
            <Separator className="flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-medium">
              OR
            </span>
            <Separator className="flex-1 bg-border" />
          </div>

          <ContinuteWithGoogleBtn />
        </form>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          By logging in, you agree to our{" "}
          <Link
            href="/terms"
            className="hover:underline underline-offset-2 text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="hover:underline underline-offset-2 text-primary"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
