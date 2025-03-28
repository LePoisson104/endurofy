import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import ContinuteWithGoogleBtn from "@/components/continue-with-google-btn";
import AppLogo from "@/components/app-logo";
import { PasswordInput } from "@/components/ui/password-input";

export default function Signup() {
  return (
    <div className="flex justify-center items-center min-h-screen p-10 bg-background">
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

        <form className="flex flex-col gap-4 w-full">
          <div className="flex gap-2">
            <div className="space-y-2 w-full">
              <Label htmlFor="password">First Name</Label>
              <Input id="firstName" type="text" placeholder="John" />
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="password">Last Name</Label>
              <Input id="firstName" type="text" placeholder="Doe" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Confirm Password</Label>
            <PasswordInput id="password" placeholder="••••••••" />
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
