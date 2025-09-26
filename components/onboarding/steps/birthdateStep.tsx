import { useState } from "react";
import { DateInput } from "@/components/ui/date-input";
import { format } from "date-fns";
import { UserData } from "@/interfaces/userOnboardData";
import ContinueBtn from "./continnueBtn";

interface BirthdateStepProps {
  data: UserData;
  onNext: (data: Partial<UserData>) => void;
}

export default function BirthdateStep({ data, onNext }: BirthdateStepProps) {
  const [birthDateString, setBirthDateString] = useState<string>(
    data.birth_date ||
      (data.birthdate ? format(data.birthdate, "MM/dd/yyyy") : "")
  );

  const handleNext = () => {
    if (birthDateString) {
      // Parse the date string to create a Date object for legacy compatibility
      const [month, day, year] = birthDateString.split("/");
      if (month && day && year) {
        const birthdate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );
        onNext({
          birthdate,
          birth_date: birthDateString,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">When were you born?</h1>
        <p className="mb-10 text-sm text-muted-foreground">
          We need this to calculate your daily nutritional needs accurately
        </p>
      </div>

      <DateInput
        value={birthDateString}
        onChange={(value) => setBirthDateString(value)}
      />

      <ContinueBtn onClick={handleNext} disabled={!birthDateString} />
    </div>
  );
}
