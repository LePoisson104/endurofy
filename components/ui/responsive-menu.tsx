"use client";

import * as React from "react";
import { useState } from "react";
import { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export interface MenuSection {
  items: MenuItem[];
}

interface ResponsiveMenuProps {
  /** Array of menu sections. Each section will be separated by a divider */
  sections: MenuSection[];
  /** Trigger button component */
  trigger: React.ReactNode;
  /** Title for the drawer (mobile only) */
  drawerTitle?: string;
  /** Alignment for dropdown menu (desktop only) */
  dropdownAlign?: "start" | "center" | "end";
  /** Width for dropdown menu (desktop only) */
  dropdownWidth?: string;
  /** Additional CSS classes for the dropdown content */
  dropdownClassName?: string;
  /** Callback to close the menu (useful for closing drawer after item click) */
  onClose?: () => void;
}

export function ResponsiveMenu({
  sections,
  trigger,
  drawerTitle = "Actions",
  dropdownAlign = "end",
  dropdownWidth = "w-56",
  dropdownClassName,
  onClose,
}: ResponsiveMenuProps) {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    onClose?.();
  };

  const renderMenuItems = (isDrawer: boolean = false) => {
    return sections.map((section, sectionIndex) => (
      <React.Fragment key={sectionIndex}>
        {sectionIndex > 0 && (
          <>
            {isDrawer ? (
              <hr className="border-border my-2" />
            ) : (
              <DropdownMenuSeparator />
            )}
          </>
        )}
        {section.items.map((item) => {
          const Icon = item.icon;
          const isDestructive = item.variant === "destructive";

          // Wrap onClick with onClose callback for drawer items
          const handleClick = () => {
            item.onClick();
            if (isDrawer) {
              handleDrawerClose();
            }
          };

          if (isDrawer) {
            return (
              <button
                key={item.id}
                onClick={handleClick}
                disabled={item.disabled}
                className={cn(
                  "flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors",
                  item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : isDestructive
                    ? "hover:bg-destructive/10 text-destructive"
                    : "hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </button>
            );
          }

          return (
            <DropdownMenuItem
              key={item.id}
              onClick={item.onClick}
              disabled={item.disabled}
              variant={item.variant}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </React.Fragment>
    ));
  };

  if (isMobile) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{drawerTitle}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2">{renderMenuItems(true)}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={dropdownAlign}
        className={cn(dropdownWidth, dropdownClassName)}
      >
        {renderMenuItems(false)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Convenience hook for creating menu items
export function createMenuItem(
  id: string,
  label: string,
  icon: LucideIcon,
  onClick: () => void,
  options?: {
    variant?: "default" | "destructive";
    disabled?: boolean;
  }
): MenuItem {
  return {
    id,
    label,
    icon,
    onClick,
    variant: options?.variant || "default",
    disabled: options?.disabled || false,
  };
}

// Convenience function for creating menu sections
export function createMenuSection(items: MenuItem[]): MenuSection {
  return { items };
}
