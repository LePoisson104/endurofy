"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ErrorAlert from "@/components/alerts/error-alert";
import FeetInchesSelect from "../selects/feet-inches-select";
import { useUpdateUsersProfileMutation } from "@/api/user/user-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { Loader2 } from "lucide-react";

interface UsersProfileModalProps {
  isOpen: boolean;
  profileStatus: string;
  setIsProfileSuccessNoticeOpen: (isSuccess: boolean) => void;
}

interface FormData {
  gender: string;
  birth_date: string;
  height: number;
  height_unit: string;
  weight: number;
  weight_unit: string;
  weight_goal: number;
  activity_level: string;
  goal: string;
  profile_status: string;
}

// Conversion constants
const CM_TO_INCHES = 0.393701;
const INCHES_TO_CM = 2.54;
const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;

export default function UsersProfileModal({
  isOpen,
  profileStatus,
  setIsProfileSuccessNoticeOpen,
}: UsersProfileModalProps) {
  const user = useSelector(selectCurrentUser);
  const [error, setError] = useState<string | null>(null);
  const [updateUserProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUsersProfileMutation();

  const [formData, setFormData] = useState<FormData>({
    gender: "",
    birth_date: "",
    height: 0,
    height_unit: "ft",
    weight: 0,
    weight_unit: "lb",
    weight_goal: 0,
    activity_level: "sedentary",
    goal: "",
    profile_status: profileStatus,
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.gender === "" ||
      formData.birth_date === "" ||
      formData.height === 0 ||
      formData.weight === 0 ||
      formData.weight_goal === 0 ||
      formData.activity_level === "" ||
      formData.goal === ""
    ) {
      setError("Please fill out all fields");
      return;
    }

    try {
      await updateUserProfile({
        userId: user?.user_id || "",
        payload: {
          ...formData,
          weight_goal_unit: formData.weight_unit,
        },
      }).unwrap();
      setFormData({
        gender: "",
        birth_date: "",
        height: 0,
        height_unit: "ft",
        weight: 0,
        weight_unit: "lb",
        weight_goal: 0,
        activity_level: "sedentary",
        goal: "",
        profile_status: "",
      });
      setIsProfileSuccessNoticeOpen(true);
    } catch (err: any) {
      if (err.status === 400) {
        setError(err.data?.message || "Failed to update profile");
      } else {
        setError("Failed to update profile");
      }
    }
  };

  // Generic input change handler
  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle height unit changes with proper conversion
  const handleHeightUnitChange = (newUnit: string) => {
    // Make a direct conversion without relying on the previous state update
    if (newUnit !== formData.height_unit) {
      // Get the current height value (default to 0 if empty)
      const currentHeight = formData.height ? Number(formData.height) : 0;
      let newHeight: number;

      if (newUnit === "cm" && formData.height_unit === "ft") {
        // Convert from inches to cm
        newHeight = Math.round(currentHeight * INCHES_TO_CM);
      } else if (newUnit === "ft" && formData.height_unit === "cm") {
        // Convert from cm to inches
        newHeight = Math.round(currentHeight * CM_TO_INCHES);
      } else {
        // No conversion needed
        newHeight = currentHeight;
      }

      // Update both in a single state update to avoid intermediate renders
      setFormData((prev) => ({
        ...prev,
        height_unit: newUnit,
        height: newHeight,
      }));
    }
  };

  // Handle weight unit changes with proper conversion
  const handleWeightUnitChange = (newUnit: string) => {
    const currentUnit = formData.weight_unit;
    const currentWeight = formData.weight;
    const goalWeight = formData.weight_goal;

    let newCurrentWeight = currentWeight;
    let newGoalWeight = goalWeight;

    if (currentWeight && newUnit !== currentUnit) {
      if (newUnit === "kg" && currentUnit === "lb") {
        // Convert lb to kg
        newCurrentWeight = Number((currentWeight * LB_TO_KG).toFixed(2));
      } else if (newUnit === "lb" && currentUnit === "kg") {
        // Convert kg to lb
        newCurrentWeight = Number((currentWeight * KG_TO_LB).toFixed(2));
      }
    }

    if (goalWeight && newUnit !== currentUnit) {
      if (newUnit === "kg" && currentUnit === "lb") {
        // Convert lb to kg
        newGoalWeight = Number((goalWeight * LB_TO_KG).toFixed(2));
      } else if (newUnit === "lb" && currentUnit === "kg") {
        // Convert kg to lb
        newGoalWeight = Number((goalWeight * KG_TO_LB).toFixed(2));
      }
    }

    // Update all weight-related fields at once
    setFormData((prev) => ({
      ...prev,
      weight: newCurrentWeight,
      weight_goal: newGoalWeight,
      weight_goal_unit: newUnit,
    }));
  };

  // Special handler for feet/inches selection
  const handleFeetInchesChange = (totalInches: number) => {
    updateField("height", totalInches);
  };

  return (
    <>
      <ErrorAlert error={error} setError={setError} />
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your information to continue
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => updateField("gender", value)}
                      required
                      className="flex flex-row gap-6"
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
                  <div className="space-y-2">
                    <Label>Birth Date</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date || ""}
                      onChange={(e) =>
                        updateField("birth_date", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Information</CardTitle>
                <CardDescription>
                  Height, weight, and fitness goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col grid-cols-1 gap-4">
                  {/* Height Section */}
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <div className="flex gap-2">
                      {formData.height_unit === "ft" ? (
                        <FeetInchesSelect
                          value={formData.height.toString()}
                          onChange={handleFeetInchesChange}
                        />
                      ) : (
                        <Input
                          id="height"
                          type="number"
                          placeholder="Height in cm"
                          value={formData.height.toString()}
                          onChange={(e) => {
                            let value = Number.parseFloat(e.target.value);

                            // Ensure the value stays within the allowed range
                            if (value < 1) value = 1;
                            if (value > 251) value = 251;
                            updateField("height", value);
                          }}
                          className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      )}
                      <Select
                        value={formData.height_unit}
                        onValueChange={handleHeightUnitChange}
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

                  {/* Current Weight Section */}
                  <div className="space-y-2">
                    <Label htmlFor="weight">Current Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        id="weight"
                        placeholder="Weight"
                        type="number"
                        value={formData.weight || ""}
                        onChange={(e) => {
                          let value = Number.parseFloat(e.target.value);

                          // Ensure the value stays within the allowed range
                          if (value < 1) value = 1;
                          if (value > 1000) value = 1000;
                          updateField("weight", value);
                        }}
                        required
                        className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Select
                        value={formData.weight_unit}
                        onValueChange={handleWeightUnitChange}
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

                  {/* Goal Weight Section */}
                  <div className="space-y-2">
                    <Label htmlFor="weight_goal">Goal Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        id="weight_goal"
                        placeholder="Goal Weight"
                        type="number"
                        value={formData.weight_goal || ""}
                        onChange={(e) => {
                          let value = Number.parseFloat(e.target.value);

                          // Ensure the value stays within the allowed range
                          if (value < 1) value = 1;
                          if (value > 1000) value = 1000;
                          updateField("weight_goal", value);
                        }}
                        required
                        className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Select
                        value={formData.weight_unit}
                        onValueChange={handleWeightUnitChange}
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

                  {/* Activity Level Section */}
                  <div className="space-y-2">
                    <Label htmlFor="activity_level">Activity Level</Label>
                    <Select
                      value={formData.activity_level || ""}
                      onValueChange={(value) =>
                        updateField("activity_level", value)
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

                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Select
                      value={formData.goal || ""}
                      onValueChange={(value) => updateField("goal", value)}
                    >
                      <SelectTrigger id="goal" className="w-full">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">Lose Weight</SelectItem>
                        <SelectItem value="gain">Gain Weight</SelectItem>
                        <SelectItem value="maintain">
                          Maintain Weight
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
