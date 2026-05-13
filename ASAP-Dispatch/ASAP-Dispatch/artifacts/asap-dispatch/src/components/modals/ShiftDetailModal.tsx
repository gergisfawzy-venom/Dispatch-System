import React from "react";
import { 
  X, 
  Clock, 
  MapPin, 
  User, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Shift, Guard, Site, Incident } from "@/types";
import { useApp } from "@/context/AppContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  shift: Shift;
  onClose: () => void;
}

export function ShiftDetailModal({ shift, onClose }: Props) {
  const { guards, sites, incidents } = useApp();
  
  const guard = guards.find(g => g.id === shift.guardId);
  const site = sites.find(s => s.id === shift.siteId);
  const shiftIncidents = incidents.filter(i => i.guardId === shift.guardId && i.siteId === shift.siteId);

  // Mock events for the timeline
  const events = [
    { type: "clock-in", time: shift.actualClockIn || shift.startTime, label: "Clocked In", icon: <Clock size={12} className="text-green-400" /> },
    ...shift.tasks.filter(t => t.completed).map(t => ({
      type: "task",
      time: "10:15", // Mock time
      label: `Completed: ${t.text}`,
      icon: <CheckCircle2 size={12} className="text-blue-400" />
    })),
    ...shiftIncidents.map(i => ({
      type: "incident",
      time: "11:45", // Mock time
      label: `Incident: ${i.title}`,
      icon: <AlertTriangle size={12} className="text-red-400" />
    })),
    { type: "clock-out", time: shift.actualClockOut || shift.endTime, label: "Scheduled End", icon: <Clock size={12} className="text-slate-400" /> },
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0A0E1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5C00]/10 flex items-center justify-center text-[#FF5C00]">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold">Shift Details</h2>
              <p className="text-xs text-[#94A3B8]">{shift.date}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-[#94A3B8] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card padded className="bg-white/[0.01] border-white/[0.06]">
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#64748B] mb-3">Assigned Guard</div>
              <div className="flex items-center gap-3">
                <Avatar name={guard?.name || "Unknown"} size={40} src={guard?.avatar} ring />
                <div>
                  <div className="text-sm font-bold text-white">{guard?.name || "Unknown"}</div>
                  <div className="text-xs text-[#94A3B8]">Ext: {guard?.extension}</div>
                </div>
              </div>
            </Card>

            <Card padded className="bg-white/[0.01] border-white/[0.06]">
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#64748B] mb-3">Service Site</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#94A3B8]">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{site?.name || "Unknown Site"}</div>
                  <div className="text-xs text-[#94A3B8] truncate max-w-[180px]">{site?.address}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Shift Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-[#FF5C00]" />
                Shift Timeline
              </h3>
              <Badge color={shift.status === 'active' ? 'green' : 'gray'}>{shift.status.toUpperCase()}</Badge>
            </div>
            
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
              {events.map((event, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-[#0A0E1A] border-2 border-white/20 flex items-center justify-center z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                  <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                        {event.icon}
                      </div>
                      <span className="text-sm text-[#F1F5F9] font-medium">{event.label}</span>
                    </div>
                    <span className="text-xs font-mono text-[#94A3B8]">{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks & Requirements */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#FF5C00]" />
              Assigned Tasks
            </h3>
            <div className="grid gap-2">
              {shift.tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center transition-colors",
                    task.completed ? "bg-green-500/20 text-green-400" : "bg-white/5 text-[#64748B]"
                  )}>
                    {task.completed && <CheckCircle2 size={12} />}
                  </div>
                  <span className={cn("text-sm transition-colors", task.completed ? "text-[#94A3B8] line-through" : "text-[#F1F5F9]")}>
                    {task.text}
                  </span>
                  {task.completedAt && (
                    <span className="ml-auto text-[10px] font-mono text-[#64748B]">
                      {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}
              {shift.tasks.length === 0 && (
                <div className="text-center py-4 text-[#64748B] text-xs italic">
                  No specific tasks assigned to this shift
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary">Edit Shift</Button>
        </div>
      </motion.div>
    </div>
  );
}
