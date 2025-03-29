"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import ContinuteWithGoogleBtn from "@/components/continue-with-google-btn";
import AppLogo from "@/components/app-logo";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import ErrorAlert from "@/components/alerts/error-alert";

interface FormErrors {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
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
        return value.trim() === ""
          ? "Password is required"
          : value.length < 8
          ? "Password must be at least 8 characters"
          : "";
      case "confirmPassword":
        return value.trim() === ""
          ? "Please confirm your password"
          : value !== password
          ? "Passwords do not match"
          : "";
      default:
        return "";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
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
          setErrors((prev) => ({
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
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    // If no errors, proceed with form submission
    console.log(firstName, lastName, email, password, confirmPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-10 bg-background">
      {error && <ErrorAlert error={error} setError={setError} />}
      <div className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-1 mb-2">
          <Link href="/">
            <AppLogo />
          </Link>
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
                className={
                  touched.firstName && errors.firstName ? "border-red-500" : ""
                }
              />
              {touched.firstName && errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName}</p>
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
                className={
                  touched.lastName && errors.lastName ? "border-red-500" : ""
                }
              />
              {touched.lastName && errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName}</p>
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
              className={touched.email && errors.email ? "border-red-500" : ""}
            />
            {touched.email && errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
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
                touched.password && errors.password ? "border-red-500" : ""
              }
            />
            {touched.password && errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
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
                touched.confirmPassword && errors.confirmPassword
                  ? "border-red-500"
                  : ""
              }
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Sign up
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
