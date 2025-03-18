"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/appsidebar";
import { TopBar } from "@/components/topbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" w-full h-full">
        <TopBar />
        {children}
      </main>
    </SidebarProvider>
  );
}
