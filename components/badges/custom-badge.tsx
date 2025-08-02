import { Badge } from "../ui/badge";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";

export default function CustomBadge({ title }: { title: string }) {
  const isDark = useGetCurrentTheme();
  return (
    <Badge
      className={`${
        isDark
          ? "bg-sky-900 text-sky-200 border-sky-700"
          : "bg-sky-100 text-sky-800 border-sky-500"
      }`}
    >
      {title}
    </Badge>
  );
}
