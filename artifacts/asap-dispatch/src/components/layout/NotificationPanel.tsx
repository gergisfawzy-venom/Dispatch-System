import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { X, AlertTriangle, MapPin, Clock, AlertOctagon, Calendar, ArrowRightLeft, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { NotificationType } from "@/types";
import { relativeTime, cn } from "@/lib/utils";

const iconMap: Record<NotificationType, { icon: React.ReactNode; border: string }> = {
  panic: { icon: <AlertOctagon size={14} className="text-red-400" />, border: "border-l-red-500" },
  "checkpoint-missed": { icon: <MapPin size={14} className="text-orange-400" />, border: "border-l-orange-500" },
  "shift-unconfirmed": { icon: <Clock size={14} className="text-yellow-400" />, border: "border-l-yellow-500" },
  "geofence-breach": { icon: <MapPin size={14} className="text-orange-400" />, border: "border-l-orange-500" },
  overtime: { icon: <Clock size={14} className="text-yellow-400" />, border: "border-l-yellow-500" },
  "new-incident": { icon: <FileText size={14} className="text-blue-400" />, border: "border-l-blue-500" },
  "time-off-request": { icon: <Calendar size={14} className="text-blue-400" />, border: "border-l-blue-500" },
  "swap-request": { icon: <ArrowRightLeft size={14} className="text-blue-400" />, border: "border-l-blue-500" },
  late: { icon: <AlertTriangle size={14} className="text-yellow-400" />, border: "border-l-yellow-500" },
};

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const {
    notifications,
    dismissNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    setView,
  } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handle), 0);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  const visible = notifications.filter((n) => !n.dismissed);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-12 w-[380px] max-w-[calc(100vw-2rem)] bg-[#0A0E1A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <h3 className="font-display text-sm">
          Notifications{" "}
          <span className="text-[#94A3B8] font-mono">({visible.length})</span>
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={markAllNotificationsRead}
            className="text-[#94A3B8] hover:text-white transition"
          >
            Mark all read
          </button>
          <span className="text-[#94A3B8]">•</span>
          <button
            onClick={clearNotifications}
            className="text-[#94A3B8] hover:text-red-400 transition"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {visible.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#94A3B8]">
            All clear, no notifications.
          </div>
        ) : (
          visible.map((n) => {
            const meta = iconMap[n.type];
            return (
              <button
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.navigateTo) {
                    setView(n.navigateTo);
                    onClose();
                  }
                }}
                className={cn(
                  "w-full text-left flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] border-l-4 hover:bg-white/[0.02] transition",
                  meta.border,
                  !n.read && "bg-white/[0.025]"
                )}
              >
                <span className="mt-0.5">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F1F5F9] leading-snug">
                    {n.message}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-[#94A3B8] mt-1 font-mono">
                    {relativeTime(n.timestamp)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(n.id);
                  }}
                  className="text-[#94A3B8] hover:text-white shrink-0 mt-0.5"
                >
                  <X size={14} />
                </button>
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
