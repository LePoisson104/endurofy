"use client";

import * as React from "react";
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
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
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
  sections: MenuSection[];
  trigger?: React.ReactNode;
  drawerTitle?: string;
  dropdownAlign?: "start" | "center" | "end";
  dropdownWidth?: string;
  dropdownClassName?: string;
  onClose?: () => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export function ResponsiveMenu({
  sections,
  trigger,
  drawerTitle,
  dropdownAlign = "end",
  dropdownWidth = "w-56",
  dropdownClassName,
  isOpen,
  setIsOpen,
}: ResponsiveMenuProps) {
  const isMobile = useIsMobile();

  const renderMenuItems = (isDrawer: boolean = false) => {
    return sections.map(
      (section, sectionIndex) =>
        section.items.length > 0 && (
          <React.Fragment key={sectionIndex}>
            {sectionIndex > 0 && (
              <>
                {isDrawer ? (
                  <div className="border-b border-muted" />
                ) : (
                  <DropdownMenuSeparator />
                )}
              </>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isDestructive = item.variant === "destructive";

              const handleClick = () => {
                item.onClick();
                if (isDrawer) {
                  setIsOpen?.(false);
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
        )
    );
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="px-2 pb-8">
          <DrawerHeader>
            <DrawerTitle>{drawerTitle}</DrawerTitle>
            <DrawerDescription />
          </DrawerHeader>
          <div className="p-2">{renderMenuItems(true)}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={dropdownAlign}
        className={cn(dropdownWidth, dropdownClassName, "w-fit")}
      >
        {renderMenuItems(false)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

export function createMenuSection(items: MenuItem[]): MenuSection {
  return { items };
}
