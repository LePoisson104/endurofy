"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Share, Plus, MoreVertical } from "lucide-react";

interface MobileInstallInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Platform = "ios" | "android" | "other";

export function MobileInstallInstructionsModal({
  isOpen,
  onClose,
}: MobileInstallInstructionsModalProps) {
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
        setPlatform("ios");
      } else if (userAgent.includes("android")) {
        setPlatform("android");
      } else {
        setPlatform("other");
      }
    }
  }, []);

  const renderIOSInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
          1
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Tap the Share button</p>
          <p className="text-xs text-muted-foreground">
            Look for the <Share className="inline w-3 h-3 mx-1" /> icon at the
            bottom of your Safari browser
          </p>
        </div>
        <Share className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
          2
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            Find &quot;Add to Home Screen&quot;
          </p>
          <p className="text-xs text-muted-foreground">
            Scroll down in the share menu and tap this option
          </p>
        </div>
        <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>

      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
          3
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Tap &quot;Add&quot;</p>
          <p className="text-xs text-muted-foreground">
            Confirm by tapping &quot;Add&quot; in the top right corner
          </p>
        </div>
        <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          <strong>Note:</strong> This feature only works in Safari browser on
          iOS devices
        </p>
      </div>
    </div>
  );

  const renderAndroidInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
          1
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Tap the Menu button</p>
          <p className="text-xs text-muted-foreground">
            Look for <MoreVertical className="inline w-3 h-3 mx-1" /> (three
            dots) in your browser
          </p>
        </div>
        <MoreVertical className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
          2
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            Select &quot;Add to Home screen&quot;
          </p>
          <p className="text-xs text-muted-foreground">
            Look for this option in the dropdown menu
          </p>
        </div>
        <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>

      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
          3
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Tap &quot;Add&quot;</p>
          <p className="text-xs text-muted-foreground">
            Confirm the installation to add Endurofy to your home screen
          </p>
        </div>
        <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          <strong>Note:</strong> This works in Chrome, Firefox, and other modern
          browsers on Android
        </p>
      </div>
    </div>
  );

  const renderGenericInstructions = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <Smartphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Add Endurofy to Your Home Screen
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          For the best experience, add Endurofy as an app to your device&apos;s
          home screen.
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="font-medium text-sm mb-1">iOS (Safari)</p>
          <p className="text-xs text-muted-foreground">
            Tap Share → &quot;Add to Home Screen&quot; → Add
          </p>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="font-medium text-sm mb-1">Android (Chrome/Firefox)</p>
          <p className="text-xs text-muted-foreground">
            Tap Menu (⋮) → &quot;Add to Home screen&quot; → Add
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
        <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
          <strong>Tip:</strong> Once installed, Endurofy will work like a native
          app with offline support!
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Install Endurofy
          </DialogTitle>
          <DialogDescription>
            Add Endurofy to your home screen for quick access and a native app
            experience.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {platform === "ios" && renderIOSInstructions()}
          {platform === "android" && renderAndroidInstructions()}
          {platform === "other" && renderGenericInstructions()}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
