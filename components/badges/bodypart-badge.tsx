import { Badge } from "../ui/badge";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function BodyPartBadge({ bodyPart }: { bodyPart: string }) {
  const isDark = useGetCurrentTheme();
  return (
    <Badge
      className={`${
        isDark
          ? "bg-blue-900 text-blue-200 border-blue-600"
          : "bg-blue-100 text-blue-800 border-blue-500"
      }`}
    >
      {bodyPart}
    </Badge>
  );
}
