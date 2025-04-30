"use client";

import Link from "next/link";
import {
  BarChart3,
  Dumbbell,
  Home,
  ListTodo,
  Plus,
  ScrollText,
  Settings,
  User,
  Menu,
  EllipsisVertical,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { usePathname, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogoutMutation } from "@/api/auth/auth-api-slice";
import { useGetAllUsersInfoQuery } from "@/api/user/user-api-slice";

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { open, openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  // Sample data - in a real app, this would come from a database
  const workoutPrograms = [
    { id: 1, name: "Strength Building", isActive: true },
    { id: 2, name: "Weight Loss" },
    { id: 3, name: "Muscle Hypertrophy" },
  ];

  const handleCloseSidebarOnMobile = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div className="relative">
      {/* Toggle button for collapsed state - centered */}
      {!open && !isMobile && (
        <div className="fixed top-5 left-2 right-0 z-20">
          <HeaderToggleButton />
        </div>
      )}

      <Sidebar collapsible="icon" className="overflow-x-hidden">
        <SidebarContent className="overflow-x-hidden">
          <SidebarHeader className="pb-0">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="font-semibold text-2xl tracking-tight group-data-[collapsible=icon]:opacity-0 flex items-center">
                Endurofy
              </div>

              <div className="flex-shrink-0 z-10">
                {open && <HeaderToggleButton />}
              </div>
            </div>
          </SidebarHeader>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard"}
                    tooltip="Dashboard"
                    onClick={handleCloseSidebarOnMobile}
                  >
                    <Link href="/dashboard" className="truncate">
                      <Home />
                      <span className="truncate">Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/workout-log"}
                    tooltip="Workout Log"
                    onClick={handleCloseSidebarOnMobile}
                  >
                    <Link href="/workout-log" className="truncate">
                      <Dumbbell />
                      <span className="truncate">Workout Log</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/weight-log"}
                    tooltip="Weight Log"
                    onClick={handleCloseSidebarOnMobile}
                  >
                    <Link href="/weight-log" className="truncate">
                      <ScrollText />
                      <span className="truncate">Weight Log</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/statistics"}
                    tooltip="Statistics"
                    onClick={handleCloseSidebarOnMobile}
                  >
                    <Link href="/statistics" className="truncate">
                      <BarChart3 />
                      <span className="truncate">Statistics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Weekly Progress</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    3/5 workouts
                  </span>
                  <span className="text-xs font-medium">60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

          <SidebarGroup>
            <SidebarGroupLabel className="flex justify-between items-center">
              <span>My Programs</span>
              <Link
                href="/my-programs"
                className="text-xs text-primary hover:underline"
                onClick={handleCloseSidebarOnMobile}
              >
                View
              </Link>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {workoutPrograms.map((program) => (
                  <SidebarMenuItem key={program.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/program/${program.id}`}
                      tooltip={program.name}
                    >
                      <Link
                        href={`/program/${program.id}`}
                        className="truncate"
                      >
                        <ListTodo />
                        <span className="truncate">{program.name}</span>
                        {program.isActive && (
                          <Badge
                            variant="outline"
                            className="ml-auto text-[10px] h-5 shrink-0"
                          >
                            Active
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === "/my-programs" &&
                      searchParams?.get("tab") === "create-program"
                    }
                    tooltip="Create Program"
                  >
                    <Link
                      href="/my-programs?tab=create-program"
                      className="truncate"
                      onClick={handleCloseSidebarOnMobile}
                    >
                      <Plus />
                      <span className="truncate">Create Program</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <UserProfileMenu />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </div>
  );
}

function UserProfileMenu() {
  const pathname = usePathname();
  const user = useSelector(selectCurrentUser);
  const { data: userInfo } = useGetAllUsersInfoQuery(user?.user_id || "");
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { setTheme, theme } = useTheme();
  const isMobile = useIsMobile();
  const [logout] = useLogoutMutation();

  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={buttonRef} className="relative">
        {userInfo ? (
          <SidebarMenuButton
            size="lg"
            tooltip="Account"
            className="max-w-full flex justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2 w-9/10">
              <Avatar
                className={`${
                  isCollapsed ? "h-7.5 w-7.5" : "h-9 w-9"
                } shrink-0`}
              >
                <AvatarImage src="#" alt="User" />
                <AvatarFallback className="bg-[#FE9496] text-white">
                  {userInfo?.data?.first_name?.charAt(0)}
                  {userInfo?.data?.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">
                  {userInfo?.data?.first_name} {userInfo?.data?.last_name}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {userInfo?.data?.email}
                </span>
              </div>
            </div>
            <EllipsisVertical className="h-4 w-4" />
          </SidebarMenuButton>
        ) : (
          <Skeleton
            className={`${isCollapsed ? "h-8 w-full" : "h-12 w-full"}`}
          />
        )}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-popover rounded-md border  overflow-hidden"
          style={{
            width: "16rem",
            bottom: !isMobile ? 10 : 65,
            left: isMobile
              ? 0
              : isCollapsed && !isMobile
              ? "3.5rem"
              : "16.5rem", // Simpler, more reliable positioning
          }}
        >
          <div className="p-2 text-sm font-medium border-b">My Account</div>
          <div className="p-1">
            <Link
              href="/profile"
              className={`flex items-center w-full text-left h-9 px-2 rounded-sm hover:bg-accent ${
                pathname === "/profile" ? "bg-accent" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center w-full text-left h-9 px-2 rounded-sm hover:bg-accent ${
                pathname === "/settings" ? "bg-accent" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="border-t"></div>
          <div className="p-2 text-sm font-medium border-b">Theme</div>
          <div className="p-1">
            <button
              className={`flex items-center w-full text-left h-9 px-2 rounded-sm ${
                theme === "light" ? "bg-accent font-medium" : "hover:bg-accent"
              }`}
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              className={`flex items-center w-full text-left h-9 px-2 rounded-sm ${
                theme === "dark" ? "bg-accent font-medium" : "hover:bg-accent"
              }`}
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </button>
            <button
              className={`flex items-center w-full text-left h-9 px-2 rounded-sm ${
                theme === "system" ? "bg-accent font-medium" : "hover:bg-accent"
              }`}
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>System</span>
            </button>
          </div>
          <div className="border-t"></div>
          <div className="p-1">
            <button
              className="flex items-center w-full text-left h-9 px-2 rounded-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function HeaderToggleButton() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? (
        <Menu className="h-4 w-4" />
      ) : (
        <Menu className="h-4 w-4" />
      )}
    </Button>
  );
}
