import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workout Log",
};

export default function WorkoutLogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
