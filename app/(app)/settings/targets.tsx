import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageTitle from "@/components/global/page-title";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Targets() {
  const isMobile = useIsMobile();
  const [calories, setCalories] = useState(2000);
  const [proteinPercent, setProteinPercent] = useState(25);
  const [carbsPercent, setCarbsPercent] = useState(45);
  const [fatPercent, setFatPercent] = useState(30);

  // Calculate grams from percentages and calories
  const proteinGrams = Math.round((calories * proteinPercent) / 100 / 4);
  const carbsGrams = Math.round((calories * carbsPercent) / 100 / 4);
  const fatGrams = Math.round((calories * fatPercent) / 100 / 9);

  const totalPercent = proteinPercent + carbsPercent + fatPercent;
  const isValidTotal = totalPercent === 100;

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
          <Button variant="outline">Reset</Button>
          <Button variant="default">Save</Button>
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
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm font-medium">
                Target Calories{" "}
                <span className="text-xs text-muted-foreground">(kcal)</span>
              </Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                className="text-lg font-semibold"
                min="800"
                max="5000"
              />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Calorie Breakdown</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round((calories * proteinPercent) / 100)}{" "}
                    <span className="text-sm text-muted-foreground">cal</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    from Protein
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round((calories * carbsPercent) / 100)}{" "}
                    <span className="text-sm text-muted-foreground">cal</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    from Carbs
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
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
            <CardTitle className="flex items-center gap-2">
              Macronutrient Distribution
              {!isValidTotal && (
                <Badge variant="destructive" className="ml-2">
                  {totalPercent}% (Must equal 100%)
                </Badge>
              )}
              {isValidTotal && (
                <Badge variant="default" className="ml-2">
                  ✓ 100%
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Protein */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
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
                bgColor="bg-red-400"
                ringColor="ring-red-400"
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
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
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
                bgColor="bg-amber-400"
                ringColor="ring-amber-400"
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
