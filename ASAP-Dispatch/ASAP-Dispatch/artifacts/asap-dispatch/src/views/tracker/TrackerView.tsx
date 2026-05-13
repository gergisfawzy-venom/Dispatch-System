import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  MapPin,
  Phone,
  Activity,
  Heart,
  Users,
  Layers,
  X,
  Crosshair,
  Shield,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { GuardStatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { avatarColorFor, getInitials, relativeTime, cn } from "@/lib/utils";
import type { Guard } from "@/types";

const DARK_TILE =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function makeGuardIcon(g: Guard) {
  const color = avatarColorFor(g.name);
  const isPanic = g.panicActive;
  const initials = getInitials(g.name);
  const pulse = isPanic
    ? `<span style="position:absolute;inset:-6px;border-radius:50%;background:${color};opacity:0.5;animation:pulse-ring 1.6s ease-out infinite;"></span>`
    : g.status === "active" || g.status === "on-patrol"
      ? `<span style="position:absolute;inset:-3px;border-radius:50%;border:2px solid ${color};opacity:0.5;animation:pulse-active 2s ease-out infinite;"></span>`
      : "";
  return L.divIcon({
    className: "guard-marker",
    html: `<div style="position:relative;width:36px;height:36px;">
      ${pulse}
      <div style="position:relative;width:36px;height:36px;border-radius:50%;background:${isPanic ? "#EF4444" : color};color:#fff;display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-weight:700;font-size:13px;border:2px solid #06080F;box-shadow:0 4px 12px rgba(0,0,0,0.5);">${initials}</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function makeCheckpointIcon(status: string) {
  const colorMap: Record<string, string> = {
    completed: "#22C55E",
    pending: "#F59E0B",
    overdue: "#FF5C00",
    missed: "#EF4444",
  };
  const color = colorMap[status] ?? "#94A3B8";
  return L.divIcon({
    className: "checkpoint-marker",
    html: `<div style="width:14px;height:14px;border-radius:3px;background:${color};border:2px solid #06080F;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function ZoomHandler({ focusGuard }: { focusGuard: Guard | null | undefined }) {
  const map = useMap();
  const lastId = useRef<number | null>(null);

  useEffect(() => {
    if (focusGuard && focusGuard.id !== lastId.current) {
      map.flyTo([focusGuard.lat, focusGuard.lng], 17, { duration: 1.2 });
      lastId.current = focusGuard.id;
    } else if (!focusGuard && lastId.current !== null) {
      map.flyTo([30.055, 31.235], 13, { duration: 1.2 });
      lastId.current = null;
    }
  }, [focusGuard, map]);

  useEffect(() => {
    if (focusGuard) {
      map.panTo([focusGuard.lat, focusGuard.lng]);
    }
  }, [focusGuard?.lat, focusGuard?.lng, map]);

  return null;
}

export function TrackerView() {
  const { guards, sites, panicActive, panicGuardId, triggerPanic, resolvePanic, toast, addCall, nextId, setView } = useApp();
  const [selectedGuard, setSelectedGuard] = useState<number | null>(null);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [welfareGuard, setWelfareGuard] = useState<Guard | null>(null);
  const [breachToast, setBreachToast] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const center: [number, number] = [30.055, 31.235];
  const focusGuard = panicActive
    ? guards.find((g) => g.id === panicGuardId)
    : selectedGuard
      ? guards.find((g) => g.id === selectedGuard)
      : null;

  // Initial zoom on selection
  useEffect(() => {
    if (focusGuard && mapRef.current) {
      mapRef.current.flyTo([focusGuard.lat, focusGuard.lng], 17, { duration: 0.8 });
    }
  }, [focusGuard?.id]);

  // Follow movement without changing zoom
  useEffect(() => {
    if (focusGuard && mapRef.current) {
      mapRef.current.panTo([focusGuard.lat, focusGuard.lng]);
    }
  }, [focusGuard?.lat, focusGuard?.lng]);

  function callAllActive() {
    const active = guards.filter((g) => g.status === "active" || g.status === "on-patrol");
    active.forEach((g) => {
      addCall({
        id: nextId(),
        guardId: g.id,
        extension: g.extension,
        startedAt: new Date(),
        endedAt: new Date(Date.now() + 30000),
        duration: 30,
        outcome: "answered",
        notes: "Group broadcast — confirmed status",
        isActive: false,
      });
    });
    toast(`Broadcast sent to ${active.length} active guards`, "success");
  }

  function simulateGeofenceBreach() {
    setBreachToast(true);
    toast("Geofence breach: Diana Okafor exited Skyline perimeter", "warn");
    setTimeout(() => setBreachToast(false), 3500);
  }

  function simulatePanic() {
    const g = guards.find((x) => x.id === 5)!;
    triggerPanic(g.id);
    setSelectedGuard(g.id);
  }

  return (
    <div className="relative h-[calc(100vh-128px)]">
      <MapContainer
        center={center}
        zoom={14}
        className="absolute inset-0"
        ref={(m) => { if (m) mapRef.current = m; }}
        zoomControl={false}
      >
        <TileLayer url={DARK_TILE} attribution={ATTRIBUTION} />
        <ZoomHandler focusGuard={focusGuard} />

        {showGeofences && sites.map((s) => (
          <Circle
            key={`fence-${s.id}`}
            center={[s.lat, s.lng]}
            radius={s.geofenceRadius}
            pathOptions={{
              color: s.status === "alert" ? "#EF4444" : "#FF5C00",
              fillColor: s.status === "alert" ? "#EF4444" : "#FF5C00",
              fillOpacity: 0.06,
              weight: 1.5,
              dashArray: "6 6",
            }}
          />
        ))}

        {showCheckpoints && sites.flatMap((s) => s.checkpoints.map((c) => (
          <Marker key={`cp-${c.id}`} position={[c.lat, c.lng]} icon={makeCheckpointIcon(c.status)}>
            <Popup>
              <div className="text-sm">
                <div className="font-bold">{c.name}</div>
                <div className="text-xs opacity-70 mt-1">{s.name}</div>
                <div className="text-xs mt-1.5">Status: <strong>{c.status}</strong></div>
                {c.lastScanned && <div className="text-xs">Last: {relativeTime(c.lastScanned)}</div>}
              </div>
            </Popup>
          </Marker>
        )))}

        {showTrails && guards.filter((g) => g.history.length > 1).map((g) => (
          <Polyline
            key={`trail-${g.id}`}
            positions={g.history}
            pathOptions={{ color: avatarColorFor(g.name), weight: 2, opacity: 0.5, dashArray: "4 4" }}
          />
        ))}

        {guards.map((g) => (
          <Marker
            key={g.id}
            position={[g.lat, g.lng]}
            icon={makeGuardIcon(g)}
            eventHandlers={{ click: () => setSelectedGuard(g.id) }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <div className="font-bold">{g.name}</div>
                <div className="text-xs opacity-80">{g.site}</div>
                <div className="text-xs mt-1">Status: <strong>{g.status}</strong></div>
                <div className="text-xs">Ext: {g.extension}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapEvents onMapClick={() => setSelectedGuard(null)} />
      </MapContainer>

      {/* Top control bar */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center gap-2 z-[400] pointer-events-none">
        <Card padded className="!p-2 pointer-events-auto flex items-center gap-1.5">
          <button onClick={() => setShowGeofences((v) => !v)} className={cn("p-2 rounded-lg transition", showGeofences ? "bg-[#FF5C00]/15 text-[#FFA66B]" : "text-[#94A3B8] hover:bg-white/5")} title="Geofences">
            <MapPin size={14} />
          </button>
          <button onClick={() => setShowCheckpoints((v) => !v)} className={cn("p-2 rounded-lg transition", showCheckpoints ? "bg-[#FF5C00]/15 text-[#FFA66B]" : "text-[#94A3B8] hover:bg-white/5")} title="Checkpoints">
            <Crosshair size={14} />
          </button>
          <button onClick={() => setShowTrails((v) => !v)} className={cn("p-2 rounded-lg transition", showTrails ? "bg-[#FF5C00]/15 text-[#FFA66B]" : "text-[#94A3B8] hover:bg-white/5")} title="Trails">
            <Layers size={14} />
          </button>
        </Card>
        <div className="pointer-events-auto flex gap-2 ml-auto">
          <Button variant="secondary" size="sm" icon={<Phone size={12} />} onClick={callAllActive}>Call all active</Button>
          <Button variant="secondary" size="sm" icon={<MapPin size={12} />} onClick={simulateGeofenceBreach}>Simulate breach</Button>
          {!panicActive && (
            <Button variant="danger" size="sm" icon={<AlertOctagon size={12} />} onClick={simulatePanic}>Simulate panic</Button>
          )}
        </div>
      </div>

      {/* Side panel */}
      <Card className="absolute top-16 left-3 w-[300px] max-h-[calc(100%-90px)] overflow-y-auto z-[400] !bg-[#0A0E1A]/95 backdrop-blur" padded={false}>
        <div className="px-4 pt-4 pb-2 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#FF5C00]" />
            <h3 className="font-display text-sm">Field Team</h3>
          </div>
          <Badge color="green" pulse>{guards.filter((g) => g.status === "active" || g.status === "on-patrol").length}</Badge>
        </div>
        <div className="p-2">
          {guards.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGuard(g.id)}
              className={cn(
                "w-full flex items-center gap-2.5 p-2 rounded-lg transition text-left",
                selectedGuard === g.id ? "bg-[#FF5C00]/10 border border-[#FF5C00]/30" : "hover:bg-white/[0.03]"
              )}
            >
              <Avatar name={g.name} size={32} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{g.name}</div>
                <div className="text-[10px] text-[#94A3B8] truncate">{g.site}</div>
              </div>
              <GuardStatusBadge status={g.status} />
            </button>
          ))}
        </div>
      </Card>

      {/* Right detail panel */}
      {focusGuard && !panicActive && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-16 right-3 w-[320px] z-[400]"
        >
          <Card padded className="!bg-[#0A0E1A]/95 backdrop-blur">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar name={focusGuard.name} size={44} ring />
                <div>
                  <div className="font-display text-base">{focusGuard.name}</div>
                  <div className="text-xs text-[#94A3B8]">Ext {focusGuard.extension}</div>
                </div>
              </div>
              <button onClick={() => setSelectedGuard(null)} className="text-[#94A3B8] hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              <Row k="Status"><GuardStatusBadge status={focusGuard.status} /></Row>
              <Row k="Site"><span className="text-[#F1F5F9]">{focusGuard.site}</span></Row>
              <Row k="Geofence"><Badge color={focusGuard.geofenceOk ? "green" : "red"} size="sm">{focusGuard.geofenceOk ? "Inside" : "Outside"}</Badge></Row>
              <Row k="Last activity"><span className="text-[#F1F5F9] font-mono">{relativeTime(focusGuard.lastActivity)}</span></Row>
              <Row k="GPS"><span className="font-mono text-[#94A3B8]">{focusGuard.lat.toFixed(4)}, {focusGuard.lng.toFixed(4)}</span></Row>
              <Row k="Hours / week"><span className="font-mono text-[#F1F5F9]">{focusGuard.weeklyHours.toFixed(1)}h</span></Row>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button size="sm" variant="secondary" icon={<Phone size={12} />} onClick={() => setView("calls")}>Call</Button>
              <Button size="sm" variant="secondary" icon={<Heart size={12} />} onClick={() => setWelfareGuard(focusGuard)}>Welfare</Button>
              {focusGuard.panicActive && (
                <Button size="sm" variant="success" className="col-span-2" onClick={resolvePanic}>Mark resolved</Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Panic full-screen overlay */}
      {panicActive && focusGuard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-[1000] bg-red-950/60 backdrop-blur-sm flex items-end md:items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-[#0A0E1A] border-2 border-red-500 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center pulse-ring">
                <AlertOctagon size={26} className="text-red-400" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold">Panic Alert Active</div>
                <div className="font-display text-2xl">{focusGuard.name}</div>
                <div className="text-sm text-[#94A3B8]">{focusGuard.site} · {relativeTime(focusGuard.lastActivity)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#06080F] rounded-lg p-3 mb-4">
              <div>
                <div className="text-[#94A3B8] uppercase tracking-wider mb-0.5">Coords</div>
                <div className="font-mono">{focusGuard.lat.toFixed(4)}, {focusGuard.lng.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-[#94A3B8] uppercase tracking-wider mb-0.5">Ext</div>
                <div className="font-mono">{focusGuard.extension}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" icon={<Phone size={14} />} onClick={() => { setView("calls"); }}>Call now</Button>
              <Button variant="secondary" icon={<Activity size={14} />} onClick={() => { toast("Dispatching nearest team to location"); }}>Send team</Button>
              <Button variant="success" className="col-span-2" icon={<Shield size={14} />} onClick={resolvePanic}>Resolve panic</Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {welfareGuard && (
        <Modal
          open
          onClose={() => setWelfareGuard(null)}
          title="Welfare Check"
          width="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setWelfareGuard(null)}>Cancel</Button>
              <Button variant="primary" onClick={() => { toast(`Welfare ping sent to ${welfareGuard.name}`); setWelfareGuard(null); }}>Send check</Button>
            </>
          }
        >
          <p className="text-sm text-[#94A3B8]">
            Send a welfare ping to <strong className="text-[#F1F5F9]">{welfareGuard.name}</strong>. They'll receive a push notification and must respond within 5 minutes.
          </p>
        </Modal>
      )}
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
      <span className="text-[10px] uppercase tracking-wider text-[#94A3B8]">{k}</span>
      {children}
    </div>
  );
}

import { useMapEvents } from "react-leaflet";
function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => onMapClick(),
  });
  return null;
}
