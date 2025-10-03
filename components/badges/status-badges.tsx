import { Badge } from "@/components/ui/badge";
import { Check, Loader } from "lucide-react";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export function CompletedBadge(): React.ReactNode {
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

export function ProgressBadge(): React.ReactNode {
  const isDark = useGetCurrentTheme();
  return (
    <Badge
      className={`${
        isDark
          ? "bg-yellow-900 text-yellow-200 border-yellow-700"
          : "bg-yellow-100 text-yellow-900 border-yellow-500"
      }`}
    >
      <Loader className="h-2 w-2" />
      In Progress
    </Badge>
  );
}
