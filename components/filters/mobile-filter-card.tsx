"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { ListFilterPlus, RotateCcw } from "lucide-react";

interface MobileFilterCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawerTitle: string;
  drawerDescription: string;
  primaryLabel: string;
  secondaryLabel?: ReactNode;
  badge?: ReactNode;
  periodDisplay: string;
  onReset: () => void;
  children: ReactNode;
}

export function MobileFilterCard({
  open,
  onOpenChange,
  drawerTitle,
  drawerDescription,
  primaryLabel,
  secondaryLabel,
  badge,
  periodDisplay,
  onReset,
  children,
}: MobileFilterCardProps) {
  return (
    <>
      <Card>
        <CardContent className="px-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(true)}>
              <ListFilterPlus className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground truncate">
                  {primaryLabel ? (
                    <>
                      <span className="font-medium text-foreground">
                        {primaryLabel}
                      </span>
                      {secondaryLabel && <> • {secondaryLabel}</>}
                    </>
                  ) : (
                    <span className="text-muted-foreground">No selection</span>
                  )}
                </p>
                {badge}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {periodDisplay}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="standalone:pb-10">
          <DrawerHeader className="text-left">
            <DrawerTitle>{drawerTitle}</DrawerTitle>
            <DrawerDescription>{drawerDescription}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{children}</div>
          <DrawerFooter>
            <Button
              variant="outline"
              onClick={() => {
                onReset();
                onOpenChange(false);
              }}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
