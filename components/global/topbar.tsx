"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Settings, User, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/buttons/theme-toggle";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

interface TopBarProps {
  className?: string;
  isVisible?: boolean;
}

export function TopBar({ className }: TopBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const isMobile = useIsMobile();
  const isVisible = useScrollDirection();
  const isDark = useGetCurrentTheme();

  // Close mobile search when topbar becomes hidden
  useEffect(() => {
    if (!isVisible && isSearchOpen) {
      setIsSearchOpen(false);
    }
  }, [isVisible, isSearchOpen]);

  return (
    <header
      className={cn(
        `sticky top-0 z-50 flex h-[65px] w-full items-center ${
          isMobile ? "standalone:pt-14 standalone:h-[100px]" : ""
        } bg-background px-4 transition-opacity duration-500 ease-in-out ${
          isMobile ? "border-none" : "border-b"
        }`,
        {
          "opacity-0 pointer-events-none": isMobile && !isVisible,
          "opacity-100 pointer-events-auto": !isMobile || isVisible,
        },
        className
      )}
    >
      <div className="flex w-full items-center justify-between">
        {/* Actions Section */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {isMobile && <SidebarTrigger />}
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <DropdownMenu open={isThemeOpen} onOpenChange={setIsThemeOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isDark ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 text-sm">
                <ThemeToggle onClose={() => setIsThemeOpen(false)} />
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon">
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
