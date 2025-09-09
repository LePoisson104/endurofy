import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PageTitle from "@/components/global/page-title";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";
import { selectUserInfo } from "@/api/user/user-slice";
import { useSelector } from "react-redux";
import { useUpdateUsersMacrosGoalsMutation } from "@/api/user/user-api-slice";
import { toast } from "sonner";
import { selectCurrentUser } from "@/api/auth/auth-slice";

const MACROS_CONSTANTS = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
};

export default function Targets() {
  const isMobile = useIsMobile();
  const user = useSelector(selectCurrentUser);
  const userInfo = useSelector(selectUserInfo);
  const [updateUsersMacrosGoals, { isLoading: isUpdatingMacrosGoals }] =
    useUpdateUsersMacrosGoalsMutation();

  const [calories, setCalories] = useState(0);
  const [proteinPercent, setProteinPercent] = useState(0);
  const [carbsPercent, setCarbsPercent] = useState(0);
  const [fatPercent, setFatPercent] = useState(0);

  useEffect(() => {
    if (userInfo?.calories) {
      const caloriesValue = userInfo.calories;

      // Convert grams to calories, then calculate percentages
      const proteinCalories =
        Number(userInfo?.protein) * MACROS_CONSTANTS.PROTEIN;
      const carbsCalories = Number(userInfo?.carbs) * MACROS_CONSTANTS.CARBS;
      const fatCalories = Number(userInfo?.fat) * MACROS_CONSTANTS.FAT;

      const proteinPercentValue = Math.round(
        (proteinCalories / Number(userInfo.calories)) * 100
      );
      const carbsPercentValue = Math.round(
        (carbsCalories / Number(userInfo.calories)) * 100
      );
      const fatPercentValue = Math.round(
        (fatCalories / Number(userInfo.calories)) * 100
      );

      // Set current values
      setCalories(caloriesValue);
      setProteinPercent(proteinPercentValue);
      setCarbsPercent(carbsPercentValue);
      setFatPercent(fatPercentValue);
    }
  }, [userInfo]);

  // Calculate grams from percentages and calories
  const proteinGrams = Math.round((calories * proteinPercent) / 100 / 4);
  const carbsGrams = Math.round((calories * carbsPercent) / 100 / 4);
  const fatGrams = Math.round((calories * fatPercent) / 100 / 9);

  const totalPercent = proteinPercent + carbsPercent + fatPercent;
  const isValidTotal = totalPercent === 100;

  // Check if current values match original values from userInfo
  const getOriginalValues = () => {
    if (!userInfo?.calories) return null;

    const proteinCalories =
      Number(userInfo?.protein) * MACROS_CONSTANTS.PROTEIN;
    const carbsCalories = Number(userInfo?.carbs) * MACROS_CONSTANTS.CARBS;
    const fatCalories = Number(userInfo?.fat) * MACROS_CONSTANTS.FAT;

    return {
      calories: userInfo.calories,
      proteinPercent: Math.round(
        (proteinCalories / Number(userInfo.calories)) * 100
      ),
      carbsPercent: Math.round(
        (carbsCalories / Number(userInfo.calories)) * 100
      ),
      fatPercent: Math.round((fatCalories / Number(userInfo.calories)) * 100),
    };
  };

  const originalValues = getOriginalValues();
  const hasChanges = originalValues
    ? calories !== originalValues.calories ||
      proteinPercent !== originalValues.proteinPercent ||
      carbsPercent !== originalValues.carbsPercent ||
      fatPercent !== originalValues.fatPercent
    : false;

  // Reset function to restore original values from userInfo
  const handleReset = () => {
    if (userInfo?.calories) {
      // Convert grams to calories, then calculate percentages (same logic as useEffect)
      const proteinCalories =
        Number(userInfo?.protein) * MACROS_CONSTANTS.PROTEIN;
      const carbsCalories = Number(userInfo?.carbs) * MACROS_CONSTANTS.CARBS;
      const fatCalories = Number(userInfo?.fat) * MACROS_CONSTANTS.FAT;

      setCalories(userInfo.calories);
      setProteinPercent(
        Math.round((proteinCalories / Number(userInfo.calories)) * 100)
      );
      setCarbsPercent(
        Math.round((carbsCalories / Number(userInfo.calories)) * 100)
      );
      setFatPercent(
        Math.round((fatCalories / Number(userInfo.calories)) * 100)
      );
    }
  };

  const handleSave = async () => {
    const payload = {
      calories: Number(calories),
      protein: proteinPercent,
      carbs: carbsPercent,
      fat: fatPercent,
    };

    if (
      payload.calories === 0 &&
      payload.protein === 0 &&
      payload.carbs === 0 &&
      payload.fat === 0
    ) {
      toast.error("Please set your macros goals");
      return;
    }

    console.log(payload);

    try {
      await updateUsersMacrosGoals({
        userId: user?.user_id || "",
        updateMacrosGoalsPayload: payload,
      }).unwrap();
      toast.success("Macros goals updated successfully");
    } catch (error: any) {
      if (!error.status) {
        toast.error("No Server Response");
      } else {
        toast.error(error.data?.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-[1rem]">
      <div
        className={`mb-4 flex ${
          isMobile ? "flex-col gap-4" : "flex-row justify-between items-center"
        }`}
      >
        <PageTitle
          title="Nutrition Targets"
          showCurrentDateAndTime={false}
          subTitle="Set your daily calorie and macronutrient goals"
        />
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="default"
            disabled={!hasChanges || !isValidTotal || isUpdatingMacrosGoals}
            onClick={handleSave}
          >
            {isUpdatingMacrosGoals ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Calorie Target */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Daily Calorie Target
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-6 ${isMobile ? "p-4" : ""}`}>
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm font-medium">
                Target Calories{" "}
                <span className="text-xs text-muted-foreground">(kcal)</span>
              </Label>
              <Input
                id="calories"
                type="number"
                inputMode="decimal"
                value={Number(calories)}
                onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                className="font-semibold"
                min="800"
                max="5000"
              />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Calorie Breakdown</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center flex">
                <div>
                  <div
                    className={`text-2xl font-bold ${
                      isMobile ? "flex flex-col" : ""
                    }`}
                  >
                    {Math.round((calories * proteinPercent) / 100)}{" "}
                    <span className="text-sm text-muted-foreground">cal</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    from Protein
                  </div>
                </div>
                <div>
                  <div
                    className={`text-2xl font-bold ${
                      isMobile ? "flex flex-col" : ""
                    }`}
                  >
                    {Math.round((calories * carbsPercent) / 100)}{" "}
                    <span className="text-sm text-muted-foreground">cal</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    from Carbs
                  </div>
                </div>
                <div>
                  <div
                    className={`text-2xl font-bold ${
                      isMobile ? "flex flex-col" : ""
                    }`}
                  >
                    {Math.round((calories * fatPercent) / 100)}{" "}
                    <span className="text-sm text-muted-foreground">cal</span>
                  </div>
                  <div className="text-xs text-muted-foreground">from Fat</div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Macronutrient Breakdown</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {proteinGrams}{" "}
                    <span className="text-sm text-muted-foreground">g</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    from Protein
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {carbsGrams}{" "}
                    <span className="text-sm text-muted-foreground">g</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    from Carbs
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {fatGrams}{" "}
                    <span className="text-sm text-muted-foreground">g</span>
                  </div>
                  <div className="text-xs text-muted-foreground">from Fat</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Macronutrient Distribution */}
        <Card>
          <CardHeader>
            <CardTitle
              className={`flex gap-2 ${
                isMobile ? "flex-col" : "items-center justify-between"
              }`}
            >
              Macronutrient Distribution
              <div>
                {!isValidTotal && (
                  <Badge variant="destructive">
                    {totalPercent}% (Must equal 100%)
                  </Badge>
                )}
                {isValidTotal && (
                  <Badge className="bg-green-600 text-white">✓ 100%</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Protein */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  Protein
                </Label>
                <div className="text-right">
                  <div className="text-sm font-semibold">{proteinPercent}%</div>
                  <div className="text-xs text-muted-foreground">
                    {proteinGrams}g
                  </div>
                </div>
              </div>
              <Slider
                value={[proteinPercent]}
                onValueChange={(value) => setProteinPercent(value[0] as number)}
                max={100}
                min={0}
                step={1}
                bgColor="bg-green-400"
                ringColor="ring-green-400"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <Separator />

            {/* Carbohydrates */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  Carbohydrates
                </Label>
                <div className="text-right">
                  <div className="text-sm font-semibold">{carbsPercent}%</div>
                  <div className="text-xs text-muted-foreground">
                    {carbsGrams}g
                  </div>
                </div>
              </div>
              <Slider
                value={[carbsPercent]}
                onValueChange={(value) => setCarbsPercent(value[0] as number)}
                max={100}
                min={0}
                step={1}
                bgColor="bg-blue-400"
                ringColor="ring-blue-400"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <Separator />

            {/* Fat */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  Fat
                </Label>
                <div className="text-right">
                  <div className="text-sm font-semibold">{fatPercent}%</div>
                  <div className="text-xs text-muted-foreground">
                    {fatGrams}g
                  </div>
                </div>
              </div>
              <Slider
                value={[fatPercent]}
                onValueChange={(value) => setFatPercent(value[0] as number)}
                max={100}
                min={0}
                step={1}
                bgColor="bg-red-400"
                ringColor="ring-red-400"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => {
                setProteinPercent(30);
                setCarbsPercent(40);
                setFatPercent(30);
              }}
            >
              <div className="font-semibold mb-1">Balanced</div>
              <div className="text-xs text-muted-foreground">
                30% • 40% • 30%
              </div>
              <div className="text-xs text-muted-foreground">
                Protein • Carbs • Fat
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => {
                setProteinPercent(40);
                setCarbsPercent(30);
                setFatPercent(30);
              }}
            >
              <div className="font-semibold mb-1">High Protein</div>
              <div className="text-xs text-muted-foreground">
                40% • 30% • 30%
              </div>
              <div className="text-xs text-muted-foreground">
                Protein • Carbs • Fat
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              onClick={() => {
                setProteinPercent(20);
                setCarbsPercent(15);
                setFatPercent(65);
              }}
            >
              <div className="font-semibold mb-1">Keto</div>
              <div className="text-xs text-muted-foreground">
                20% • 15% • 65%
              </div>
              <div className="text-xs text-muted-foreground">
                Protein • Carbs • Fat
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
