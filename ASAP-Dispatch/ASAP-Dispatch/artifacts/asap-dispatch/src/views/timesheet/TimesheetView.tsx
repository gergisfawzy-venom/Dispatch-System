import { useEffect, useState } from "react";
import { Play, Pause, Square, Coffee, MapPin, Camera, Download, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, useNow } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { durationLabel, isoDay, formatTime } from "@/lib/utils";

export function TimesheetView() {
  const { guards, sites, shifts, toast, upsertShift, nextId } = useApp();
  const [activeGuardId, setActiveGuardId] = useState<number>(guards[0]!.id);
  const [manualOpen, setManualOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredGuards = guards.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const guard = guards.find((g) => g.id === activeGuardId)!;
  const today = isoDay(new Date());
  // Show all shifts, sorted by date descending
  const guardShifts = [...shifts]
    .filter((s) => s.guardId === activeGuardId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#FF5C00] mb-1">Timesheet</div>
          <h1 className="font-display text-2xl md:text-3xl">Clock & Hours</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Track shifts, breaks, and approve hours</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Plus size={14} />} onClick={() => setManualOpen(true)}>Manual entry</Button>
          <Button variant="secondary" icon={<Download size={14} />} onClick={() => toast("Timesheet exported as CSV", "info")}>Export</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        {/* Clock card */}
        {/* Guard List */}
        <Card padded className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base">Team Directory</h2>
            <Badge color="gray" size="sm">{filteredGuards.length}</Badge>
          </div>
          <div className="mb-4">
            <Input 
              placeholder="Search guard..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#06080F]"
            />
          </div>
          <div className="overflow-y-auto space-y-2 flex-1 pr-2">
            {filteredGuards.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGuardId(g.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition ${activeGuardId === g.id ? "bg-white/10 border-white/20" : "bg-[#06080F] border-white/5 hover:border-white/10"}`}
              >
                <Avatar name={g.name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#F1F5F9] truncate">{g.name}</div>
                  <div className="text-xs text-[#94A3B8] truncate">{g.weeklyHours?.toFixed(1) || 0}h logged</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Recent log */}
        <Card padded={false}>
          <div className="px-4 pt-4 mb-3 flex items-center justify-between">
            <h2 className="font-display text-base">Recent Shifts — {guard.name}</h2>
            <Badge color="orange">{guard.weeklyHours.toFixed(1)}h this week</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#94A3B8] border-b border-white/[0.06]">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Site</th>
                  <th className="px-4 py-2 font-medium text-[#94A3B8]">Scheduled</th>
                  <th className="px-4 py-2 font-medium">Actual In</th>
                  <th className="px-4 py-2 font-medium">Actual Out</th>
                  <th className="px-4 py-2 font-medium">Duration</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {guardShifts.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#94A3B8]">No shifts in the recent window</td></tr>
                )}
                {guardShifts.map((s) => {
                  const start = parseTime(s.startTime);
                  const end = parseTime(s.endTime);
                  const dur = end > start ? end - start : 1440 - start + end;
                  const isStarted = s.status === "active" || s.status === "completed" || s.status === "late";
                  const isFinished = s.status === "completed";
                  return (
                    <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs">{s.date}{s.date === today && <Badge color="orange" size="sm" className="ml-2">Today</Badge>}</td>
                      <td className="px-4 py-3">{sites.find((x) => x.id === s.siteId)?.name}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#94A3B8]">{s.startTime} – {s.endTime}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#F1F5F9]">
                        {isStarted ? (s.actualClockIn || s.startTime) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#F1F5F9]">
                        {isFinished ? (s.actualClockOut || s.endTime) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {isFinished 
                          ? (s.actualClockIn && s.actualClockOut 
                              ? `${((parseTime(s.actualClockOut) - parseTime(s.actualClockIn)) / 60).toFixed(1)}h`
                              : `${(dur / 60).toFixed(1)}h`)
                          : "—"}
                      </td>
                      <td className="px-4 py-3"><Badge color={statusColor(s.status)}>{s.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>



      {manualOpen && (
        <ManualEntryModal onClose={() => setManualOpen(false)} />
      )}
    </div>
  );
}

function ManualEntryModal({ onClose }: { onClose: () => void }) {
  const { guards, sites, upsertShift, nextId, toast } = useApp();
  const [guardId, setGuardId] = useState(guards[0]!.id);
  const [siteId, setSiteId] = useState(sites[0]!.id);
  const [date, setDate] = useState(isoDay(new Date()));
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("16:00");

  function save() {
    upsertShift({
      id: nextId(),
      guardId,
      siteId,
      date,
      startTime: start,
      endTime: end,
      role: "Guard",
      status: "completed",
      tasks: [],
    });
    toast("Manual entry added");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Manual Time Entry"
      width="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Add entry</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Select label="Guard" value={guardId} onChange={(e) => setGuardId(Number(e.target.value))} options={guards.map((g) => ({ value: g.id, label: g.name }))} />
        <Select label="Site" value={siteId} onChange={(e) => setSiteId(Number(e.target.value))} options={sites.map((s) => ({ value: s.id, label: s.name }))} />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div />
        <Input label="Start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        <Input label="End" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
    </Modal>
  );
}

function statusColor(s: string): Parameters<typeof Badge>[0]["color"] {
  switch (s) {
    case "active": return "green";
    case "confirmed": return "blue";
    case "published": return "orange";
    case "completed": return "purple";
    case "late": return "yellow";
    case "missed": return "red";
    case "scheduled": return "gray";
    default: return "gray";
  }
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
