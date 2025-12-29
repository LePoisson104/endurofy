"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRefreshMutation } from "@/api/auth/auth-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import DotPulse from "@/components/global/dot-pulse";
import {
  useGetAllUsersInfoQuery,
  useGetUsersMacrosGoalsQuery,
} from "@/api/user/user-api-slice";
import ProfileSuccessNotice from "@/components/modals/profile-success-notice";
import { useDispatch } from "react-redux";
import {
  calculateAndSetBMR,
  setUserInfo,
  setUserMacrosGoals,
} from "@/api/user/user-slice";
import { calculateBMI } from "@/helper/calculate-bmi";
import { useGetWorkoutProgramQuery } from "@/api/workout-program/workout-program-api-slice";
import {
  setWorkoutProgram,
  setIsLoading,
} from "@/api/workout-program/workout-program-slice";
import { useGetWeeklyWeightDifferenceQuery } from "@/api/weight-log/weight-log-api-slice";
import { setWeeklyRate } from "@/api/weight-log/weight-log-slice";
import { useGetSettingsQuery } from "@/api/settings/settings-api-slice";
import { useTheme } from "next-themes";
import Image from "next/image";
import OnboardingFlow from "../onboarding/onBoardingFlow";
import { format } from "date-fns";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const { setTheme } = useTheme();

  // open profile modal when user is not complete
  const [isOpen, setIsOpen] = useState(false);
  const [trueSuccess, setTrueSuccess] = useState(false);
  const [isProfileSuccessNoticeOpen, setIsProfileSuccessNoticeOpen] =
    useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const { data: settings, isLoading: isSettingsLoading } = useGetSettingsQuery({
    userId: user?.user_id,
  });

  const [refresh, { isLoading: isAuthLoading, isSuccess, isError }] =
    useRefreshMutation();

  const { data: userInfo, isLoading: isUserInfoLoading } =
    useGetAllUsersInfoQuery({
      userId: user?.user_id || "",
    });

  const { data: usersMacrosGoals, isLoading: isMacrosLoading } =
    useGetUsersMacrosGoalsQuery({
      userId: user?.user_id || "",
    });

  const { data: workoutProgram, isLoading: isWorkoutProgramLoading } =
    useGetWorkoutProgramQuery({
      userId: user?.user_id,
    });

  const { data: weeklyWeightDifference, isLoading: isWeeklyWeightLoading } =
    useGetWeeklyWeightDifferenceQuery(
      {
        userId: user?.user_id,
        currentDate: format(new Date(), "yyyy-MM-dd") + "T06:00:00.000Z",
      },
      {
        skip: !user?.user_id,
      }
    );

  console.log(format(new Date(), "yyyy-MM-dd") + "T06:00:00.000Z");

  // Check if all critical data has been loaded
  const isCriticalDataLoading =
    isAuthLoading ||
    isSettingsLoading ||
    isUserInfoLoading ||
    isMacrosLoading ||
    isWorkoutProgramLoading ||
    isWeeklyWeightLoading;

  const hasCriticalData =
    isSuccess &&
    trueSuccess &&
    settings !== undefined &&
    userInfo !== undefined &&
    usersMacrosGoals !== undefined &&
    workoutProgram !== undefined &&
    weeklyWeightDifference !== undefined;

  useEffect(() => {
    if (settings && !isSettingsLoading) {
      setTheme(settings?.data?.settings?.[0]?.theme);
    }
  }, [settings, isSettingsLoading, setTheme]);

  const verifyRefreshToken = async () => {
    try {
      await refresh().unwrap(); // Get the new token
      setTrueSuccess(true); // Mark successful refresh
    } catch (err) {
      console.log("Error refreshing token", err);
    }
  };

  // refreshs access token when refresh the page
  useEffect(() => {
    verifyRefreshToken();
  }, []);

  // Set isLoading to true on initial mount to ensure skeleton shows first
  useEffect(() => {
    dispatch(setIsLoading(true));
  }, [dispatch]);

  useEffect(() => {
    if (weeklyWeightDifference && !isWeeklyWeightLoading) {
      dispatch(setWeeklyRate(weeklyWeightDifference.data.weeklyDifference));
    }
  }, [weeklyWeightDifference, isWeeklyWeightLoading, dispatch]);

  // Handle workout program loading
  useEffect(() => {
    if (isWorkoutProgramLoading) {
      dispatch(setIsLoading(true));
    } else if (workoutProgram && !isWorkoutProgramLoading) {
      dispatch(setWorkoutProgram(workoutProgram.data.programs));
    }
  }, [isWorkoutProgramLoading, workoutProgram, dispatch]);

  // Handle profile status
  useEffect(() => {
    if (userInfo && !isUserInfoLoading) {
      if (userInfo?.data?.profile_status === "incomplete") {
        setIsOpen(true);
      } else if (userInfo?.data?.profile_status === "complete") {
        setIsOpen(false);
      }
    }
  }, [userInfo, isUserInfoLoading]);

  // Handle user info and macros goals
  useEffect(() => {
    if (
      userInfo?.data &&
      usersMacrosGoals?.data &&
      !isUserInfoLoading &&
      !isMacrosLoading
    ) {
      const bmiResults = calculateBMI(userInfo);
      dispatch(setUserInfo({ ...userInfo.data, ...bmiResults }));
      dispatch(calculateAndSetBMR());
      dispatch(setUserMacrosGoals(usersMacrosGoals.data));
    }
  }, [
    userInfo,
    usersMacrosGoals,
    isUserInfoLoading,
    isMacrosLoading,
    dispatch,
  ]);

  // Set initial data loaded flag and workout loading to false when all data is ready
  useEffect(() => {
    if (hasCriticalData && !isCriticalDataLoading && !isInitialDataLoaded) {
      setIsInitialDataLoaded(true);
      dispatch(setIsLoading(false));
    }
  }, [hasCriticalData, isCriticalDataLoading, isInitialDataLoaded, dispatch]);

  useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  // Show loading screen until all critical data is loaded
  if (isCriticalDataLoading || !hasCriticalData || !isInitialDataLoaded) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-black flex flex-col gap-4">
        <Image
          src={"/images/endurofy_logo.png"}
          alt="Endurofy"
          width={70}
          height={70}
        />
        <DotPulse />
      </div>
    );
  }

  // Handle authentication errors
  if (isError) {
    return null; // Let the useEffect handle the redirect
  }

  // Show onboarding if profile is incomplete
  if (isOpen) {
    return (
      <OnboardingFlow
        setIsProfileSuccessNoticeOpen={setIsProfileSuccessNoticeOpen}
        profileStatus={userInfo?.data?.profile_status}
      />
    );
  }

  // Show main app content
  return (
    <>
      <ProfileSuccessNotice
        open={isProfileSuccessNoticeOpen}
        setOpen={setIsProfileSuccessNoticeOpen}
      />
      {children}
    </>
  );
}
