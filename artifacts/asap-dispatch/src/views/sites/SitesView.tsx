import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Users, Crosshair, FileText, Trash2, Edit, Building2, Shield, Search, X, Check, Map as MapIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, Tooltip as MapTooltip } from "react-leaflet";
import L from "leaflet";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SiteStatusBadge, CheckpointStatusBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import type { Site } from "@/types";

export function SitesView() {
  const { sites, guards, upsertSite, deleteSite, nextId, toast } = useApp();
  const [editing, setEditing] = useState<Site | null>(null);
  const [adding, setAdding] = useState(false);
  const [postOrders, setPostOrders] = useState<Site | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Site | null>(null);
  const [detail, setDetail] = useState<Site | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSites = useMemo(() => {
    return sites.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [sites, searchQuery]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#FF5C00] mb-1">Sites</div>
          <h1 className="font-display text-2xl md:text-3xl">Site Management</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{sites.length} sites · {sites.reduce((a, s) => a + s.checkpoints.length, 0)} checkpoints</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={14} />
            <input
              placeholder="Search site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#06080F] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#FF5C00]/50 transition w-64"
            />
          </div>
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setAdding(true)}>Add Site</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredSites.map((s) => {
            const guardsHere = guards.filter((g) => s.assignedGuards.includes(g.id));
            const statusColor = s.status === "active" ? "green" : s.status === "alert" ? "red" : s.status === "upcoming" ? "orange" : "gray";
            
            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  padded={false} 
                  className="group overflow-hidden transition-all hover:border-[#FF5C00]/30 hover:bg-white/[0.01]"
                >
                  <div className="h-32 bg-[#0F1525] relative overflow-hidden">
                    <div className="absolute inset-0 bg-dots opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-[#FFA66B]">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="font-display text-base text-white">{s.name}</div>
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                          <MapPin size={10} /> {s.address}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <SiteStatusBadge status={s.status} />
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-[#06080F] border border-white/[0.04]">
                        <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">Guards</div>
                        <div className="text-sm font-mono text-[#F1F5F9]">{guardsHere.length} Active</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#06080F] border border-white/[0.04]">
                        <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">Checkpoints</div>
                        <div className="text-sm font-mono text-[#F1F5F9]">{s.checkpoints.length} Required</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        {guardsHere.slice(0, 3).map(g => (
                          <Avatar key={g.id} name={g.name} size={24} className="ring-2 ring-[#0A0E1A]" />
                        ))}
                        {guardsHere.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold text-[#94A3B8] ring-2 ring-[#0A0E1A]">
                            +{guardsHere.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 w-8 !p-0" icon={<Edit size={14} />} onClick={() => setEditing(s)} />
                        <Button size="sm" variant="ghost" className="h-8 w-8 !p-0 text-red-400" icon={<Trash2 size={14} />} onClick={() => setConfirmDelete(s)} />
                        <Button size="sm" variant="secondary" className="h-8 px-3 text-[10px]" onClick={() => setDetail(s)}>Details</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {detail && (
        <Modal
          open
          onClose={() => setDetail(null)}
          title={detail.name}
          width="xl"
          footer={
            <>
              <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => { setConfirmDelete(detail); setDetail(null); }}>Delete</Button>
              <Button variant="secondary" icon={<FileText size={14} />} onClick={() => setPostOrders(detail)}>Post orders</Button>
              <Button variant="primary" icon={<Edit size={14} />} onClick={() => { setEditing(detail); setDetail(null); }}>Edit site</Button>
            </>
          }
        >
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
              <div className="h-[400px] rounded-2xl overflow-hidden border border-white/[0.08] relative group">
                <MapContainer center={[detail.lat, detail.lng]} zoom={17} className="h-full w-full" zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Circle center={[detail.lat, detail.lng]} radius={detail.geofenceRadius} pathOptions={{ color: "#FF5C00", fillOpacity: 0.1 }} />
                  <Marker position={[detail.lat, detail.lng]} />
                  {detail.checkpoints.map((c) => (
                    <Marker key={c.id} position={[c.lat, c.lng]} />
                  ))}
                </MapContainer>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-white/10 rounded-lg px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-0.5">Location</div>
                  <div className="text-xs font-mono text-white">{detail.lat.toFixed(4)}, {detail.lng.toFixed(4)}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Crosshair size={18} className="text-[#FF5C00]" />
                  <h4 className="font-display text-lg">Checkpoints</h4>
                  <Badge color="orange" size="sm">{detail.checkpoints.length}</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {detail.checkpoints.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-[#06080F] border border-white/[0.06] rounded-xl group hover:border-[#FF5C00]/30 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#94A3B8] group-hover:text-[#FF5C00]">
                        <Crosshair size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{c.requiredIntervalMinutes}m interval</div>
                      </div>
                      <CheckpointStatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card padded className="bg-[#06080F]">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8] mb-4">Site Details</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">Address</div>
                    <div className="text-sm text-[#F1F5F9]">{detail.address}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">Geofence</div>
                    <div className="text-sm text-[#F1F5F9]">{detail.geofenceRadius}m Radius</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1">Current Status</div>
                    <SiteStatusBadge status={detail.status} />
                  </div>
                </div>
              </Card>

              <Card padded className="bg-[#06080F]">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8] mb-4">Active Guards</h3>
                <div className="space-y-3">
                  {guards.filter((g) => detail.assignedGuards.includes(g.id)).map((g) => (
                    <div key={g.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                      <Avatar name={g.name} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{g.name}</div>
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{g.status}</div>
                      </div>
                    </div>
                  ))}
                  {detail.assignedGuards.length === 0 && (
                    <div className="text-center py-6 text-[#94A3B8] text-xs italic">No guards assigned</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Modal>
      )}

      {(editing || adding) && (
        <SiteModal
          site={
            editing ?? {
              id: nextId(),
              name: "",
              address: "",
              lat: 30.05,
              lng: 31.24,
              geofenceRadius: 200,
              status: "upcoming",
              postOrders: "",
              checkpoints: [],
              assignedGuards: [],
            }
          }
          isNew={adding}
          onClose={() => { setEditing(null); setAdding(false); }}
        />
      )}

      {postOrders && (
        <Modal open onClose={() => setPostOrders(null)} title={`Post Orders — ${postOrders.name}`} width="lg">
          <div className="text-sm text-[#F1F5F9] whitespace-pre-line leading-relaxed bg-[#06080F] border border-white/[0.06] rounded-lg p-4 max-h-[60vh] overflow-y-auto">
            {postOrders.postOrders}
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteSite(confirmDelete.id);
            toast(`Site removed — related shifts and incidents archived`, "info");
          }
        }}
        title={`Delete ${confirmDelete?.name}?`}
        description="This will also remove all related shifts and archive related incidents. This cannot be undone."
        confirmText="Delete site"
        destructive
      />
    </div>
  );
}

function SiteModal({ site: initial, onClose, isNew }: { site: Site; onClose: () => void; isNew?: boolean }) {
  const { upsertSite, toast } = useApp();
  const [s, setS] = useState<Site>(initial);

  function save() {
    if (!s.name.trim() || !s.address.trim()) {
      toast("Name and address are required", "error");
      return;
    }
    upsertSite(s);
    toast(isNew ? "Site added" : "Site updated");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "Add Site" : `Edit ${initial.name}`}
      width="full"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>{isNew ? "Add site" : "Save changes"}</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Top Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
          <Input label="Site name" value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
          <Input label="Address" value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Lat" type="number" step="0.0001" value={s.lat} onChange={(e) => setS({ ...s, lat: Number(e.target.value) })} />
            <Input label="Lng" type="number" step="0.0001" value={s.lng} onChange={(e) => setS({ ...s, lng: Number(e.target.value) })} />
          </div>
          <Input label="Geofence (m)" type="number" value={s.geofenceRadius} onChange={(e) => setS({ ...s, geofenceRadius: Number(e.target.value) })} />
          <Select
            label="Status"
            value={s.status}
            onChange={(e) => setS({ ...s, status: e.target.value as Site["status"] })}
            options={[
              { value: "active", label: "Active" },
              { value: "upcoming", label: "Upcoming" },
              { value: "alert", label: "Alert" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>

        {/* Large Rectangular Map */}
        <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl group">
          <MapContainer center={[s.lat, s.lng]} zoom={16} className="h-full w-full" zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <Circle center={[s.lat, s.lng]} radius={s.geofenceRadius} pathOptions={{ color: "#FF5C00", fillOpacity: 0.1 }} />
            <Marker 
              position={[s.lat, s.lng]} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setS({ ...s, lat: position.lat, lng: position.lng });
                },
              }}
            >
              <MapTooltip direction="top" offset={[0, -20]} opacity={1}>
                Site Center: {s.name || "Unnamed Site"}
              </MapTooltip>
            </Marker>
            {s.checkpoints.map((c, idx) => (
              <Marker 
                key={c.id} 
                position={[c.lat, c.lng]} 
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    const newList = [...s.checkpoints];
                    newList[idx] = { ...c, lat: position.lat, lng: position.lng };
                    setS({ ...s, checkpoints: newList });
                  },
                }}
              >
                <MapTooltip direction="top" offset={[0, -20]} opacity={1}>
                  {c.name || `Checkpoint ${idx + 1}`}
                </MapTooltip>
              </Marker>
            ))}
            <MapEvents onMove={(lat, lng) => setS({ ...s, lat, lng })} />
          </MapContainer>
          <div className="absolute top-4 left-4 z-[1000] bg-[#0A0E1A]/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white/90 shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF5C00] pulse" />
              Operational Perimeter Map
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-[#0A0E1A]/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-[10px] text-[#94A3B8] shadow-xl pointer-events-none flex items-center gap-2">
            <MapIcon size={12} className="text-[#FF5C00]" />
            Drag markers to reposition site or checkpoints
          </div>
        </div>

        {/* Checkpoints & Orders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair size={14} className="text-[#FF5C00]" />
                <h4 className="font-display text-sm">Deployment Checkpoints</h4>
              </div>
              <Button size="sm" variant="secondary" icon={<Plus size={12} />} onClick={() => setS({
                ...s,
                checkpoints: [...s.checkpoints, { id: Date.now(), siteId: s.id, name: "New Checkpoint", lat: s.lat, lng: s.lng, status: "pending", requiredIntervalMinutes: 60 }]
              })}>Add Checkpoint</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {s.checkpoints.map((c, idx) => (
                <div key={c.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors relative group/cp">
                  <button 
                    onClick={() => setS({ ...s, checkpoints: s.checkpoints.filter((_, i) => i !== idx) })}
                    className="absolute top-2 right-2 text-[#94A3B8] hover:text-red-400 opacity-0 group-hover/cp:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  <input
                    className="w-full bg-transparent border-b border-white/[0.06] text-xs focus:outline-none focus:border-[#FF5C00] pb-2 mb-3 font-medium text-[#F1F5F9]"
                    value={c.name}
                    onChange={(e) => {
                      const newList = [...s.checkpoints];
                      newList[idx] = { ...c, name: e.target.value };
                      setS({ ...s, checkpoints: newList });
                    }}
                    placeholder="Point name"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-bold text-[#94A3B8] mb-1">Interval</div>
                      <input
                        type="number"
                        className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-2 py-1.5 text-[10px] text-white focus:border-[#FF5C00]/50 outline-none"
                        value={c.requiredIntervalMinutes}
                        onChange={(e) => {
                          const newList = [...s.checkpoints];
                          newList[idx] = { ...c, requiredIntervalMinutes: Number(e.target.value) };
                          setS({ ...s, checkpoints: newList });
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-bold text-[#94A3B8] mb-1">Status</div>
                      <select
                        className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-2 py-1.5 text-[10px] text-white focus:border-[#FF5C00]/50 outline-none"
                        value={c.status}
                        onChange={(e) => {
                          const newList = [...s.checkpoints];
                          newList[idx] = { ...c, status: e.target.value as any };
                          setS({ ...s, checkpoints: newList });
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {s.checkpoints.length === 0 && (
                <div className="col-span-full text-center py-8 text-[#94A3B8] text-xs italic bg-white/[0.01] rounded-xl border border-dashed border-white/10">
                  No checkpoints configured for this site
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-4 border-l border-white/[0.06] pl-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-[#FF5C00]" />
              <h4 className="font-display text-sm">Site Instructions (Post Orders)</h4>
            </div>
            <textarea
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-sm focus:outline-none focus:border-[#FF5C00]/50 transition h-[180px] lg:h-[calc(100%-40px)] custom-scrollbar text-[#94A3B8] leading-relaxed"
              value={s.postOrders}
              onChange={(e) => setS({ ...s, postOrders: e.target.value })}
              placeholder="Detailed operational instructions for guards on duty..."
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MapEvents({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}
