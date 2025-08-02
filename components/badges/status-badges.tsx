import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function CompletedBadge() {
  const isDark = useGetCurrentTheme();
  return (
    <Badge
      className={`${
        isDark
          ? "bg-green-900 text-green-200 border-green-700"
          : "bg-green-100 text-green-900 border-green-500"
      }`}
    >
      <Check className="h-2 w-2" />
      Completed
    </Badge>
  );
}
