"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import AppLogo from "@/components/global/app-logo";
import { useLoginMutation } from "@/api/auth/auth-api-slice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/api/auth/auth-slice";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import ContinueWithGoogle from "@/components/buttons/continue-with-google";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter an email and password");
      return;
    }
    try {
      const response = await login({ email, password }).unwrap();
      dispatch(setCredentials(response?.data));
      setEmail("");
      setPassword("");
      router.push("/dashboard");
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else if (error.status === 400) {
        toast.error(error.data?.message);
      } else if (error.status === 401 || error.status === 404) {
        toast.error("Incorrect email or password. Try again.");
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex flex-col flex-grow justify-center items-center p-10">
        <div className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto">
          <div className="flex flex-col items-center gap-1 mb-2">
            {!isStandalone ? (
              <Link href="/">
                <AppLogo />
              </Link>
            ) : (
              <AppLogo />
            )}
            <h1 className="text-2xl tracking-tight">Welcome back</h1>
          </div>

          <ContinueWithGoogle />
          <div className="w-full border-b mt-4 mb-4" />

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Login"
              )}
            </Button>

            <Button variant="ghost" className="w-full" asChild>
              <Link href="/signup">Or sign up instead</Link>
            </Button>
          </form>
        </div>
      </div>
      {!isStandalone && (
        <footer className="text-xs text-muted-foreground text-center max-w-sm mx-auto mb-4 standalone:mb-10">
          By proceeding you acknowledge that you have read, understood and agree
          to our{" "}
          <Link
            href="/terms-of-service"
            className="hover:underline underline-offset-2 text-primary font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="hover:underline underline-offset-2 text-primary font-medium"
          >
            Privacy Policy
          </Link>
        </footer>
      )}
    </div>
  );
}
