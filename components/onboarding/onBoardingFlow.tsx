"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
import BirthdateStep from "./steps/birthdateStep";
import GenderStep from "./steps/genderStep";
import PhysicalInfoStep from "./steps/physicalInfoStep";
import GoalStep from "./steps/goalStep";
import ActivityStep from "./steps/activityStep";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { useUpdateUsersProfileMutation } from "@/api/user/user-api-slice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/api/auth/auth-slice";
import { UpdateUserInfo } from "@/interfaces/user-interfaces";
import { toast } from "sonner";

export type UserData = {
  gender?: "male" | "female";
  birth_date?: string;
  height?: number;
  height_unit?: "ft" | "cm";
  current_weight?: number;
  current_weight_unit?: "lb" | "kg";
  starting_weight?: number;
  starting_weight_unit?: "lb" | "kg";
  weight_goal?: number;
  weight_goal_unit?: "lb" | "kg";
  activity_level?:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";
  goal?: "lose" | "gain" | "maintain";
  profile_status?: string;
};

export default function OnboardingFlow({
  setIsProfileSuccessNoticeOpen,
  profileStatus,
}: {
  profileStatus: string;
  setIsProfileSuccessNoticeOpen: (isSuccess: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({});
  const isDark = useGetCurrentTheme();
  const user = useSelector(selectCurrentUser);
  const [updateUserProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUsersProfileMutation();

  const steps = [
    {
      component: BirthdateStep,
      key: "birthdate",
    },
    { component: GenderStep, key: "gender" },
    {
      component: PhysicalInfoStep,
      key: "physical",
    },
    { component: GoalStep, key: "goal" },
    {
      component: ActivityStep,
      key: "activityLevel",
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async (data: Partial<UserData>) => {
    const processedData = { ...data };

    // Handle data transformation based on the step
    if (data.height !== undefined && data.height_unit) {
      // Height is already in the correct format from physicalInfoStep
      processedData.height = data.height;
    }

    // Handle weight data mapping from legacy fields
    if ((data as any).weight !== undefined && (data as any).weight_unit) {
      processedData.current_weight = (data as any).weight;
      processedData.current_weight_unit = (data as any).weight_unit;
      processedData.starting_weight = (data as any).weight;
      processedData.starting_weight_unit = (data as any).weight_unit;

      // Remove the old weight fields
      delete (processedData as any).weight;
      delete (processedData as any).weight_unit;
    }

    // Handle goal weight mapping from both legacy and new fields
    if ((data as any).goalWeight !== undefined) {
      processedData.weight_goal = (data as any).goalWeight;
      processedData.weight_goal_unit =
        processedData.current_weight_unit ||
        userData.current_weight_unit ||
        "lb";

      // Remove the old goalWeight field
      delete (processedData as any).goalWeight;
    } else if (data.weight_goal !== undefined) {
      // Handle new field names directly
      processedData.weight_goal = data.weight_goal;
      if (data.weight_goal_unit) {
        processedData.weight_goal_unit = data.weight_goal_unit;
      }
    }

    // Handle activity level mapping from legacy fields
    if ((data as any).activityLevel !== undefined) {
      processedData.activity_level = (data as any).activityLevel;

      // Remove the old activityLevel field
      delete (processedData as any).activityLevel;
    }

    // Handle birthdate mapping (convert Date to string) from legacy fields
    if ((data as any).birthdate !== undefined) {
      processedData.birth_date = (data as any).birthdate
        .toISOString()
        .split("T")[0];

      // Remove the old birthdate field
      delete (processedData as any).birthdate;
    }

    const newUserData = { ...userData, ...processedData };
    setUserData(newUserData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final data processing before completion
      const finalData = {
        ...newUserData,
        profile_status: profileStatus,
      };
      console.log(finalData);
      try {
        await updateUserProfile({
          userId: user?.user_id || "",
          payload: finalData as UpdateUserInfo,
        }).unwrap();
        setIsProfileSuccessNoticeOpen(true);
      } catch (error: any) {
        if (!error.status) {
          toast.error("No Server Response");
        } else if (error.status === 400) {
          toast.error(error.data?.message);
        } else {
          toast.error(error.data?.message);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 standalone:pt-20 standalone:pb-10">
      <div className="w-full max-w-md">
        {/* Progress Header */}
        <div className="mb-6 px-7">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="p-2 hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress
            value={progress}
            className={`h-2 ${
              isDark ? "[&>div]:bg-blue-500" : "[&>div]:bg-blue-400"
            }`}
          />
        </div>

        {/* Step Content */}
        <div className="border-0">
          <div className="p-6">
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={currentStep}
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                <CurrentStepComponent
                  data={userData}
                  onNext={handleNext}
                  isLoading={isUpdatingProfile}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
