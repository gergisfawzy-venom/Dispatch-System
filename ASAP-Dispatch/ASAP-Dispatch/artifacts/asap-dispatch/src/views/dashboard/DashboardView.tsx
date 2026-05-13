import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Phone,
  Shield,
  Users,
  TrendingUp,
  ArrowUpRight,
  AlertOctagon,
  MapPin,
} from "lucide-react";
import { useApp, useNow } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  GuardStatusBadge,
  IncidentStatusBadge,
  SeverityBadge,
  ShiftStatusBadge,
} from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { isoDay, formatTimeWithSeconds, relativeTime, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShiftDetailModal } from "@/components/modals/ShiftDetailModal";
import { Shift } from "@/types";

export function DashboardView() {
  const { guards, sites, shifts, incidents, currentUser, setView, panicActive, panicGuardId } = useApp();
  const now = useNow(1000);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const today = isoDay(new Date());
  const todayShifts = shifts.filter((s) => s.date === today);
  const activeGuards = guards.filter(
    (g) => g.status === "active" || g.status === "on-patrol"
  );
  const lateGuards = guards.filter((g) => g.status === "late" || g.status === "missing");
  const openIncidents = incidents.filter((i) => i.status === "open").slice(0, 5);

  const stats = [
    {
      icon: <Users size={18} />,
      label: "Active Guards",
      value: activeGuards.length,
      total: guards.length,
      accent: "green" as const,
      target: "tracker" as const,
      gradient: "from-green-500/10 to-transparent"
    },
    {
      icon: <Calendar size={18} />,
      label: "Shifts Today",
      value: todayShifts.length,
      sub: `${todayShifts.filter((s) => s.status === "active").length} active`,
      accent: "blue" as const,
      target: "scheduler" as const,
      gradient: "from-blue-500/10 to-transparent"
    },
    {
      icon: <AlertTriangle size={18} />,
      label: "Open Incidents",
      value: incidents.filter((i) => i.status === "open").length,
      sub: `${incidents.filter((i) => i.severity === "emergency").length} emergency`,
      accent: "red" as const,
      target: "incidents" as const,
      gradient: "from-red-500/10 to-transparent"
    },
    {
      icon: <Shield size={18} />,
      label: "Sites Covered",
      value: sites.filter((s) => s.status === "active").length,
      total: sites.length,
      accent: "orange" as const,
      target: "sites" as const,
      gradient: "from-orange-500/10 to-transparent"
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#FF5C00] mb-1">
            Command Overview
          </div>
          <h1 className="font-display text-2xl md:text-3xl">
            {currentUser ? `Good ${greeting(now)}, ${currentUser.name.split(" ")[0]}` : "Welcome"}
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {activeGuards.length} guards on shift across {sites.filter(s => s.status === "active").length} sites · {formatTimeWithSeconds(now)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Calendar size={14} />} onClick={() => setView("scheduler")}>
            Open Scheduler
          </Button>
          <Button variant="primary" icon={<Activity size={14} />} onClick={() => setView("tracker")}>
            Live Tracker
          </Button>
        </div>
      </div>

      {/* Panic banner */}
      {panicActive && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center pulse-ring">
              <AlertOctagon size={20} className="text-red-400" />
            </div>
            <div>
              <div className="font-display text-base">PANIC ALERT ACTIVE</div>
              <div className="text-sm text-[#94A3B8]">
                {guards.find((g) => g.id === panicGuardId)?.name ?? "Guard"} —
                immediate response required
              </div>
            </div>
          </div>
          <Button variant="primary" onClick={() => setView("tracker")}>
            Respond Now
          </Button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="cursor-pointer"
            onClick={() => setView(s.target)}
          >
            <Card accent={s.accent} padded className={cn("relative overflow-hidden group border-white/[0.06] hover:border-white/20 transition-all", `bg-gradient-to-br ${s.gradient}`)}>
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={14} className="text-[#FF5C00]" />
              </div>
              <div className="flex items-start justify-between relative z-10">
                <div className="text-[#94A3B8] group-hover:text-white transition-colors">{s.icon}</div>
              </div>
              <div className="font-display text-3xl mt-3 relative z-10">
                {s.value}
                {s.total != null && (
                  <span className="text-[#94A3B8] text-base group-hover:text-[#64748B] transition-colors"> / {s.total}</span>
                )}
              </div>
              <div className="text-xs uppercase tracking-wider text-[#94A3B8] mt-1 group-hover:text-[#F1F5F9] transition-colors relative z-10">
                {s.label}
              </div>
              {s.sub && (
                <div className="text-[10px] text-[#94A3B8] mt-1 group-hover:text-[#94A3B8] transition-colors relative z-10">{s.sub}</div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today's Schedule - Middle Section */}
      <Card padded={false} className="border-white/[0.06] overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-white/[0.06] gap-4">
          <h2 className="font-display text-lg tracking-tight">Today's Schedule</h2>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-[#94A3B8] mr-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Confirmed</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Scheduled</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Late</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-xs flex items-center gap-2 cursor-pointer hover:bg-white/[0.05]">
                All Schedules <ArrowUpRight size={12} className="rotate-90" />
              </div>
              <Button size="sm" variant="secondary">TASK LISTS</Button>
              <Button size="sm" variant="secondary">CALENDAR SYNC</Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1200px]">
            {/* Timeline Header */}
            <div className="grid grid-cols-[240px_1fr] border-b border-white/[0.06]">
              <div className="p-3 text-[10px] uppercase tracking-widest font-bold text-[#94A3B8] border-r border-white/[0.06]">
                Name / Site
              </div>
              <div className="grid grid-cols-24 relative" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = i % 24;
                  const displayH = h === 0 ? "12A" : h < 12 ? `${h}A` : h === 12 ? "12P" : `${h - 12}P`;
                  return (
                    <div key={i} className="py-3 text-center text-[10px] font-bold text-[#94A3B8] border-r border-white/[0.03]">
                      {displayH}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Rows */}
            <div className="relative">
              {guards.map((g, idx) => {
                const shift = todayShifts.find((s) => s.guardId === g.id);
                const isLast = idx === guards.length - 1;
                return (
                  <div key={g.id} className={cn("grid grid-cols-[240px_1fr] group", !isLast && "border-b border-white/[0.03]")}>
                    <div className="p-3 border-r border-white/[0.06] bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar name={g.name} size={32} />
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-[#F1F5F9] truncate">{g.name}</div>
                          <div className="text-[10px] text-[#94A3B8] truncate">({g.site || "Unassigned"})</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[9px] text-[#94A3B8]">
                        <span className="flex items-center gap-1"><Clock size={10} /> 0</span>
                        <span className="flex items-center gap-1 text-red-400/80"><AlertTriangle size={10} /> 0</span>
                      </div>
                    </div>
                    
                    <div className="relative h-full bg-[#06080F]/50 group-hover:bg-[#06080F]/80 transition-colors">
                      {/* Grid lines background */}
                      <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="border-r border-white/[0.02] h-full" />
                        ))}
                      </div>
                      
                      {shift && (
                        <ShiftBar 
                          shift={shift} 
                          now={now} 
                          onClick={() => setSelectedShift(shift)} 
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Three column main */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Today's Operations */}
        <Card className="xl:col-span-4" padded={false}>
          <div className="flex items-center justify-between px-4 pt-4 mb-2">
            <h2 className="font-display text-base">Today's Operations</h2>
            <Badge color="green" pulse>{activeGuards.length} live</Badge>
          </div>
          <div className="px-2 pb-2 max-h-[480px] overflow-y-auto">
            {guards.slice(0, 7).map((g) => {
              const shift = todayShifts.find((s) => s.guardId === g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => setView("tracker")}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition text-left"
                >
                  <Avatar name={g.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#F1F5F9] truncate font-medium">
                      {g.name}
                    </div>
                    <div className="text-xs text-[#94A3B8] truncate flex items-center gap-1">
                      <Shield size={10} />
                      {g.site}
                      {shift && (
                        <span className="text-[#94A3B8]">
                          {" · "} {shift.startTime}–{shift.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <GuardStatusBadge status={g.status} />
                </button>
              );
            })}
          </div>
        </Card>

        {/* Live Mini Map / Site Status */}
        <Card className="xl:col-span-4" padded={false}>
          <div className="flex items-center justify-between px-4 pt-4 mb-3">
            <h2 className="font-display text-base">Site Status</h2>
            <button
              onClick={() => setView("sites")}
              className="text-xs text-[#94A3B8] hover:text-white"
            >
              View all
            </button>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {sites.map((site) => {
              const guardsHere = guards.filter((g) => g.site === site.name);
              const activeHere = guardsHere.filter(
                (g) => g.status === "active" || g.status === "on-patrol"
              ).length;
              return (
                <div
                  key={site.id}
                  className="p-3 rounded-lg bg-[#06080F] border border-white/[0.06]"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{site.name}</div>
                    <Badge color={site.status === "active" ? "green" : site.status === "alert" ? "red" : "blue"} pulse={site.status === "alert"}>
                      {site.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-1">
                    {site.address}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] uppercase tracking-wider text-[#94A3B8]">
                    <span>{guardsHere.length} assigned</span>
                    <span className="text-green-400">{activeHere} active</span>
                    <span>{site.checkpoints.length} checkpoints</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Alerts feed */}
        <Card className="xl:col-span-4" padded={false}>
          <div className="flex items-center justify-between px-4 pt-4 mb-3">
            <h2 className="font-display text-base">Live Alert Feed</h2>
            <button
              onClick={() => setView("incidents")}
              className="text-xs text-[#94A3B8] hover:text-white"
            >
              All incidents
            </button>
          </div>
          <div className="px-4 pb-4 space-y-2 max-h-[480px] overflow-y-auto">
            {lateGuards.map((g) => (
              <div
                key={`late-${g.id}`}
                className="p-3 rounded-lg bg-yellow-500/[0.08] border border-yellow-500/30 flex items-start gap-3"
              >
                <Clock size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    {g.name} is {g.status}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">
                    {g.site} · last activity {relativeTime(g.lastActivity)}
                  </div>
                </div>
              </div>
            ))}
            {openIncidents.map((i) => {
              const g = guards.find((x) => x.id === i.guardId);
              return (
                <button
                  key={`inc-${i.id}`}
                  onClick={() => setView("incidents")}
                  className="w-full text-left p-3 rounded-lg bg-[#06080F] border border-white/[0.06] hover:border-white/15 transition"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <SeverityBadge severity={i.severity} />
                    <IncidentStatusBadge status={i.status} />
                  </div>
                  <div className="text-sm leading-snug">{i.title}</div>
                  <div className="text-[10px] text-[#94A3B8] mt-1">
                    {g?.name ?? "—"} · {relativeTime(i.createdAt)}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom shift timeline */}


      <div className="grid md:grid-cols-2 gap-4">
        <Card padded>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base">Recent Activity</h3>
            <Activity size={14} className="text-[#FF5C00]" />
          </div>
          <div className="space-y-2.5">
            {[
              { t: "Aisha Farouk reported south gate lock issue", time: "30m ago" },
              { t: "Marcus Johnson completed rooftop check", time: "1h ago" },
              { t: "Khalid Reyes scanned east entrance", time: "1h 18m ago" },
              { t: "Diana Okafor marked as late at Skyline", time: "22m ago" },
              { t: "Tomas Reyes triggered panic at North Industrial", time: "12m ago" },
            ].map((x, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="w-1 h-1 rounded-full bg-[#FF5C00] mt-2 shrink-0" />
                <span className="flex-1 text-[#F1F5F9]">{x.t}</span>
                <span className="text-[10px] text-[#94A3B8] font-mono shrink-0">{x.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padded>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base">Quick Actions</h3>
            <TrendingUp size={14} className="text-[#FF5C00]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(currentUser?.role === "admin" || currentUser?.role === "supervisor" || currentUser?.role === "dispatcher") && (
              <Button variant="secondary" icon={<Calendar size={14} />} onClick={() => setView("scheduler")}>Add shift</Button>
            )}
            {(currentUser?.role === "admin" || currentUser?.role === "supervisor" || currentUser?.role === "dispatcher") && (
              <Button variant="secondary" icon={<Phone size={14} />} onClick={() => setView("calls")}>Open dialer</Button>
            )}
            <Button variant="secondary" icon={<AlertTriangle size={14} />} onClick={() => setView("incidents")}>Log incident</Button>
            {(currentUser?.role === "admin" || currentUser?.role === "supervisor") && (
              <Button variant="secondary" icon={<Users size={14} />} onClick={() => setView("users")}>Manage guards</Button>
            )}
          </div>
        </Card>
      </div>
      
      <AnimatePresence>
        {selectedShift && (
          <ShiftDetailModal 
            shift={selectedShift} 
            onClose={() => setSelectedShift(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ShiftBar({ 
  shift, 
  now, 
  onClick 
}: { 
  shift: Shift; 
  now: Date; 
  onClick?: () => void;
}) {
  const { sites } = useApp();
  const site = sites.find(s => s.id === shift.siteId);
  const startMin = parseTime(shift.startTime);
  let endMin = parseTime(shift.endTime);
  if (endMin <= startMin) endMin += 24 * 60; // overnight

  const leftPct = (startMin / (24 * 60)) * 100;
  let widthPct = ((endMin - startMin) / (24 * 60)) * 100;
  if (widthPct < 1) widthPct = 1;

  const colorMap: Record<string, string> = {
    active: "bg-green-500/80 border-green-400/50",
    confirmed: "bg-blue-500/80 border-blue-400/50",
    scheduled: "bg-slate-500/80 border-slate-400/50",
    late: "bg-yellow-500/80 border-yellow-400/50",
    missed: "bg-red-500/80 border-red-400/50",
    completed: "bg-purple-500/80 border-purple-400/50",
  };

  const displayStart = formatTimeSimple(shift.startTime);
  const displayEnd = formatTimeSimple(shift.endTime);

  return (
    <div
      className={cn(
        "absolute top-2 bottom-2 rounded-lg border shadow-lg text-[10px] text-white/90 px-3 flex items-center font-medium z-10 hover:z-20 transition-all cursor-pointer select-none overflow-hidden hover:scale-[1.02] active:scale-[0.98]",
        colorMap[shift.status]
      )}
      onClick={onClick}
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
    >
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="font-bold">{displayStart} ~ {displayEnd}</span>
        <span className="opacity-80">at {site?.name || "Site"}</span>
        <span className="px-1.5 py-0.5 rounded bg-black/20 text-[8px] uppercase tracking-tighter">GUARD</span>
        {site && <MapPin size={10} className="opacity-60" />}
      </div>
    </div>
  );
}

function formatTimeSimple(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "p" : "a";
  const displayH = h % 12 || 12;
  return `${displayH}${m === 0 ? "" : ":" + String(m).padStart(2, "0")}${suffix}`;
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
