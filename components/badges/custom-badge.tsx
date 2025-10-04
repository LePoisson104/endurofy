import { Badge } from "../ui/badge";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function CustomBadge({ title }: { title: string }) {
  const isDark = useGetCurrentTheme();
  return (
    <Badge
      className={`${
        isDark ? "bg-sky-900 text-sky-200" : "bg-sky-200 text-sky-900"
      }`}
    >
      {title}
    </Badge>
  );
}
