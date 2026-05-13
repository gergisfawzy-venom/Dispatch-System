import { useMemo, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, ArrowRightLeft, CalendarOff, AlertTriangle, Trash2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ShiftStatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { addDays, isoDay, startOfWeek, dayLabel, cn } from "@/lib/utils";
import type { Shift, ShiftTask } from "@/types";

export function SchedulerView() {
  const {
    guards,
    sites,
    shifts,
    swapRequests,
    timeOffRequests,
    upsertShift,
    deleteShift,
    resolveSwap,
    resolveTimeOff,
    toast,
    nextId,
    currentUser,
  } = useApp();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [viewRange, setViewRange] = useState<7 | 14 | 30>(7);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [adding, setAdding] = useState<{ date: string; guardId: number } | null>(null);
  const [tasksFor, setTasksFor] = useState<Shift | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Shift | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ guardId: number; date: string } | null>(null);

  function handleDrop(guardId: number, date: string) {
    setDragOverCell(null);
    const shiftId = Number(window.localStorage.getItem("draggingShiftId"));
    if (!shiftId) return;

    const shift = shifts.find((s) => s.id === shiftId);
    if (shift) {
      if (shift.guardId === guardId && shift.date === date) return;
      
      // Check if target is already occupied
      const existing = shifts.find(s => s.guardId === guardId && s.date === date && s.id !== shiftId);
      if (existing) {
        toast("Slot already occupied", "warn");
        return;
      }

      upsertShift({ ...shift, guardId, date });
      toast(`Shift moved to ${guards.find(g => g.id === guardId)?.name} on ${date}`);
    }
  }

  const days = useMemo(
    () => Array.from({ length: viewRange }).map((_, i) => addDays(weekStart, i)),
    [weekStart, viewRange]
  );

  const totalsByGuard = useMemo(() => {
    const out: Record<number, number> = {};
    shifts.forEach((s) => {
      const start = parseTime(s.startTime);
      const end = parseTime(s.endTime);
      const dur = end > start ? end - start : 1440 - start + end;
      out[s.guardId] = (out[s.guardId] ?? 0) + dur / 60;
    });
    return out;
  }, [shifts]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#FF5C00] mb-1">Scheduler</div>
          <h1 className="font-display text-2xl md:text-3xl">Weekly Shift Plan</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – {addDays(weekStart, 6).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-[#06080F] border border-white/10 rounded-lg p-1 mr-2">
            {[
              { l: "Week", v: 7 },
              { l: "2 Weeks", v: 14 },
              { l: "Month", v: 30 },
            ].map((r) => (
              <button
                key={r.v}
                onClick={() => setViewRange(r.v as any)}
                className={cn(
                  "px-3 py-1 text-[10px] uppercase tracking-wider rounded font-medium transition",
                  viewRange === r.v ? "bg-[#FF5C00] text-white" : "text-[#94A3B8] hover:text-white"
                )}
              >
                {r.l}
              </button>
            ))}
          </div>
          <Button variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => setWeekStart(addDays(weekStart, -viewRange))}>Prev</Button>
          <Button variant="secondary" onClick={() => setWeekStart(startOfWeek(new Date()))}>Today</Button>
          <Button variant="ghost" iconRight={<ChevronRight size={14} />} onClick={() => setWeekStart(addDays(weekStart, viewRange))}>Next</Button>
          {shifts.some(s => s.status === "scheduled" && days.some(d => isoDay(d) === s.date)) && (
            <Button 
              variant="secondary" 
              className="bg-[#FF5C00]/10 border-[#FF5C00]/20 text-[#FF5C00] hover:bg-[#FF5C00] hover:text-white"
              icon={<ArrowRightLeft size={14} className="rotate-90" />}
              onClick={() => {
                const visibleDates = days.map(isoDay);
                shifts.forEach(s => {
                  if (s.status === "scheduled" && visibleDates.includes(s.date)) {
                    upsertShift({ ...s, status: "published" });
                  }
                });
                toast("All visible shifts published");
              }}
            >
              Publish All
            </Button>
          )}
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setAdding({ date: isoDay(days[0]!), guardId: guards[0]!.id })}>Add Shift</Button>
        </div>
      </div>

      {/* Grid */}
      <Card padded={false}>
        <div className="overflow-x-auto">
          <div className={cn("min-w-[1100px]", viewRange > 7 && "min-w-[1800px]", viewRange === 30 && "min-w-[3000px]")}>
            <div
              className="grid border-b border-white/[0.06] bg-[#0F1525] sticky top-0 z-10"
              style={{ gridTemplateColumns: `180px repeat(${viewRange}, 1fr)` }}
            >
              <div className="px-3 py-3 text-xs uppercase tracking-wider text-[#94A3B8]">Guard</div>
              {days.map((d) => (
                <div key={d.toISOString()} className="px-3 py-3 text-center border-l border-white/[0.04]">
                  <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">{dayLabel(d)}</div>
                  <div className="text-sm text-[#F1F5F9] mt-0.5">{d.getDate()}</div>
                </div>
              ))}
            </div>
            {guards.map((g) => {
              const total = totalsByGuard[g.id] ?? 0;
              const overtime = total > 40;
              return (
                <div
                  key={g.id}
                  className="grid border-b border-white/[0.04] hover:bg-white/[0.01]"
                  style={{ gridTemplateColumns: `180px repeat(${viewRange}, 1fr)` }}
                >
                  <div className="p-3 flex items-center gap-2 min-w-0">
                    <Avatar name={g.name} size={32} />
                    <div className="min-w-0">
                      <div className="text-sm truncate">{g.name}</div>
                      <div className={cn("text-[10px] uppercase tracking-wider font-mono", overtime ? "text-yellow-400" : "text-[#94A3B8]")}>
                        {total.toFixed(1)}h
                        {overtime && (
                          <AlertTriangle size={10} className="inline ml-1 -mt-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                  {days.map((d) => {
                    const date = isoDay(d);
                    const shift = shifts.find((s) => s.guardId === g.id && s.date === date);
                    const isDragOver = dragOverCell?.guardId === g.id && dragOverCell?.date === date;
                    
                    return (
                      <div
                        key={date}
                        className={cn(
                          "p-1 border-l border-white/[0.04] min-h-[64px] transition-colors",
                          isDragOver && "bg-[#FF5C00]/10"
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverCell?.guardId !== g.id || dragOverCell?.date !== date) {
                            setDragOverCell({ guardId: g.id, date });
                          }
                        }}
                        onDragLeave={() => setDragOverCell(null)}
                        onDrop={() => handleDrop(g.id, date)}
                      >
                        {shift ? (
                          <ShiftCell
                            shift={shift}
                            site={sites.find((s) => s.id === shift.siteId)?.name ?? "—"}
                            onClick={() => setEditing(shift)}
                            onTasks={() => setTasksFor(shift)}
                          />
                        ) : (
                          <button
                            onClick={() => setAdding({ date, guardId: g.id })}
                            className="w-full h-full min-h-[56px] rounded-lg border border-dashed border-white/[0.04] hover:border-[#FF5C00]/30 text-[#94A3B8] hover:text-[#FF5C00] transition-all flex items-center justify-center group"
                          >
                            <Plus size={14} className="group-hover:scale-125 transition" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Pending requests & History */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wider text-[#94A3B8]">Pending Actions</h3>
            <div className="flex gap-2">
              <Badge color="blue" size="sm">{swapRequests.length} Swaps</Badge>
              <Badge color="orange" size="sm">{timeOffRequests.length} Time-Off</Badge>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {swapRequests.map((r) => {
              const requester = guards.find((g) => g.id === r.requestedById);
              const target = guards.find((g) => g.id === r.requestedGuardId);
              const shift = shifts.find((s) => s.id === r.shiftId);
              return (
                <Card key={r.id} accent="blue" className="bg-[#06080F]">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={requester?.name ?? ""} size={24} />
                    <span className="text-xs font-medium truncate">{requester?.name}</span>
                    <ArrowRightLeft size={10} className="text-[#94A3B8]" />
                    <Avatar name={target?.name ?? ""} size={24} />
                    <span className="text-xs font-medium truncate">{target?.name}</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mb-2 font-mono">
                    {shift?.date} · {shift?.startTime}–{shift?.endTime}
                  </div>
                  <p className="text-[10px] text-[#94A3B8] italic mb-3">"{r.reason}"</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" icon={<Check size={10} />} onClick={() => { resolveSwap(r.id, true, r.requestedGuardId); toast("Swap approved"); }}>Approve</Button>
                    <Button size="sm" variant="danger" icon={<X size={10} />} onClick={() => { resolveSwap(r.id, false); toast("Swap rejected", "info"); }}>Reject</Button>
                  </div>
                </Card>
              );
            })}
            {timeOffRequests.map((r) => {
              const g = guards.find((x) => x.id === r.guardId);
              return (
                <Card key={r.id} accent="orange" className="bg-[#06080F]">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={g?.name ?? ""} size={24} />
                    <span className="text-xs font-medium">{g?.name}</span>
                    <span className="text-[10px] text-[#94A3B8]">· {r.date}</span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] italic mb-3">"{r.reason}"</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" icon={<Check size={10} />} onClick={() => { resolveTimeOff(r.id, true); toast("Time off approved"); }}>Approve</Button>
                    <Button size="sm" variant="danger" icon={<X size={10} />} onClick={() => { resolveTimeOff(r.id, false); toast("Time off rejected", "info"); }}>Reject</Button>
                  </div>
                </Card>
              );
            })}
            {swapRequests.length === 0 && timeOffRequests.length === 0 && (
              <div className="md:col-span-2 py-8 text-center border border-dashed border-white/10 rounded-xl text-[#94A3B8] text-xs">
                No pending requests
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-[#94A3B8]">Request History</h3>
          <Card className="bg-[#06080F] max-h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {useApp().requestLogs.length > 0 ? useApp().requestLogs.map(log => (
                <div key={log.id} className="text-[10px] pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn("px-1.5 py-0.5 rounded uppercase font-bold", log.status === "approved" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                      {log.status}
                    </span>
                    <span className="text-[#94A3B8]">{log.resolvedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-white font-medium mb-0.5">
                    {log.type === "swap" ? `${log.guardName} ⇄ ${log.targetGuardName}` : `${log.guardName} (Time-off)`}
                  </div>
                  <div className="text-[#94A3B8] line-clamp-1">{log.details}</div>
                </div>
              )) : (
                <div className="text-center py-10 text-[#94A3B8] text-xs italic">
                  No history recorded yet
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <ShiftModal
            key={`edit-${editing.id}`}
            shift={editing}
            onClose={() => setEditing(null)}
            onDelete={() => { setConfirmDelete(editing); setEditing(null); }}
          />
        )}
        {adding && (
          <ShiftModal
            key="add"
            shift={{
              id: nextId(),
              guardId: adding.guardId,
              siteId: sites[0]!.id,
              date: adding.date,
              startTime: "08:00",
              endTime: "16:00",
              role: "Guard",
              status: "scheduled",
              tasks: [],
            }}
            onClose={() => setAdding(null)}
            isNew
          />
        )}
        {tasksFor && (
          <TasksModal
            shift={tasksFor}
            onClose={() => setTasksFor(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteShift(confirmDelete.id);
            toast("Shift deleted", "info");
          }
        }}
        title="Delete this shift?"
        description="This will remove the shift from the schedule and any associated tasks. This cannot be undone."
        confirmText="Delete shift"
        destructive
      />
    </div>
  );
}

function ShiftCell({ shift, site, onClick, onTasks }: { shift: Shift; site: string; onClick: () => void; onTasks: () => void }) {
  const { upsertShift, toast } = useApp();
  const colorMap: Record<string, string> = {
    active: "bg-green-500/15 border-green-500/40 text-green-300",
    confirmed: "bg-blue-500/15 border-blue-500/40 text-blue-300",
    published: "bg-[#FF5C00]/15 border-[#FF5C00]/40 text-[#FF5C00]",
    scheduled: "bg-white/[0.04] border-white/10 text-[#F1F5F9]",
    late: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
    missed: "bg-red-500/15 border-red-500/40 text-red-300",
    completed: "bg-purple-500/15 border-purple-500/40 text-purple-300",
  };
  const completed = shift.tasks.filter((t) => t.completed).length;
  return (
    <motion.div
      layoutId={`shift-${shift.id}`}
      draggable
      onDragStart={(e: any) => {
        window.localStorage.setItem("draggingShiftId", String(shift.id));
        e.dataTransfer.setData("text/plain", String(shift.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "h-full rounded border p-1.5 text-left cursor-grab active:cursor-grabbing transition shadow-lg relative group/cell",
        colorMap[shift.status]
      )}
      onClick={onClick}
    >
      <div className="font-mono text-[10px] flex justify-between items-start">
        <span>{shift.startTime}–{shift.endTime}</span>
        <div className="opacity-0 group-hover/cell:opacity-100 transition-opacity flex gap-1 -mt-0.5 -mr-0.5">
          {shift.status === "scheduled" && (
            <button 
              onClick={(e) => { e.stopPropagation(); upsertShift({ ...shift, status: "published" }); toast("Shift published"); }}
              className="p-1 rounded bg-[#FF5C00] text-white hover:scale-110 transition shadow-lg"
              title="Publish Shift"
            >
              <ArrowRightLeft size={10} className="rotate-90" />
            </button>
          )}
          {shift.status === "published" && (
            <button 
              onClick={(e) => { e.stopPropagation(); upsertShift({ ...shift, status: "confirmed" }); toast("Shift confirmed"); }}
              className="p-1 rounded bg-blue-500 text-white hover:scale-110 transition shadow-lg"
              title="Confirm Shift"
            >
              <Check size={10} />
            </button>
          )}
        </div>
      </div>
      <div className="text-xs truncate font-medium">{site}</div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-[10px] uppercase tracking-wider opacity-70">{shift.status}</div>
        {shift.tasks.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onTasks(); }}
            className="text-[10px] text-[#94A3B8] hover:text-white underline"
          >
            {completed}/{shift.tasks.length}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ShiftModal({ shift: initial, onClose, onDelete, isNew }: { shift: Shift; onClose: () => void; onDelete?: () => void; isNew?: boolean }) {
  const { guards, sites, upsertShift, toast, currentUser } = useApp();
  const [shift, setShift] = useState<Shift>(initial);
  const guard = guards.find((g) => g.id === shift.guardId);

  function save() {
    upsertShift(shift);
    toast(isNew ? "Shift added to schedule" : "Shift updated");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "Add Shift" : `Edit Shift — ${guard?.name ?? ""}`}
      width="md"
      footer={
        <>
          {!isNew && onDelete && (currentUser?.role === "admin" || currentUser?.role === "supervisor") && (
            <Button variant="danger" icon={<Trash2 size={14} />} onClick={onDelete}>Delete</Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>{isNew ? "Add shift" : "Save changes"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Guard"
          value={shift.guardId}
          onChange={(e) => setShift({ ...shift, guardId: Number(e.target.value) })}
          options={guards.map((g) => ({ value: g.id, label: g.name }))}
        />
        <Select
          label="Site"
          value={shift.siteId}
          onChange={(e) => setShift({ ...shift, siteId: Number(e.target.value) })}
          options={sites.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Input
          label="Date"
          type="date"
          value={shift.date}
          onChange={(e) => setShift({ ...shift, date: e.target.value })}
        />
        <Select
          label="Status"
          value={shift.status}
          onChange={(e) => setShift({ ...shift, status: e.target.value as Shift["status"] })}
          options={[
            { value: "scheduled", label: "Scheduled" },
            { value: "published", label: "Published" },
            { value: "confirmed", label: "Confirmed" },
            { value: "active", label: "Active" },
            { value: "late", label: "Late" },
            { value: "missed", label: "Missed" },
            { value: "completed", label: "Completed" },
          ]}
        />
        <Input
          label="Start time"
          type="time"
          value={shift.startTime}
          onChange={(e) => setShift({ ...shift, startTime: e.target.value })}
        />
        <Input
          label="End time"
          type="time"
          value={shift.endTime}
          onChange={(e) => setShift({ ...shift, endTime: e.target.value })}
        />
        <Input
          label="Role"
          value={shift.role}
          onChange={(e) => setShift({ ...shift, role: e.target.value })}
          className="col-span-2"
        />
        <div className="col-span-2 border-t border-white/[0.06] pt-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs uppercase tracking-wider text-[#94A3B8]">Shift Tasks</h4>
            <Badge color="orange" size="sm">{shift.tasks.length}</Badge>
          </div>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto mb-3">
            {shift.tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                <div className={cn("w-3 h-3 rounded-full border", t.completed ? "bg-green-500 border-green-400" : "border-white/20")} />
                <span className={cn("text-xs flex-1 truncate", t.completed && "line-through opacity-50")}>{t.text}</span>
                <button onClick={() => setShift({ ...shift, tasks: shift.tasks.filter(x => x.id !== t.id) })} className="text-[#94A3B8] hover:text-red-400">
                  <X size={12} />
                </button>
              </div>
            ))}
            {shift.tasks.length === 0 && (
              <div className="text-[10px] text-[#94A3B8] italic text-center py-4">No tasks assigned yet</div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Add task..."
              className="flex-1 bg-white/[0.03] border border-white/10 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF5C00]/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    setShift({ ...shift, tasks: [...shift.tasks, { id: Date.now(), text: val, completed: false }] });
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Add task..."]') as HTMLInputElement;
                if (input && input.value.trim()) {
                  setShift({ ...shift, tasks: [...shift.tasks, { id: Date.now(), text: input.value.trim(), completed: false }] });
                  input.value = "";
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function TasksModal({ shift, onClose }: { shift: Shift; onClose: () => void }) {
  const { upsertShift, nextId, toast } = useApp();
  const [tasks, setTasks] = useState<ShiftTask[]>(shift.tasks);
  const [newTask, setNewTask] = useState("");

  function toggle(id: number) {
    setTasks((arr) => arr.map((t) => (t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined } : t)));
  }
  function add() {
    if (!newTask.trim()) return;
    setTasks((arr) => [...arr, { id: nextId(), text: newTask, completed: false }]);
    setNewTask("");
  }
  function save() {
    upsertShift({ ...shift, tasks });
    toast("Tasks updated");
    onClose();
  }
  function remove(id: number) {
    setTasks((arr) => arr.filter((t) => t.id !== id));
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Shift Tasks"
      width="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save tasks</Button>
        </>
      }
    >
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {tasks.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, height: 0 }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-[#06080F] border border-white/[0.06]"
            >
              <button
                onClick={() => toggle(t.id)}
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition",
                  t.completed ? "bg-green-500 border-green-400 text-white" : "border-white/20"
                )}
              >
                {t.completed && <Check size={12} />}
              </button>
              <span className={cn("flex-1 text-sm", t.completed && "line-through text-[#94A3B8]")}>{t.text}</span>
              <button onClick={() => remove(t.id)} className="text-[#94A3B8] hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New task..."
          className="flex-1"
        />
        <Button variant="primary" icon={<Plus size={14} />} onClick={add}>Add</Button>
      </div>
    </Modal>
  );
}

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
