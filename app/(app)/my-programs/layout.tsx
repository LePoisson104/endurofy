import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Programs",
};

export default function MyProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
