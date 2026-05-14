import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, AlertTriangle, MapPin, Image as ImageIcon, FileText, Trash2, Eye } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { SeverityBadge, IncidentStatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { relativeTime, cn } from "@/lib/utils";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/types";

export function IncidentsView() {
  const { incidents, guards, sites, upsertIncident, deleteIncident, nextId, toast, currentUser } = useApp();
  const [filter, setFilter] = useState<"all" | IncidentStatus>("all");
  const [sevFilter, setSevFilter] = useState<"all" | IncidentSeverity>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Incident | null>(null);
  const [adding, setAdding] = useState(false);
  const [evidence, setEvidence] = useState<Incident | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Incident | null>(null);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      if (filter !== "all" && i.status !== filter) return false;
      if (sevFilter !== "all" && i.severity !== sevFilter) return false;
      if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [incidents, filter, sevFilter, search]);

  const counts = {
    all: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    "in-review": incidents.filter((i) => i.status === "in-review").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#FF5C00] mb-1">Incidents</div>
          <h1 className="font-display text-2xl md:text-3xl">Incident Reports</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{counts.open} open · {counts["in-review"]} in review · {counts.resolved} resolved</p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setAdding(true)}>New Incident</Button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <Card padded className="!bg-[#0A0E1A]/80 backdrop-blur border-white/[0.04]">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <SearchBar
                placeholder="Search incidents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                containerClassName="flex-1"
              />
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {(["all", "low", "medium", "high", "emergency"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSevFilter(s)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] rounded-lg uppercase tracking-widest font-bold transition-all whitespace-nowrap",
                      sevFilter === s 
                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                        : "text-[#94A3B8] hover:text-white border border-white/[0.04] hover:bg-white/5"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <AnimatePresence>
              {filtered.length === 0 && (
                <Card padded className="bg-[#0A0E1A]/40 border-dashed border-white/[0.08]">
                  <EmptyState
                    icon={<AlertTriangle size={24} className="text-[#94A3B8]" />}
                    title="No incidents found"
                    description="Adjust your filters or search terms to find what you're looking for."
                  />
                </Card>
              )}
              {filtered.map((i) => {
                const guard = guards.find((g) => g.id === i.guardId);
                const site = sites.find((s) => s.id === i.siteId);
                const severityColor = i.severity === "emergency" ? "red" : i.severity === "high" ? "orange" : i.severity === "medium" ? "yellow" : "blue";
                
                return (
                  <motion.div
                    key={i.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      padded={false}
                      className="group overflow-hidden transition-all hover:border-white/[0.12] hover:bg-white/[0.01]"
                    >
                      <div className="flex">
                        <div className={cn("w-1.5 shrink-0 transition-opacity group-hover:opacity-100", 
                          i.severity === "emergency" ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" :
                          i.severity === "high" ? "bg-orange-500" :
                          i.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                        )} />
                        
                        <div className="flex-1 p-5">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-3">
                                <SeverityBadge severity={i.severity} />
                                <IncidentStatusBadge status={i.status} />
                                {i.linkedPanic && <Badge color="red" pulse className="font-bold">PANIC LINKED</Badge>}
                              </div>
                              
                              <h3 className="font-display text-lg mb-1.5 group-hover:text-[#FF5C00] transition-colors">{i.title}</h3>
                              <p className="text-sm text-[#94A3B8] leading-relaxed mb-4 line-clamp-2">{i.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-4 border-t border-white/[0.04]">
                                <div className="flex items-center gap-2">
                                  <Avatar name={guard?.name ?? ""} size={24} />
                                  <span className="text-[11px] font-medium text-[#F1F5F9]">{guard?.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[#94A3B8]">
                                  <MapPin size={12} />
                                  <span className="text-[11px] uppercase tracking-wider">{site?.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[#94A3B8]">
                                  <FileText size={12} />
                                  <span className="text-[11px] uppercase tracking-wider">{relativeTime(i.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex md:flex-col items-center justify-center gap-2 border-l border-white/[0.04] pl-6 shrink-0">
                              {i.hasPhoto && (
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="w-full !justify-start !px-3 h-9 text-[10px]" 
                                  icon={<ImageIcon size={14} />}
                                  onClick={() => setEvidence(i)}
                                >
                                  View Evidence
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="w-full !justify-start !px-3 h-9 text-[10px]" 
                                icon={<Eye size={14} />}
                                onClick={() => setEditing(i)}
                              >
                                Edit Details
                              </Button>
                              {(currentUser?.role === "admin" || currentUser?.role === "supervisor") && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="w-full !justify-start !px-3 h-9 text-[10px] text-red-400 hover:bg-red-500/10" 
                                  icon={<Trash2 size={14} />}
                                  onClick={() => setConfirmDelete(i)}
                                >
                                  Archive
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <Card padded className="!bg-[#0A0E1A]/80 backdrop-blur border-white/[0.04]">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#94A3B8] mb-4">Quick Filters</h3>
            <div className="space-y-2">
              {(["all", "open", "in-review", "resolved"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                    filter === s 
                      ? "bg-[#FF5C00] text-white shadow-[0_8px_20px_rgba(255,92,0,0.25)]" 
                      : "bg-[#06080F] text-[#94A3B8] hover:bg-white/5 border border-white/[0.04]"
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-widest">{s}</span>
                  <Badge color="gray" size="sm" className={cn(filter === s ? "bg-white/20" : "")}>
                    {counts[s as keyof typeof counts]}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>

          <Card padded className="!bg-[#FF5C00]/5 border-[#FF5C00]/20">
            <div className="flex items-center gap-3 mb-3 text-[#FF5C00]">
              <AlertTriangle size={18} />
              <h3 className="font-display text-sm">Incident Protocols</h3>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              All high-severity incidents must be reviewed by a supervisor within 15 minutes of filing. Ensure all evidence is uploaded.
            </p>
            <Button variant="primary" className="w-full h-10 text-[10px] uppercase tracking-widest font-bold" onClick={() => setAdding(true)}>
              File New Report
            </Button>
          </Card>
        </div>
      </div>

      {(editing || adding) && (
        <IncidentModal
          incident={
            editing ?? {
              id: nextId(),
              title: "",
              description: "",
              guardId: guards[0]!.id,
              siteId: sites[0]!.id,
              severity: "medium",
              status: "open",
              createdAt: new Date(),
              updatedAt: new Date(),
              hasPhoto: false,
              linkedPanic: false,
            }
          }
          isNew={adding}
          onClose={() => { setEditing(null); setAdding(false); }}
        />
      )}

      {evidence && (
        <Modal open onClose={() => setEvidence(null)} title="Evidence" width="md">
          <div
            className="aspect-video rounded-xl border border-white/10 flex items-end p-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0F1525 0%, #1F2937 50%, #0F1525 100%)" }}
          >
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-mono text-white/60 bg-black/40 backdrop-blur rounded px-2 py-1">
              <ImageIcon size={10} /> Photo evidence
            </div>
            <div className="relative">
              <div className="font-mono text-xs text-white/80">{evidence.photoPlaceholder ?? "evidence"}.jpg</div>
              <div className="font-mono text-xs text-white/60 mt-0.5">
                {evidence.gpsLat?.toFixed(4)}°N, {evidence.gpsLng?.toFixed(4)}°E
              </div>
              <div className="font-mono text-xs text-white/60">
                {evidence.createdAt.toISOString().slice(0, 19).replace("T", " ")}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteIncident(confirmDelete.id);
            toast("Incident archived", "info");
          }
        }}
        title="Delete this incident?"
        description="The incident will be removed from the active list. This cannot be undone."
        confirmText="Delete"
        destructive
      />
    </div>
  );
}

function IncidentModal({ incident: initial, onClose, isNew }: { incident: Incident; onClose: () => void; isNew?: boolean }) {
  const { guards, sites, upsertIncident, toast } = useApp();
  const [inc, setInc] = useState<Incident>(initial);

  function save() {
    upsertIncident({ ...inc, updatedAt: new Date() });
    toast(isNew ? "Incident filed" : "Incident updated");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "File New Incident" : `Incident #${inc.id}`}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>{isNew ? "File incident" : "Save changes"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Title" value={inc.title} onChange={(e) => setInc({ ...inc, title: e.target.value })} disabled={!isNew} className="col-span-2" />
        <Textarea label="Description" value={inc.description} onChange={(e) => setInc({ ...inc, description: e.target.value })} disabled={!isNew} className="col-span-2" />
        <Select label="Reported by" value={inc.guardId} onChange={(e) => setInc({ ...inc, guardId: Number(e.target.value) })} disabled={!isNew} options={guards.map((g) => ({ value: g.id, label: g.name }))} />
        <Select label="Site" value={inc.siteId} onChange={(e) => setInc({ ...inc, siteId: Number(e.target.value) })} disabled={!isNew} options={sites.map((s) => ({ value: s.id, label: s.name }))} />
        <Select
          label="Severity"
          value={inc.severity}
          onChange={(e) => setInc({ ...inc, severity: e.target.value as IncidentSeverity })}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "emergency", label: "Emergency" },
          ]}
        />
        <Select
          label="Status"
          value={inc.status}
          onChange={(e) => setInc({ ...inc, status: e.target.value as IncidentStatus })}
          options={[
            { value: "open", label: "Open" },
            { value: "in-review", label: "In Review" },
            { value: "resolved", label: "Resolved" },
          ]}
        />
        <label className="col-span-2 flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={inc.hasPhoto}
            onChange={(e) => setInc({ ...inc, hasPhoto: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-[#06080F]"
          />
          <span className="text-[#94A3B8]">Photo evidence attached</span>
        </label>
      </div>
    </Modal>
  );
}
