"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRefreshMutation } from "@/api/auth/auth-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import DotPulse from "@/components/global/dot-pulse";
import UsersProfileModal from "@/components/modals/users-profile-modal";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const { setTheme } = useTheme();

  // open profile modal when user is not complete
  const [isOpen, setIsOpen] = useState(false);
  const [trueSuccess, setTrueSuccess] = useState(false);
  const [manualProfileClose, setManualProfileClose] = useState(false);
  const [isProfileSuccessNoticeOpen, setIsProfileSuccessNoticeOpen] =
    useState(false);
  const { data: settings } = useGetSettingsQuery({
    userId: user?.user_id,
  });

  const [refresh, { isLoading, isSuccess, isError }] = useRefreshMutation();

  const { data: userInfo, refetch } = useGetAllUsersInfoQuery({
    userId: user?.user_id || "",
  });

  const { data: usersMacrosGoals } = useGetUsersMacrosGoalsQuery({
    userId: user?.user_id || "",
  });

  const { data: workoutProgram, isLoading: isWorkoutProgramLoading } =
    useGetWorkoutProgramQuery({
      userId: user?.user_id,
    });

  const { data: weeklyWeightDifference } = useGetWeeklyWeightDifferenceQuery({
    userId: user?.user_id,
  });

  useEffect(() => {
    if (settings) {
      setTheme(settings.data.settings?.[0].theme);
    }
  }, [settings, dispatch]);

  const verifyRefreshToken = async () => {
    try {
      await refresh().unwrap(); // Get the new token
      setTrueSuccess(true); // Mark successful refresh
    } catch (err) {
      console.log("Error refreshing token");
    }
  };

  // refreshs access token when refresh the page
  useEffect(() => {
    verifyRefreshToken();
  }, []);

  // Set isLoading to true on initial mount to ensure skeleton shows first
  useEffect(() => {
    // Set loading to true by default on component mount
    dispatch(setIsLoading(true));
  }, [dispatch]);

  useEffect(() => {
    if (weeklyWeightDifference) {
      dispatch(setWeeklyRate(weeklyWeightDifference.data.weeklyDifference));
    }
  }, [weeklyWeightDifference, dispatch]);

  useEffect(() => {
    if (isWorkoutProgramLoading) {
      dispatch(setIsLoading(true));
    } else if (workoutProgram) {
      // Only set loading to false when we have data
      dispatch(setIsLoading(false));
      dispatch(setWorkoutProgram(workoutProgram.data.programs));
    }
  }, [isWorkoutProgramLoading, workoutProgram, dispatch]);

  useEffect(() => {
    if (
      userInfo?.data?.profile_status === "incomplete" &&
      !manualProfileClose
    ) {
      setIsOpen(true);
    } else if (userInfo?.data?.profile_status === "complete") {
      setIsOpen(false);
    }
  }, [userInfo, manualProfileClose]);

  useEffect(() => {
    if (userInfo?.data && usersMacrosGoals?.data) {
      const bmiResults = calculateBMI(userInfo);
      dispatch(setUserInfo({ ...userInfo.data, ...bmiResults }));
      dispatch(calculateAndSetBMR());
      dispatch(setUserMacrosGoals(usersMacrosGoals.data));
    }
  }, [userInfo, usersMacrosGoals, dispatch]);

  useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  // This function will be passed to the UsersProfileModal to handle the proper state transitions
  const handleProfileSuccess = () => {
    setManualProfileClose(true); // Prevent auto-opening based on userInfo
    setIsOpen(false);
    setIsProfileSuccessNoticeOpen(true);
    // Refetch user info to get the updated profile status
    refetch();
  };

  let content;
  if (isLoading) {
    content = (
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
  } else if (isSuccess && trueSuccess) {
    if (isOpen) {
      content = (
        <>
          {children}
          <UsersProfileModal
            isOpen={isOpen}
            profileStatus={userInfo?.data?.profile_status}
            setIsProfileSuccessNoticeOpen={handleProfileSuccess}
          />
        </>
      );
    } else {
      content = (
        <>
          <ProfileSuccessNotice
            open={isProfileSuccessNoticeOpen}
            setOpen={setIsProfileSuccessNoticeOpen}
          />
          {children}
        </>
      );
    }
  }

  return content;
}
