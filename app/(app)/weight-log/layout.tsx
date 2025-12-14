import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weight Log",
};

export default function WeightLogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
