"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProfileSuccessNoticeProps {
  open: boolean;
}

export default function ProfileSuccessNotice({
  open,
}: ProfileSuccessNoticeProps) {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] bg-card" closeXButton={true}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Profile Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-center">
            Welcome to Endurofy! Your fitness journey starts now.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="animate-scale-in">
            <CheckCircle2 className="h-16 w-16 text-green-400" />
          </div>

          <div className="animate-fade-in-up text-center space-y-2">
            <p className="text-lg font-medium">
              Your profile is all set up and ready to go!
            </p>
            <p className="text-sm text-muted-foreground">
              You can edit your profile anytime to match your progress.
            </p>
          </div>

          <div className="animate-fade-in w-full pt-4">
            <Button
              onClick={() => {
                setIsOpen(false);
              }}
              className="w-full"
            >
              Dimiss
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
