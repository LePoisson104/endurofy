"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateInput } from "@/components/ui/date-input";
import { Loader2 } from "lucide-react";
import FeetInchesSelect from "@/components/selects/feet-inches-select";
import { UpdateUserInfo } from "@/interfaces/user-interfaces";
import { useUpdateUsersProfileMutation } from "@/api/user/user-api-slice";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { selectUserInfo } from "@/api/user/user-slice";
import { useSelector } from "react-redux";
import { convertDateForSubmission } from "@/lib/date-utils";

interface ProfileEditFormProps {
  editedProfile: UpdateUserInfo | null;
  setEditedProfile: React.Dispatch<React.SetStateAction<UpdateUserInfo | null>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setErrMsg: React.Dispatch<React.SetStateAction<string>>;
  setSuccessMsg: React.Dispatch<React.SetStateAction<string>>;
  setIsUpdateWeightUnitNoticeOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

export default function ProfileEditForm({
  editedProfile,
  setEditedProfile,
  setIsEditing,
  setErrMsg,
  setSuccessMsg,
  setIsUpdateWeightUnitNoticeOpen,
}: ProfileEditFormProps) {
  const user = useSelector(selectCurrentUser);
  const userInfo = useSelector(selectUserInfo);
  const [updateUserProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUsersProfileMutation();

  // Handle form input changes
  const handleInputChange = (
    field: keyof UpdateUserInfo,
    value: number | Date | string
  ) => {
    setEditedProfile((prevProfile) => {
      if (!prevProfile) return null; // Ensure there is an existing profile

      return {
        ...prevProfile,
        [field]: value,
      };
    });
  };

  const handleUpdateProfile = async () => {
    const allFieldsFilled = editedProfile
      ? Object.values(editedProfile).every(
          (value) => value !== null && value !== undefined && value !== ""
        )
      : false;
    if (!allFieldsFilled) {
      setErrMsg("All fields are required");
      return;
    }

    if (editedProfile?.current_weight_unit !== userInfo?.current_weight_unit) {
      setIsUpdateWeightUnitNoticeOpen(true);
      return;
    }

    try {
      if (!editedProfile) return;

      // Convert birth_date from MM/DD/YYYY to YYYY-MM-DD for backend
      const submissionPayload = {
        ...editedProfile,
        birth_date: convertDateForSubmission(editedProfile.birth_date || ""),
      };

      await updateUserProfile({
        userId: user?.user_id || "",
        payload: submissionPayload,
      }).unwrap();

      setIsEditing(false);
      setSuccessMsg("Profile updated successfully");
    } catch (error: any) {
      if (!error.status) {
        setErrMsg("No Server Response");
      } else if (error.status === 400) {
        setErrMsg(error.data?.message);
      } else {
        setErrMsg(error.data?.message);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal health information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Selection */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            value={editedProfile?.gender || ""}
            onValueChange={(value) => handleInputChange("gender", value)}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Birthday */}
        <DateInput
          id="birth_date"
          label="Date of Birth"
          value={editedProfile?.birth_date || ""}
          onChange={(date) => {
            handleInputChange("birth_date", date);
          }}
        />

        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <div className="flex gap-2">
            {editedProfile?.height_unit === "ft" ? (
              <FeetInchesSelect
                value={editedProfile?.height?.toString() || "0"}
                onChange={(totalInches) => {
                  handleInputChange("height", totalInches);
                }}
              />
            ) : (
              <Input
                id="height"
                type="number"
                value={editedProfile?.height || ""}
                onChange={(e) => {
                  let value = Number.parseFloat(e.target.value);

                  // Ensure the value stays within the allowed range
                  if (value < 1) value = 1;
                  if (value > 251) value = 251;

                  handleInputChange("height", value);
                }}
                min={1}
                max={251}
                className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            )}
            <Select
              value={editedProfile?.height_unit}
              onValueChange={(value) => {
                if (value === "ft") {
                  // Convert from cm to inches
                  const inches = Math.round(
                    Number(editedProfile?.height) / 2.54
                  );
                  handleInputChange("height", inches);
                } else {
                  // Convert from inches to cm
                  const cm = Math.round(Number(editedProfile?.height) * 2.54);
                  handleInputChange("height", cm);
                }
                handleInputChange("height_unit", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ft">US units</SelectItem>
                <SelectItem value="cm">Metric units (cm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <Label htmlFor="goal">Goal</Label>
          <Select
            defaultValue={userInfo?.goal || ""}
            onValueChange={(value) => {
              handleInputChange("goal", value);
              if (value === "maintain") {
                handleInputChange(
                  "weight_goal",
                  editedProfile?.starting_weight || 0
                );
              }
            }}
          >
            <SelectTrigger id="goal" className="w-full">
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose">Lose Weight</SelectItem>
              <SelectItem value="gain">Gain Weight</SelectItem>
              <SelectItem value="maintain">Maintain Weight</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Weight */}
        <div className="space-y-2">
          <Label htmlFor="currentWeight">Current Weight</Label>
          <div className="flex gap-2">
            <Input
              id="weight"
              type="number"
              value={editedProfile?.current_weight?.toString() || ""}
              onChange={(e) => {
                let value = Number.parseFloat(e.target.value);
                if (value < 1) value = 1;
                if (value > 1000) value = 1000;
                handleInputChange("starting_weight", value);
                handleInputChange("current_weight", value);
                if (editedProfile?.goal === "maintain") {
                  handleInputChange("weight_goal", value);
                }
              }}
              className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm"
            />
            <Select
              value={editedProfile?.current_weight_unit || "kg"}
              onValueChange={(value) => {
                let newCurrentWeight = Number(
                  editedProfile?.current_weight || 0
                );
                let newGoalWeight = Number(editedProfile?.weight_goal || 0);
                let newStartingWeight = Number(
                  editedProfile?.starting_weight || 0
                );

                if (
                  value === "lb" &&
                  editedProfile?.current_weight_unit === "kg"
                ) {
                  // Convert from kg to lbs
                  newCurrentWeight = Math.round(newCurrentWeight * 2.20462);
                  newStartingWeight = Math.round(newStartingWeight * 2.20462);
                  newGoalWeight = Math.round(newGoalWeight * 2.20462);
                } else if (
                  value === "kg" &&
                  editedProfile?.current_weight_unit === "lb"
                ) {
                  // Convert from lbs to kg
                  newCurrentWeight = Math.round(newCurrentWeight / 2.20462);
                  newStartingWeight = Math.round(newStartingWeight / 2.20462);
                  newGoalWeight = Math.round(newGoalWeight / 2.20462);
                }
                handleInputChange(
                  "current_weight",
                  Number(newCurrentWeight.toFixed(2))
                );
                handleInputChange(
                  "starting_weight",
                  Number(newStartingWeight.toFixed(2))
                );
                handleInputChange(
                  "weight_goal",
                  Number(newGoalWeight.toFixed(2))
                );
                handleInputChange("starting_weight_unit", value);
                handleInputChange("weight_goal_unit", value);
                handleInputChange("current_weight_unit", value);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lb">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Goal Weight */}
        {(editedProfile?.goal === "lose" || editedProfile?.goal === "gain") && (
          <div className="space-y-2">
            <Label htmlFor="goalWeight">Goal Weight</Label>
            <div className="flex gap-2">
              <Input
                id="weight_goal"
                type="number"
                value={editedProfile?.weight_goal?.toString() || ""}
                onChange={(e) => {
                  let value = Number.parseFloat(e.target.value);
                  if (value < 1) value = 1;
                  if (value > 1000) value = 1000;
                  handleInputChange("weight_goal", value);
                }}
                className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm"
              />
              <div className="w-[100px] text-center flex items-center justify-center text-muted-foreground">
                {editedProfile?.starting_weight_unit === "lb" ? "lbs" : "kg"}
              </div>
            </div>
          </div>
        )}

        {/* Activity Level */}
        <div className="space-y-2">
          <Label htmlFor="activity_level">Activity Level</Label>
          <Select
            defaultValue={userInfo?.activity_level || ""}
            onValueChange={(value) =>
              handleInputChange("activity_level", value)
            }
          >
            <SelectTrigger id="activity_level" className="w-full">
              <SelectValue placeholder="Select activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">
                Sedentary (little or no exercise)
              </SelectItem>
              <SelectItem value="lightly_active">
                Lightly Active (light exercise 1-3 days/week)
              </SelectItem>
              <SelectItem value="moderately_active">
                Moderately Active (moderate exercise 3-5 days/week)
              </SelectItem>
              <SelectItem value="very_active">
                Very Active (hard exercise 6-7 days/week)
              </SelectItem>
              <SelectItem value="extra_active">
                Extremely Active (very hard exercise, physical job)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdateProfile}
          disabled={isUpdatingProfile}
          className="w-[130px]"
        >
          {isUpdatingProfile ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
