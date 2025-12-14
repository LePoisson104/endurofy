import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Log",
};

export default function FoodLogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
