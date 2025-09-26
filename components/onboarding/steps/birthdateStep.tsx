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
  const [birthdate, setBirthdate] = useState<Date | undefined>(data.birthdate);

  const handleNext = () => {
    if (birthdate) {
      onNext({ birthdate });
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
        value={birthdate ? format(birthdate, "MM/dd/yyyy") : ""}
        onChange={(value) => setBirthdate(new Date(value))}
      />

      <ContinueBtn onClick={handleNext} disabled={!birthdate} />
    </div>
  );
}
