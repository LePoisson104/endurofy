"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LegalPageLayout from "@/components/layouts/legal-page-layout";

export default function NotFound() {
  const router = useRouter();

  return (
    <LegalPageLayout>
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            {/* 404 Number */}
            <div className="text-9xl md:text-[12rem] font-bold text-primary/20 leading-none">
              404
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Page Not Found
            </h1>

            {/* Description */}
            <p className="text-muted-foreground max-w-md mx-auto">
              Oops! The page you&apos;re looking for seems to have taken a
              detour. Let&apos;s get you back on track with your fitness
              journey.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button
                variant="outline"
                className="w-full sm:w-auto arrow-button"
                onClick={() => router.push("/")}
              >
                <svg
                  className="arrow-icon transform rotate-180 mr-2"
                  viewBox="0 -3.5 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="arrow-icon__tip"
                    d="M8 15L14 8.5L8 2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <line
                    className="arrow-icon__line"
                    x1="13"
                    y1="8.5"
                    y2="8.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Back Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}
