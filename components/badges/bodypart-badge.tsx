import { Badge } from "../ui/badge";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function BodyPartBadge({ bodyPart }: { bodyPart: string }) {
  const isDark = useGetCurrentTheme();
  return (
    <Badge
      className={`${
        isDark ? "bg-blue-900 text-blue-200" : "bg-blue-200 text-blue-900"
      }`}
    >
      {bodyPart}
    </Badge>
  );
}
