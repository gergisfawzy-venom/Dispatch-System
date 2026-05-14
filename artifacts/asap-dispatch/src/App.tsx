import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "@/context/AppContext";
import { TopBar } from "@/components/layout/TopBar";
import { TabNav } from "@/components/layout/TabNav";
import { Toaster } from "@/components/ui/Toaster";
import { LandingView } from "@/views/landing/LandingView";
import { LoginView } from "@/views/auth/LoginView";
import { DashboardView } from "@/views/dashboard/DashboardView";
import { SchedulerView } from "@/views/scheduler/SchedulerView";
import { TimesheetView } from "@/views/timesheet/TimesheetView";
import { TrackerView } from "@/views/tracker/TrackerView";
import { IncidentsView } from "@/views/incidents/IncidentsView";
import { ChatView } from "@/views/chat/ChatView";
import { CallsView } from "@/views/calls/CallsView";
import { SitesView } from "@/views/sites/SitesView";
import { UsersView } from "@/views/users/UsersView";
import { ReportsView } from "@/views/reports/ReportsView";
import { SettingsView } from "@/views/settings/SettingsView";
import { GlobalCallUI } from "@/components/layout/GlobalCallUI";

function Shell() {
  const { view } = useApp();

  if (view === "landing") {
    return (
      <>
        <LandingView />
        <Toaster />
      </>
    );
  }
  if (view === "login") {
    return (
      <>
        <LoginView />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F]">
      <TopBar />
      <TabNav />
      <main className="min-h-[calc(100vh-128px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {view === "dashboard" && <DashboardView />}
            {view === "scheduler" && <SchedulerView />}
            {view === "timesheet" && <TimesheetView />}
            {view === "tracker" && <TrackerView />}
            {view === "incidents" && <IncidentsView />}
            {view === "chat" && <ChatView />}
            {view === "calls" && <CallsView />}
            {view === "sites" && <SitesView />}
            {view === "users" && <UsersView />}
            {view === "reports" && <ReportsView />}
            {view === "settings" && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster />
      <GlobalCallUI />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
