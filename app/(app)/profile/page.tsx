"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Edit, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import BMIIndicator from "@/components/global/bmi-indicator";
import { useGetAllUsersInfoQuery } from "@/api/user/user-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { calculateBMI } from "@/helper/calculate-bmi";
import { getActivityMultiplier } from "@/helper/constants/activity-level-contants";
import {
  convertHeight,
  convertWeight,
  getHeightInFeetAndMeters,
} from "@/helper/weight-height-converter";
import { convertDateFormat } from "@/helper/convert-date-format";
import FeetInchesSelect from "@/components/selects/feet-inches-select";
import { UpdateUserInfo } from "@/interfaces/user-interfaces";

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const { data: userInfo } = useGetAllUsersInfoQuery(user?.user_id);
  const age =
    new Date().getFullYear() -
    new Date(userInfo?.data?.birth_date).getFullYear();
  // console.log(userInfo);

  const [editedProfile, setEditedProfile] = useState<UpdateUserInfo | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  console.log(editedProfile);
  const [bmi, setBmi] = useState(0);
  const [bmiCategory, setBmiCategory] = useState("");
  const [bmiCategoryColor, setBmiCategoryColor] = useState("");
  const [userHeight, setUserHeight] = useState("");
  const lastUpdated = convertDateFormat(
    userInfo?.data?.user_profile_updated_at
  );
  // Run calculations when `profile` or `weightHistoryData` changes
  useEffect(() => {
    if (!userInfo) return;
    const bmiResults = calculateBMI(userInfo);
    setBmi(bmiResults?.bmi || 0);
    setBmiCategory(bmiResults?.bmiCategory || "");
    setBmiCategoryColor(bmiResults?.bmiCategoryColor || "");
    const heightInFeetAndMeters = getHeightInFeetAndMeters(
      userInfo?.data?.height,
      userInfo?.data?.height_unit
    );
    setUserHeight(heightInFeetAndMeters || "");
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) {
      setEditedProfile({
        data: {
          gender: userInfo.data.gender,
          birth_date: userInfo.data.birth_date,
          height: userInfo.data.height,
          height_unit: userInfo.data.height_unit,
          weight: userInfo.data.weight,
          weight_unit: userInfo.data.weight_unit,
          activity_level: userInfo.data.activity_level,
          weight_goal: userInfo.data.weight_goal,
          weight_goal_unit: userInfo.data.weight_goal_unit,
          goal: userInfo.data.goal,
          profile_status: userInfo.data.profile_status,
        },
      });
    }
  }, [userInfo]);

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (bmr: number) => {
    return Math.round(
      bmr * getActivityMultiplier(userInfo?.data?.activity_level || "")
    );
  };

  // Handle form input changes
  const handleInputChange = (
    field: keyof UpdateUserInfo["data"],
    value: number | Date | string
  ) => {
    setEditedProfile((prevProfile) => {
      if (!prevProfile) return null; // Ensure there is an existing profile
      return {
        ...prevProfile,
        data: {
          ...prevProfile.data,
          [field]: value,
        },
      };
    });
  };

  return (
    <div className="container mx-auto p-[1rem] max-w-7xl">
      {userInfo ? (
        <div className="flex flex-col gap-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-muted">
                  <AvatarImage src="#" alt="Profile picture" />
                  <AvatarFallback className="text-2xl font-bold bg-red-300 text-white">
                    {userInfo?.data?.first_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                    {userInfo?.data?.last_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold">
                    {userInfo?.data?.first_name} {userInfo?.data?.last_name}
                  </h1>
                  <p className="text-muted-foreground">
                    {userInfo?.data?.email}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      <User className="h-3.5 w-3.5" />
                      <span>
                        {userInfo?.data?.gender === "male" ? "Male" : "Female"}
                      </span>
                    </div>
                    <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      Age: {age}
                    </div>
                    <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      Height: {userHeight} (
                      {getHeightInFeetAndMeters(
                        Math.round(
                          convertHeight(
                            userInfo?.data?.height,
                            userInfo?.data?.height_unit
                          )
                        ),
                        userInfo?.data?.height_unit === "cm" ? "ft" : "cm"
                      )}
                      )
                    </div>
                  </div>
                </div>

                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Edit profile card */}
          {isEditing ? (
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
                    value={editedProfile?.data?.gender || ""}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
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
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editedProfile?.data?.birth_date &&
                            "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedProfile?.data?.birth_date ? (
                          format(
                            new Date(editedProfile?.data?.birth_date),
                            "PPP"
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          new Date(
                            editedProfile?.data?.birth_date || new Date()
                          )
                        }
                        onSelect={(date) =>
                          date &&
                          handleInputChange("birth_date", date.toISOString())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <div className="flex gap-2">
                    {editedProfile?.data?.height_unit === "ft" ? (
                      <FeetInchesSelect
                        value={editedProfile?.data?.height?.toString() || "0"}
                        onChange={(totalInches) => {
                          handleInputChange("height", totalInches);
                        }}
                      />
                    ) : (
                      <Input
                        id="height"
                        type="number"
                        value={editedProfile?.data?.height || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "height",
                            Number.parseFloat(e.target.value)
                          )
                        }
                        className="flex-1"
                      />
                    )}
                    <Select
                      value={editedProfile?.data?.height_unit}
                      onValueChange={(value) => {
                        if (value === "ft") {
                          // Convert from cm to inches
                          const inches = Math.round(
                            Number(editedProfile?.data?.height) / 2.54
                          );
                          handleInputChange("height", inches);
                        } else {
                          // Convert from inches to cm
                          const cm = Math.round(
                            Number(editedProfile?.data?.height) * 2.54
                          );
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

                {/* Current Weight */}
                <div className="space-y-2">
                  <Label htmlFor="currentWeight">Current Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight"
                      type="number"
                      value={editedProfile?.data?.weight || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "weight",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <Select
                      value={editedProfile?.data?.weight_unit || "kg"}
                      onValueChange={(value) => {
                        const currentWeight = Number(
                          editedProfile?.data?.weight || 0
                        );
                        const goalWeight = Number(
                          editedProfile?.data?.weight_goal || 0
                        );
                        let newCurrentWeight = currentWeight;
                        let newGoalWeight = goalWeight;

                        if (
                          value === "lb" &&
                          editedProfile?.data?.weight_unit === "kg"
                        ) {
                          // Convert from kg to lbs
                          newCurrentWeight = currentWeight * 2.20462;
                          newGoalWeight = goalWeight * 2.20462;
                        } else if (
                          value === "kg" &&
                          editedProfile?.data?.weight_unit === "lb"
                        ) {
                          // Convert from lbs to kg
                          newCurrentWeight = currentWeight / 2.20462;
                          newGoalWeight = goalWeight / 2.20462;
                        }

                        handleInputChange(
                          "weight",
                          Number(newCurrentWeight.toFixed(2))
                        );
                        handleInputChange(
                          "weight_goal",
                          Number(newGoalWeight.toFixed(2))
                        );
                        handleInputChange("weight_unit", value);
                        handleInputChange("weight_goal_unit", value);
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
                <div className="space-y-2">
                  <Label htmlFor="goalWeight">Goal Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="weight_goal"
                      type="number"
                      value={editedProfile?.data?.weight_goal || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "weight_goal",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <div className="w-[100px] text-center flex items-center justify-center text-muted-foreground">
                      {editedProfile?.data?.weight_unit === "lb" ? "lbs" : "kg"}
                    </div>
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-2">
                  <Label htmlFor="activity_level">Activity Level</Label>
                  <Select
                    defaultValue={userInfo?.data?.activity_level || ""}
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
                <Button onClick={() => setIsEditing(false)}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              {/* Current Metrics Display */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {lastUpdated}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Gender
                        </h3>
                        <p className="text-lg font-medium capitalize">
                          {userInfo?.data?.gender}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Age
                        </h3>
                        <p className="text-lg font-medium">{age} years old</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Birthday
                      </h3>
                      <p className="text-lg font-medium">
                        {userInfo?.data?.birth_date
                          ? format(new Date(userInfo?.data?.birth_date), "PPP")
                          : ""}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Height
                      </h3>
                      <p className="text-lg font-medium">
                        {userHeight} (
                        {getHeightInFeetAndMeters(
                          Math.round(
                            convertHeight(
                              userInfo?.data?.height,
                              userInfo?.data?.height_unit
                            )
                          ),
                          userInfo?.data?.height_unit === "cm" ? "ft" : "cm"
                        )}
                        )
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Weight & BMI Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weight & BMI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Current Weight
                        </h3>
                        <p className="text-lg font-medium">
                          {userInfo?.data?.weight} {userInfo?.data?.weight_unit}{" "}
                          (
                          {convertWeight(
                            userInfo?.data?.weight,
                            userInfo?.data?.weight_unit
                          )}{" "}
                          {userInfo?.data?.weight_unit === "lb" ? "kg" : "lbs"})
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Goal Weight
                        </h3>
                        <p className="text-lg font-medium">
                          {userInfo?.data?.weight_goal}{" "}
                          {userInfo?.data?.weight_goal_unit} (
                          {convertWeight(
                            userInfo?.data?.weight_goal,
                            userInfo?.data?.weight_goal_unit
                          )}{" "}
                          {userInfo?.data?.weight_goal_unit === "lb"
                            ? "kg"
                            : "lbs"}
                          )
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          BMI (Body Mass Index)
                        </h3>
                        <span
                          className={`text-sm font-medium ${bmiCategoryColor}`}
                        >
                          {bmiCategory}
                        </span>
                      </div>
                      <p className="text-3xl font-bold mt-1">{bmi}</p>

                      {/* BMI Scale Visualization */}
                      <div className="mt-4">
                        <BMIIndicator
                          bmi={bmi}
                          bmiCategory={bmiCategory}
                          showLabels={true}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* BMR & Activity Level Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Metabolic Rate & Activity</CardTitle>
                    <CardDescription>
                      Your energy expenditure based on your metrics and activity
                      level
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Basal Metabolic Rate (BMR)
                          </h3>
                          <p className="text-3xl font-bold mt-1">
                            {Math.round(userInfo?.data?.BMR.toString())}{" "}
                            calories/day
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            The number of calories your body needs to maintain
                            basic functions at rest
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Activity Level
                          </h3>
                          <p className="text-lg font-medium capitalize mt-1">
                            {userInfo?.data?.activity_level.includes("_")
                              ? userInfo?.data?.activity_level.replace("_", " ")
                              : userInfo?.data?.activity_level}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {userInfo?.data?.activity_level === "sedentary" &&
                              "Little or no exercise"}
                            {userInfo?.data?.activity_level ===
                              "lightly_active" &&
                              "Light exercise 1-3 days/week"}
                            {userInfo?.data?.activity_level ===
                              "moderately_active" &&
                              "Moderate exercise 4-5 days/week"}
                            {userInfo?.data?.activity_level === "very_active" &&
                              "Intense exercise 6-7 days/week"}
                            {userInfo?.data?.activity_level ===
                              "extra_active" &&
                              "Very intensive exercise, physical job or twice daily training"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Total Daily Energy Expenditure (TDEE)
                          </h3>
                          <p className="text-3xl font-bold mt-1">
                            {calculateTDEE(userInfo?.data?.BMR)} calories/day
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            The total calories you burn each day based on your
                            BMR and activity level
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Weight Management
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="bg-primary/10 rounded-lg p-3">
                              <p className="text-sm font-medium">
                                To Lose Weight ~{" "}
                                {userInfo?.data?.weight_unit === "lb"
                                  ? "1lb/week"
                                  : "0.5kg/week"}
                              </p>
                              <p className="text-lg font-bold">
                                {calculateTDEE(userInfo?.data?.BMR) - 500}{" "}
                                cal/day
                              </p>
                              <p className="text-xs text-muted-foreground">
                                500 calorie deficit
                              </p>
                            </div>
                            <div className="bg-primary/10 rounded-lg p-3">
                              <p className="text-sm font-medium">
                                To Gain Weight ~{" "}
                                {userInfo?.data?.weight_unit === "lb"
                                  ? "1lb/week"
                                  : "0.5kg/week"}
                              </p>
                              <p className="text-lg font-bold">
                                {calculateTDEE(userInfo?.data?.BMR) + 500}{" "}
                                cal/day
                              </p>
                              <p className="text-xs text-muted-foreground">
                                500 calorie surplus
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <Skeleton className="md:h-[240px] sm:h-[350px] w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[360px] w-full" />
            <Skeleton className="h-[360px] w-full" />
          </div>
          <Skeleton className="h-[380px] w-full" />
        </div>
      )}
    </div>
  );
}
