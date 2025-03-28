import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import AppLogo from "@/components/app-logo";
import { PasswordInput } from "@/components/ui/password-input";
export default function ResetPassword() {
  return (
    <div className="flex justify-center items-center min-h-screen p-10 bg-background">
      <div className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-1 mb-2">
          <Link href="/">
            <AppLogo />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Reset your password
          </h1>
        </div>

        <form className="flex flex-col gap-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <PasswordInput id="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Confirm Password</Label>
            <PasswordInput id="password" placeholder="••••••••" />
          </div>

          <Button type="submit" className="w-full">
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}
