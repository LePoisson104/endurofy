"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSelector, useDispatch } from "react-redux";
import { selectUserInfo, calculateAndSetBMR } from "@/api/user/user-slice";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateWeightUnitNotice from "@/components/modals/update-weight-unit-notice";
import { UpdateUserInfo } from "@/interfaces/user-interfaces";
import ProfileHeader from "./profile-header";
import { convertDateForDisplay } from "@/lib/date-utils";

// Dynamic imports for code splitting
const ProfileDisplay = dynamic(() => import("./profile-display"), {
  loading: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-[360px] w-full" />
      <Skeleton className="h-[360px] w-full" />
      <Skeleton className="h-[380px] w-full md:col-span-2" />
    </div>
  ),
  ssr: false, // Since it depends on Redux state
});

// Heavy form component - only load when editing
const ProfileEditForm = dynamic(() => import("./profile-edit-form"), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
  ssr: false,
});

export default function ProfilePage() {
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdateWeightUnitNoticeOpen, setIsUpdateWeightUnitNoticeOpen] =
    useState(false);
  const [editedProfile, setEditedProfile] = useState<UpdateUserInfo | null>(
    null
  );

  useEffect(() => {
    if (userInfo) {
      dispatch(calculateAndSetBMR());
    }
  }, [userInfo, dispatch]);

  // Initialize editedProfile when entering edit mode or when userInfo changes
  useEffect(() => {
    if (userInfo) {
      setEditedProfile({
        current_weight: userInfo?.current_weight || 0,
        current_weight_unit: userInfo?.current_weight_unit || "",
        gender: userInfo?.gender || "",
        birth_date: convertDateForDisplay(userInfo?.birth_date || ""),
        height: userInfo?.height || 0,
        height_unit: userInfo?.height_unit || "",
        starting_weight: userInfo?.starting_weight || 0,
        starting_weight_unit: userInfo?.starting_weight_unit || "",
        activity_level: userInfo?.activity_level || "",
        weight_goal: userInfo?.weight_goal || 0,
        weight_goal_unit: userInfo?.weight_goal_unit || "",
        goal: userInfo?.goal || "",
        profile_status: userInfo?.profile_status || "",
      });
    }
  }, [userInfo, isEditing]);

  // Show skeleton while loading
  if (!userInfo || userInfo?.profile_status !== "complete") {
    return (
      <div className="container mx-auto p-[1rem] max-w-7xl">
        <div className="flex flex-col gap-6">
          <Skeleton className="md:h-[240px] sm:h-[350px] w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[360px] w-full" />
            <Skeleton className="h-[360px] w-full" />
          </div>
          <Skeleton className="h-[380px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-[1rem] max-w-7xl">
      <UpdateWeightUnitNotice
        isOpen={isUpdateWeightUnitNoticeOpen}
        setIsOpen={setIsUpdateWeightUnitNoticeOpen}
        editedProfile={editedProfile}
        setIsEditing={setIsEditing}
      />

      <div className="flex flex-col gap-6">
        {/* Profile Header - Always visible */}
        <ProfileHeader
          onEdit={() => setIsEditing(true)}
          isEditing={isEditing}
        />

        {/* Conditional Content with Code Splitting */}
        {isEditing ? (
          <ProfileEditForm
            editedProfile={editedProfile}
            setEditedProfile={setEditedProfile}
            setIsEditing={setIsEditing}
            setIsUpdateWeightUnitNoticeOpen={setIsUpdateWeightUnitNoticeOpen}
          />
        ) : (
          <ProfileDisplay />
        )}
      </div>
    </div>
  );
}
