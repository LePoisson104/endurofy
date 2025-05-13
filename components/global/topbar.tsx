"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Search, X, LogOut, Settings, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/api/auth/auth-api-slice";
import { ThemeToggle } from "@/components/buttons/theme-toggle";

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const [logout, { isSuccess }] = useLogoutMutation();

  useEffect(() => {
    if (isSuccess) {
      router.push("/login");
    }
  }, [isSuccess, router]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-[65px] w-full items-center border-b bg-background px-4",
        className
      )}
    >
      <div className="flex w-full items-center justify-between">
        {/* Actions Section */}
        <div className="flex items-center justify-between w-full">
          {/* Search - Desktop */}
          <div className="hidden md:flex relative">
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] lg:w-[280px]"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isMobile && <SidebarTrigger />}

            {/* Search - Mobile */}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="sr-only">Search</span>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-0 h-5 w-5 rounded-full p-0 flex items-center justify-center  bg-[#FF3B30] text-white">
                    3
                  </Badge>
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-auto">
                  {[1, 2, 3].map((i) => (
                    <DropdownMenuItem key={i} className="cursor-pointer py-3">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={`#`} alt="Avatar" />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none">
                            New notification {i}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            This is a notification message that might be quite
                            long and needs to wrap properly.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center font-medium">
                  View all notifications
                </DropdownMenuItem>
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
            <Button variant="ghost" size="icon" onClick={() => logout()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {isSearchOpen && (
        <div className="absolute left-0 top-16 w-full bg-background p-4 border-b md:hidden">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
