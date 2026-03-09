import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import MobileBottomNav from "./MobileBottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="md:ml-[240px] transition-all duration-300">
        <AppHeader />
        <main className="p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
