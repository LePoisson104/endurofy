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
  Apple,
  Palette,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogoutMutation } from "@/api/auth/auth-api-slice";
import { selectWorkoutProgram } from "@/api/workout-program/workout-program-slice";
import { selectUserInfo } from "@/api/user/user-slice";
import { isInCurrentRotation } from "@/helper/get-current-rotation";
import { WorkoutProgram } from "@/interfaces/workout-program-interfaces";
import { startOfWeek, endOfWeek } from "date-fns";
import { useGetCompletedWorkoutLogsQuery } from "@/api/workout-log/workout-log-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import CustomBadge from "../badges/custom-badge";
import { ThemeToggle } from "../buttons/theme-toggle";

export function AppSidebar() {
  const pathname = usePathname();
  const isDark = useGetCurrentTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { open, openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const workoutPrograms = useSelector(selectWorkoutProgram);
  const currentUser = useSelector(selectCurrentUser);
  const [activeProgram, setActiveProgram] = useState<WorkoutProgram | null>(
    null
  );

  const [currentStartingDate, setCurrentStartingDate] = useState<string | null>(
    null
  );
  const [currentEndingDate, setCurrentEndingDate] = useState<string | null>(
    null
  );

  const { data: completedWorkoutLogs } = useGetCompletedWorkoutLogsQuery(
    {
      userId: currentUser?.user_id,
      programId: activeProgram?.programId,
      startDate: currentStartingDate,
      endDate: currentEndingDate,
    },
    {
      skip:
        !currentStartingDate ||
        !currentEndingDate ||
        !currentUser?.user_id ||
        !activeProgram?.programId,
    }
  );

  useEffect(() => {
    const active = workoutPrograms?.filter((program) => program.isActive === 1);
    setActiveProgram(active?.[0] || null);
  }, [workoutPrograms]);

  useEffect(() => {
    if (activeProgram?.programType === "custom") {
      const { currentRotationStart, currentRotationEnd } =
        isInCurrentRotation(activeProgram);
      setCurrentStartingDate(currentRotationStart);
      setCurrentEndingDate(currentRotationEnd);
    } else {
      setCurrentStartingDate(
        startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString().split("T")[0]
      );
      setCurrentEndingDate(
        endOfWeek(new Date(), { weekStartsOn: 0 }).toISOString().split("T")[0]
      );
    }
  }, [activeProgram]);

  const handleCloseSidebarOnMobile = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

  const handleCreateProgramClick = () => {
    handleCloseSidebarOnMobile();
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "create-program");
    params.delete("programId");
    router.replace(`/my-programs?${params.toString()}`);
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
        <SidebarContent className={`overflow-x-hidden bg-card border-none`}>
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
                    isActive={pathname === "/food-log"}
                    tooltip="Food Log"
                    onClick={handleCloseSidebarOnMobile}
                  >
                    <Link href="/food-log" className="truncate">
                      <Apple />
                      <span className="truncate">Food Log</span>
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
                    isActive={pathname === "/analytics"}
                    tooltip="Analytics"
                    onClick={handleCloseSidebarOnMobile}
                  >
                    <Link href="/analytics" className="truncate">
                      <BarChart3 />
                      <span className="truncate">Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              {activeProgram?.programType === "dayOfWeek"
                ? "Weekly Progress"
                : activeProgram?.programType === "custom"
                ? "Rotation Progress"
                : "Workout Progress"}
            </SidebarGroupLabel>
            {workoutPrograms ? (
              <SidebarGroupContent>
                <div className="px-3 py-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">
                      {completedWorkoutLogs?.data || 0}/
                      {activeProgram?.programType === "manual"
                        ? completedWorkoutLogs?.data
                        : activeProgram?.workoutDays.length || 0}{" "}
                      workouts
                    </span>
                    <span className="text-xs font-medium">
                      {completedWorkoutLogs?.data
                        ? Math.round(
                            (completedWorkoutLogs?.data /
                              (activeProgram?.programType === "manual"
                                ? completedWorkoutLogs?.data
                                : activeProgram?.workoutDays.length || 0)) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (completedWorkoutLogs?.data /
                        (activeProgram?.programType === "manual"
                          ? completedWorkoutLogs?.data
                          : activeProgram?.workoutDays.length || 0)) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              </SidebarGroupContent>
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
          </SidebarGroup>

          <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

          <SidebarGroup>
            <SidebarGroupLabel className="flex justify-between items-center">
              {workoutPrograms ? (
                <span>
                  My Programs (
                  {
                    workoutPrograms.filter(
                      (program) => program.programType !== "manual"
                    ).length
                  }
                  /3)
                </span>
              ) : (
                <Skeleton className="h-4 w-30" />
              )}
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
                {workoutPrograms ? (
                  workoutPrograms
                    .filter((program) => program.programType !== "manual")
                    .map((program: any) => (
                      <SidebarMenuItem
                        key={program.programId}
                        onClick={handleCloseSidebarOnMobile}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname === `/my-programs` &&
                            searchParams?.get("programId") === program.programId
                          }
                          tooltip={program.programName}
                        >
                          <Link
                            href={`/my-programs?programId=${program.programId}`}
                            className="truncate"
                          >
                            <ListTodo />
                            <span className="truncate">
                              {program.programName}
                            </span>
                            {program.isActive === 1 && (
                              <CustomBadge title="Active" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                ) : (
                  <Skeleton className="h-15 w-full" />
                )}
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
                      onClick={handleCreateProgramClick}
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
  const userInfo = useSelector(selectUserInfo);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [logout, { isSuccess }] = useLogoutMutation();
  const router = useRouter();

  const { openMobile, setOpenMobile } = useSidebar();

  const handleCloseSidebarOnMobile = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

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

  useEffect(() => {
    if (isSuccess) {
      router.push("/login");
    }
  }, [isSuccess, router]);

  return (
    <>
      <div ref={buttonRef} className={`relative ${isMobile && "mb-5"}`}>
        {userInfo.email !== "" ? (
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
                  {userInfo?.first_name?.charAt(0).toUpperCase()}
                  {userInfo?.last_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">
                  {userInfo?.first_name?.charAt(0).toUpperCase()}
                  {userInfo?.first_name?.slice(1)}{" "}
                  {userInfo?.last_name?.charAt(0).toUpperCase()}
                  {userInfo?.last_name?.slice(1)}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {userInfo?.email}
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
          className={`fixed z-50 bg-card rounded-md overflow-hidden ${
            isMobile ? "border mb-5" : "border-none"
          }`}
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
              onClick={() => {
                setIsOpen(false);
                handleCloseSidebarOnMobile();
              }}
            >
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Profile</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center w-full text-left h-9 px-2 rounded-sm hover:bg-accent ${
                pathname === "/settings" ? "bg-accent" : ""
              }`}
              onClick={() => {
                setIsOpen(false);
                handleCloseSidebarOnMobile();
              }}
            >
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="border-t"></div>
          <ThemeToggle onClose={() => setIsOpen(false)} className="p-1" />
          <div className="border-t"></div>
          <div className="p-1">
            <button
              className="flex items-center w-full text-left h-9 px-2 rounded-sm hover:bg-accent"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
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
