import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/appsidebar";
import { TopBar } from "@/components/topbar";
import { cookies } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="w-full h-full">
        <TopBar />
        {children}
      </main>
    </SidebarProvider>
  );
}
