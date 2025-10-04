import { Badge } from "@/components/ui/badge";
import { Check, Loader } from "lucide-react";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export function CompletedBadge(): React.ReactNode {
  const isDark = useGetCurrentTheme();
  return (
    <Badge
      className={`${
        isDark ? "bg-green-900 text-green-200" : "bg-green-200 text-green-900"
      }`}
    >
      <Check className="h-2 w-2" />
      Completed
    </Badge>
  );
}

export function ProgressBadge(): React.ReactNode {
  const isDark = useGetCurrentTheme();
  return (
    <Badge
      className={`${
        isDark
          ? "bg-yellow-900 text-yellow-200"
          : "bg-orange-200 text-orange-900"
      }`}
    >
      <Loader className="h-2 w-2" />
      In Progress
    </Badge>
  );
}
