import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/global/appsidebar";
import { TopBar } from "@/components/global/topbar";
import { cookies } from "next/headers";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <AuthProvider>
      {/* <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      > */}
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="w-full h-full">
          <TopBar />
          {children}
        </main>
      </SidebarProvider>
      {/* </ThemeProvider> */}
    </AuthProvider>
  );
}
