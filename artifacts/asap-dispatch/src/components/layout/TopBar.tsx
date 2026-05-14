import { Bell, LogOut, Shield, Settings, User, CreditCard, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useApp, useNow } from "@/context/AppContext";
import { Logo } from "./Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { NotificationPanel } from "./NotificationPanel";
import { formatTimeWithSeconds, formatDate, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function TopBar() {
  const { currentUser, setUser, setView, notifications, panicActive } = useApp();
  const now = useNow(1000);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read && !n.dismissed).length;

  return (
    <>
      {panicActive && (
        <div className="bg-red-500/95 text-white text-sm font-semibold px-4 py-2 text-center pulse-active">
          PANIC ALERT ACTIVE — visit Tracker for response options
        </div>
      )}
      <div className="h-16 border-b border-white/[0.06] bg-[#06080F]/95 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <button
            onClick={() => setView("dashboard")}
            className="hover:opacity-80 transition shrink-0"
          >
            <Logo />
          </button>
          <div className="hidden md:flex items-center gap-2 pl-6 border-l border-white/[0.06]">
            <Shield size={14} className="text-[#FF5C00]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
              Command Center
            </span>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center text-center">
          <div className="font-mono text-sm text-[#F1F5F9]">
            {formatTimeWithSeconds(now)}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
            {formatDate(now)}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2 rounded-lg hover:bg-white/5 transition text-[#94A3B8] hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
                >
                  {unread}
                </motion.span>
              )}
              {panicActive && (
                <span className="absolute inset-0 rounded-lg pulse-ring pointer-events-none" />
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              )}
            </AnimatePresence>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 md:gap-4 pl-3 border-l border-white/[0.06] relative">
              <div className="text-right hidden md:block">
                <div className="text-[13px] font-medium text-[#F1F5F9] leading-tight">
                  {currentUser.name}
                </div>
                <div className="flex justify-end mt-0.5">
                  <Badge color="orange" size="sm" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter">
                    {currentUser.role}
                  </Badge>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition border border-transparent hover:border-white/10"
                >
                  <Avatar name={currentUser.name} src={currentUser.avatar} size={36} ring />
                  <ChevronDown size={14} className={cn("text-[#94A3B8] transition-transform duration-200", userMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setUserMenuOpen(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-[0.15em] mb-1">Account</p>
                          <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-[#94A3B8] mt-0.5">ext: {currentUser.extension}</p>
                        </div>
                        
                        <div className="p-2">
                          <button 
                            onClick={() => { setView("settings"); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all group"
                          >
                            <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-[#FF5C00]/20 group-hover:text-[#FF5C00] transition-colors">
                              <User size={14} />
                            </div>
                            My Profile
                          </button>
                          
                          {(currentUser.role === "admin" || currentUser.role === "supervisor") && (
                            <button 
                              onClick={() => { setView("settings"); setUserMenuOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all group"
                            >
                              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-[#FF5C00]/20 group-hover:text-[#FF5C00] transition-colors">
                                <Settings size={14} />
                              </div>
                              System Settings
                            </button>
                          )}

                          <button 
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-[#94A3B8] hover:bg-white/5 hover:text-white transition-all group"
                          >
                            <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-[#FF5C00]/20 group-hover:text-[#FF5C00] transition-colors">
                              <Shield size={14} />
                            </div>
                            Security Center
                          </button>
                        </div>

                        <div className="p-2 bg-white/[0.02] border-t border-white/5">
                          <button
                            onClick={() => {
                              setUser(null);
                              setView("login");
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <div className="p-1.5 bg-red-500/10 rounded-lg">
                              <LogOut size={14} />
                            </div>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
