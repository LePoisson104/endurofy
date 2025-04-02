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
import { useRouter } from "next/navigation";
import ErrorAlert from "@/components/alerts/error-alert";
import SuccessAlert from "@/components/alerts/success-alert";

interface UsersProfileModalProps {
  isOpen: boolean;
  userId: string;
  email: string;
}

export default function UsersProfileModal({
  isOpen,
  userId,
  email,
}: UsersProfileModalProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    gender: "",
    birth_date: "",
    height: "",
    height_unit: "",
    current_weight: "",
    weight_unit: "",
    goal_weight: "",
    activity_level: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // try {
    //   await updateUserInfo({
    //     user_id: userId,
    //     payload: {
    //       ...formData,
    //       height: Number(formData.height),
    //       current_weight: Number(formData.current_weight),
    //       goal_weight: Number(formData.goal_weight),
    //     },
    //   }).unwrap();
    //   setSuccess("Profile updated successfully!");
    //   setTimeout(() => {
    //     onClose();
    //     router.push("/dashboard");
    //   }, 2000);
    // } catch (err: any) {
    //   setError(err.data?.message || "Failed to update profile");
    // }
  };

  const handleInputChange = (
    field: string,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your information to continue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ErrorAlert error={error} setError={setError} />
          <SuccessAlert success={success} setSuccess={setSuccess} />

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
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
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
                      handleInputChange("birth_date", e.target.value)
                    }
                    max={new Date().toISOString().split("T")[0]} // Prevents selecting future dates
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
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <div className="flex gap-2">
                    <Input
                      id="height"
                      placeholder="Height"
                      type="number"
                      value={formData.height}
                      onChange={(e) =>
                        handleInputChange("height", e.target.value)
                      }
                      required
                      className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Select
                      value={formData.height_unit}
                      onValueChange={(value) =>
                        handleInputChange("height_unit", value)
                      }
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
                <div className="space-y-2">
                  <Label htmlFor="current_weight">Current Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="current_weight"
                      placeholder="Current Weight"
                      type="number"
                      value={formData.current_weight}
                      onChange={(e) =>
                        handleInputChange("current_weight", e.target.value)
                      }
                      required
                      className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Select
                      value={formData.weight_unit}
                      onValueChange={(value) =>
                        handleInputChange("weight_unit", value)
                      }
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
                <div className="space-y-2">
                  <Label htmlFor="goal_weight">Goal Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      id="goal_weight"
                      placeholder="Goal Weight"
                      type="number"
                      value={formData.goal_weight}
                      onChange={(e) =>
                        handleInputChange("goal_weight", e.target.value)
                      }
                      required
                      className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Select
                      value={formData.weight_unit}
                      onValueChange={(value) =>
                        handleInputChange("weight_unit", value)
                      }
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
                <div className="space-y-2">
                  <Label htmlFor="activity_level">Activity Level</Label>
                  <Select
                    value={formData.activity_level}
                    onValueChange={(value) =>
                      handleInputChange("activity_level", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Lightly Active</SelectItem>
                      <SelectItem value="moderate">
                        Moderately Active
                      </SelectItem>
                      <SelectItem value="very">Very Active</SelectItem>
                      <SelectItem value="extra">Extra Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={false} className="w-full sm:w-auto">
              {false ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
