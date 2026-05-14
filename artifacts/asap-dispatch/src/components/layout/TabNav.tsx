import {
  LayoutDashboard,
  Calendar,
  Clock,
  Map as MapIcon,
  AlertTriangle,
  MessageSquare,
  Phone,
  Building2,
  Users,
  BarChart3,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { ViewKey, UserRole } from "@/types";
import { cn } from "@/lib/utils";

const tabs: { key: ViewKey; label: string; icon: React.ReactNode; allowedRoles: UserRole[] }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} />, allowedRoles: ["admin", "dispatcher", "supervisor", "guard"] },
  { key: "scheduler", label: "Scheduler", icon: <Calendar size={15} />, allowedRoles: ["admin", "dispatcher", "supervisor"] },
  { key: "timesheet", label: "Timesheet", icon: <Clock size={15} />, allowedRoles: ["admin", "dispatcher", "supervisor"] },
  { key: "tracker", label: "Tracker", icon: <MapIcon size={15} />, allowedRoles: ["admin", "dispatcher", "supervisor"] },
  { key: "incidents", label: "Incidents", icon: <AlertTriangle size={15} />, allowedRoles: ["admin", "dispatcher", "supervisor", "guard"] },
  { key: "chat", label: "Chat", icon: <MessageSquare size={15} />, allowedRoles: ["admin", "dispatcher", "supervisor", "guard"] },
  { key: "calls", label: "Calls", icon: <Phone size={15} />, allowedRoles: ["admin", "dispatcher", "supervisor"] },
  { key: "sites", label: "Sites", icon: <Building2 size={15} />, allowedRoles: ["admin", "supervisor"] },
  { key: "users", label: "Users", icon: <Users size={15} />, allowedRoles: ["admin", "supervisor"] },
  { key: "reports", label: "Reports", icon: <BarChart3 size={15} />, allowedRoles: ["admin", "supervisor"] },
];

export function TabNav() {
  const { view, setView, incidents, notifications, currentUser } = useApp();
  const incidentCount = incidents.filter((i) => i.status === "open").length;
  const unread = notifications.filter((n) => !n.read && !n.dismissed).length;

  const filteredTabs = tabs.filter(t => t.allowedRoles.includes(currentUser?.role || "guard"));

  return (
    <nav className="border-b border-white/[0.06] bg-[#0A0E1A]/60 backdrop-blur-sm sticky top-16 z-40">
      <div className="flex overflow-x-auto px-4 md:px-6 gap-1">
        {filteredTabs.map((t) => {
          const isActive = view === t.key;
          const badge =
            t.key === "incidents" && incidentCount > 0
              ? incidentCount
              : t.key === "dashboard" && unread > 0
                ? unread
                : null;
          return (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm transition whitespace-nowrap font-medium",
                isActive
                  ? "text-[#F1F5F9]"
                  : "text-[#94A3B8] hover:text-[#F1F5F9]"
              )}
            >
              <span
                className={cn(
                  isActive ? "text-[#FF5C00]" : "text-current"
                )}
              >
                {t.icon}
              </span>
              {t.label}
              {badge != null && (
                <span className="ml-1 bg-red-500/20 text-red-300 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {badge}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF5C00] rounded-t shadow-[0_0_8px_rgba(255,92,0,0.6)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
