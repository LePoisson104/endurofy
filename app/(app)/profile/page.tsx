"use client";

import { useState, useEffect, useCallback } from "react";
import { format, setDate } from "date-fns";
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Initial profile data
const initialProfile = {
  name: "John Doe",
  email: "johndoe@gmail.com",
  gender: "male",
  birthday: new Date("1990-01-01"),
  height: 180, // cm
  currentWeight: 80, // kg
  goalWeight: 75, // kg
  weightUnit: "kg",
  heightUnit: "cm",
  activityLevel: "moderate", // Add activity level
};

// Weight history data for the chart
const weightHistoryData = [
  { date: "Jan", weight: 72 },
  { date: "Feb", weight: 71 },
  { date: "Mar", weight: 70 },
  { date: "Apr", weight: 69 },
  { date: "May", weight: 68 },
  { date: "Jun", weight: 68 },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(initialProfile);
  const [bmi, setBmi] = useState(0);
  const [bmiCategory, setBmiCategory] = useState("");
  const [bmiCategoryColor, setBmiCategoryColor] = useState("");
  const [weightProgress, setWeightProgress] = useState(0);

  const calculateBMI = useCallback(() => {
    if (!profile?.height || !profile?.currentWeight) return;

    const heightInMeters = profile.height / 100;
    const calculatedBMI =
      profile.currentWeight / (heightInMeters * heightInMeters);
    setBmi(Number.parseFloat(calculatedBMI.toFixed(1)));

    if (calculatedBMI < 18.5) {
      setBmiCategory("Underweight");
      setBmiCategoryColor("text-blue-500");
    } else if (calculatedBMI >= 18.5 && calculatedBMI < 25) {
      setBmiCategory("Normal weight");
      setBmiCategoryColor("text-green-500");
    } else if (calculatedBMI >= 25 && calculatedBMI < 30) {
      setBmiCategory("Overweight");
      setBmiCategoryColor("text-yellow-500");
    } else {
      setBmiCategory("Obese");
      setBmiCategoryColor("text-red-500");
    }
  }, [profile]); // Only recalculate if `profile` changes

  const calculateWeightProgress = useCallback(() => {
    if (!weightHistoryData?.length || !profile?.goalWeight) return;

    const startWeight = Math.max(...weightHistoryData.map((d) => d.weight));
    const totalWeightToLose = startWeight - profile.goalWeight;
    const weightLost = startWeight - profile.currentWeight;

    setWeightProgress(
      totalWeightToLose <= 0
        ? 100
        : Math.min(Math.max((weightLost / totalWeightToLose) * 100, 0), 100)
    );
  }, [weightHistoryData, profile]);

  // Run calculations when `profile` or `weightHistoryData` changes
  useEffect(() => {
    calculateBMI();
    calculateWeightProgress();
  }, [calculateBMI, calculateWeightProgress]);

  // Calculate BMR (Basal Metabolic Rate)
  const calculateBMR = () => {
    const age = new Date().getFullYear() - profile.birthday.getFullYear();

    // Mifflin-St Jeor Equation
    if (profile.gender === "male") {
      return Math.round(
        10 * profile.currentWeight + 6.25 * profile.height - 5 * age + 5
      );
    } else {
      return Math.round(
        10 * profile.currentWeight + 6.25 * profile.height - 5 * age - 161
      );
    }
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (bmr: number) => {
    const activityMultipliers = {
      sedentary: 1.2, // Little or no exercise
      light: 1.375, // Light exercise 1-3 days/week
      moderate: 1.55, // Moderate exercise 3-5 days/week
      active: 1.725, // Active exercise 6-7 days/week
      veryActive: 1.9, // Very active, physical job or twice daily training
    };

    return Math.round(
      bmr *
        activityMultipliers[
          profile.activityLevel as keyof typeof activityMultipliers
        ]
    );
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Save changes
      setProfile(editedProfile);
    } else {
      // Enter edit mode
      setEditedProfile({ ...profile });
    }
    setIsEditing(!isEditing);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: number | Date | string) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value,
    });
  };

  // Convert height between units
  const convertHeight = (value: number, from: string, to: string) => {
    if (from === to) return value;
    if (from === "cm" && to === "ft") {
      // Convert cm to feet (approximate)
      return (value / 30.48).toFixed(1);
    } else if (from === "ft" && to === "cm") {
      // Convert feet to cm
      return Math.round(value * 30.48);
    }
    return value;
  };

  // Convert weight between units
  const convertWeight = (value: number, from: string, to: string) => {
    if (from === to) return value;
    if (from === "kg" && to === "lbs") {
      // Convert kg to lbs
      return Math.round(value * 2.20462);
    } else if (from === "lbs" && to === "kg") {
      // Convert lbs to kg
      return Math.round(value / 2.20462);
    }
    return value;
  };

  return (
    <div className="container mx-auto p-[1rem] max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-muted">
                <AvatarImage src="#" alt="Profile picture" />
                <AvatarFallback className="text-2xl font-bold bg-red-300 text-white">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.email}</p>

                <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    <User className="h-3.5 w-3.5" />
                    <span>{profile.gender === "male" ? "Male" : "Female"}</span>
                  </div>
                  <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Age:{" "}
                    {new Date().getFullYear() - profile.birthday.getFullYear()}
                  </div>
                  <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Height: {profile.height} cm
                  </div>
                </div>
              </div>

              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={toggleEditMode}
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

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Health Metrics</CardTitle>
              <CardDescription>
                Update your personal health information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender Selection */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  defaultValue={editedProfile.gender}
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
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedProfile.birthday && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedProfile.birthday ? (
                        format(editedProfile.birthday, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedProfile.birthday}
                      onSelect={(date) =>
                        date && handleInputChange("birthday", date)
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
                  <Input
                    id="height"
                    type="number"
                    value={editedProfile.height}
                    onChange={(e) =>
                      handleInputChange(
                        "height",
                        Number.parseFloat(e.target.value)
                      )
                    }
                    className="flex-1"
                  />
                  <Select
                    value={editedProfile.heightUnit}
                    onValueChange={(value) => {
                      const newHeight = convertHeight(
                        editedProfile.height,
                        editedProfile.heightUnit,
                        value
                      );
                      setEditedProfile({
                        ...editedProfile,
                        height: Number(newHeight),
                        heightUnit: value,
                      });
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Current Weight */}
              <div className="space-y-2">
                <Label htmlFor="currentWeight">Current Weight</Label>
                <div className="flex gap-2">
                  <Input
                    id="currentWeight"
                    type="number"
                    value={editedProfile.currentWeight}
                    onChange={(e) =>
                      handleInputChange(
                        "currentWeight",
                        Number.parseFloat(e.target.value)
                      )
                    }
                    className="flex-1"
                  />
                  <Select
                    value={editedProfile.weightUnit}
                    onValueChange={(value) => {
                      const newCurrentWeight = convertWeight(
                        editedProfile.currentWeight,
                        editedProfile.weightUnit,
                        value
                      );
                      const newGoalWeight = convertWeight(
                        editedProfile.goalWeight,
                        editedProfile.weightUnit,
                        value
                      );
                      setEditedProfile({
                        ...editedProfile,
                        currentWeight: newCurrentWeight,
                        goalWeight: newGoalWeight,
                        weightUnit: value,
                      });
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goal Weight */}
              <div className="space-y-2">
                <Label htmlFor="goalWeight">Goal Weight</Label>
                <div className="flex gap-2">
                  <Input
                    id="goalWeight"
                    type="number"
                    value={editedProfile.goalWeight}
                    onChange={(e) =>
                      handleInputChange(
                        "goalWeight",
                        Number.parseFloat(e.target.value)
                      )
                    }
                    className="flex-1"
                  />
                  <div className="w-[100px] text-center flex items-center justify-center text-muted-foreground">
                    {editedProfile.weightUnit}
                  </div>
                </div>
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={editedProfile.activityLevel}
                  onValueChange={(value) =>
                    handleInputChange("activityLevel", value)
                  }
                >
                  <SelectTrigger id="activityLevel" className="w-full">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">
                      Sedentary (little or no exercise)
                    </SelectItem>
                    <SelectItem value="light">
                      Lightly Active (light exercise 1-3 days/week)
                    </SelectItem>
                    <SelectItem value="moderate">
                      Moderately Active (moderate exercise 3-5 days/week)
                    </SelectItem>
                    <SelectItem value="active">
                      Very Active (hard exercise 6-7 days/week)
                    </SelectItem>
                    <SelectItem value="veryActive">
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
              <Button onClick={toggleEditMode}>Save Changes</Button>
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
                    Last updated: {format(new Date(), "MMM d, yyyy")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Gender
                      </h3>
                      <p className="text-lg font-medium capitalize">
                        {profile.gender}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Age
                      </h3>
                      <p className="text-lg font-medium">
                        {new Date().getFullYear() -
                          profile.birthday.getFullYear()}{" "}
                        years
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Birthday
                    </h3>
                    <p className="text-lg font-medium">
                      {format(profile.birthday, "MMMM d, yyyy")}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Height
                    </h3>
                    <p className="text-lg font-medium">
                      {profile.height} cm (
                      {convertHeight(profile.height, "cm", "ft")} ft)
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
                        {profile.currentWeight} kg (
                        {convertWeight(profile.currentWeight, "kg", "lbs")} lbs)
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Goal Weight
                      </h3>
                      <p className="text-lg font-medium">
                        {profile.goalWeight} kg (
                        {convertWeight(profile.goalWeight, "kg", "lbs")} lbs)
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
                    <div className="mt-4 relative h-5 bg-muted rounded-md overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <div className="h-full w-1/4 bg-blue-400"></div>
                        <div className="h-full w-1/4 bg-green-400"></div>
                        <div className="h-full w-1/4 bg-yellow-400"></div>
                        <div className="h-full w-1/4 bg-red-400"></div>
                      </div>
                      <div
                        className="absolute top-0 h-full w-1 bg-black"
                        style={{
                          left: `${Math.min(
                            Math.max((bmi / 40) * 100, 0),
                            100
                          )}%`,
                          transform: "translateX(-50%)",
                        }}
                      ></div>
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[#F8FAFC] font-bold text-center pb-[.1rem]">
                        <span className="w-1/4">Underweight</span>
                        <span className="w-1/4">Normal</span>
                        <span className="w-1/4">Overweight</span>
                        <span className="w-1/4">Obese</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Weight Goal Progress Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Weight Goal Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current: {profile.currentWeight} kg
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Goal: {profile.goalWeight} kg
                      </span>
                    </div>
                    <Progress value={50} className="h-3" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        50% complete
                      </span>
                      <span className="text-sm font-medium">
                        {Math.abs(
                          profile.currentWeight - profile.goalWeight
                        ).toFixed(1)}{" "}
                        kg to go
                      </span>
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
                          {calculateBMR()} calories/day
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
                          {profile.activityLevel === "veryActive"
                            ? "Very Active"
                            : profile.activityLevel === "sedentary"
                            ? "Sedentary"
                            : `${profile.activityLevel
                                .charAt(0)
                                .toUpperCase()}${profile.activityLevel.slice(
                                1
                              )}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.activityLevel === "sedentary" &&
                            "Little or no exercise"}
                          {profile.activityLevel === "light" &&
                            "Light exercise 1-3 days/week"}
                          {profile.activityLevel === "moderate" &&
                            "Moderate exercise 3-5 days/week"}
                          {profile.activityLevel === "active" &&
                            "Hard exercise 6-7 days/week"}
                          {profile.activityLevel === "veryActive" &&
                            "Very hard exercise, physical job or twice daily training"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Total Daily Energy Expenditure (TDEE)
                        </h3>
                        <p className="text-3xl font-bold mt-1">
                          {calculateTDEE(calculateBMR())} calories/day
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          The total calories you burn each day based on your BMR
                          and activity level
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
                              To Lose Weight
                            </p>
                            <p className="text-lg font-bold">
                              {calculateTDEE(calculateBMR()) - 500} cal/day
                            </p>
                            <p className="text-xs text-muted-foreground">
                              500 calorie deficit
                            </p>
                          </div>
                          <div className="bg-primary/10 rounded-lg p-3">
                            <p className="text-sm font-medium">
                              To Gain Weight
                            </p>
                            <p className="text-lg font-bold">
                              {calculateTDEE(calculateBMR()) + 500} cal/day
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
    </div>
  );
}
