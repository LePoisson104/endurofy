import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const ForgotPassword = () => {
  return (
    <div className="flex justify-center items-center min-h-screen p-10 bg-background">
      <div className="flex flex-col gap-4 justify-center items-center w-full max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-1 mb-2">
          <Link href="/">
            <div className="flex items-center justify-center w-10 h-10 border-1 border-primary rounded-md mb-2">
              <p className="text-xl font-bold tracking-tight">E</p>
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter the email address associated with your account and we'll send
            you a link to reset your password.
          </p>
        </div>

        <form className="flex flex-col gap-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>

          <Button type="submit" className="w-full">
            Reset password
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
};

export default ForgotPassword;
