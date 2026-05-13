import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Voicemail as VMIcon, MessageSquare, Mic, MicOff, Volume2, X, Trash2, ArrowDownLeft, ArrowRightLeft, ChevronRight, Search, Delete } from "lucide-react";
import { useApp, useNow } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { durationLabel, formatTime, relativeTime, cn } from "@/lib/utils";
import type { CallLog, Voicemail } from "@/types";

/* ─── Glassmorphism style tokens ────────────────────────── */
const glass = "bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]";
const glassLight = "bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]";
const glassHover = "hover:bg-white/[0.07] hover:border-white/[0.12]";

export function CallsView() {
  const { 
    guards, calls, voicemails, addCall, updateCall, updateVoicemail, deleteCall, deleteVoicemail, nextId, toast,
    activeCall, setGlobalCallState, setGlobalCallMuted, setGlobalCallMinimized, endGlobalCall, startGlobalCall
  } = useApp();
  
  const [tab, setTab] = useState<"log" | "vm" | "sms">("log");
  const [dialedNumber, setDialedNumber] = useState("");
  const [vmOpen, setVmOpen] = useState<Voicemail | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const now = useNow(1000);

  useEffect(() => {
    if (activeCall && activeCall.state === "ringing") {
      const t = setTimeout(() => setGlobalCallState("connected"), 2000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [activeCall?.state, setGlobalCallState]);

  function dial() {
    if (!dialedNumber) return;
    const g = guards.find(x => String(x.extension) === dialedNumber);
    startGlobalCall(g?.id, dialedNumber);
    setDialedNumber("");
  }

  const filteredGuards = guards.filter(g =>
    g.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    String(g.extension).includes(contactSearch)
  );

  const numpadKeys: (number | string)[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"];
  const subLabels: Record<number, string> = {
    2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz"
  };

  return (
    <div className="min-h-full relative overflow-hidden">
      {/* Ambient gradient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#0d9488]/[0.06] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#3B82F6]/[0.04] blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-[#FF5C00]/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-emerald-400/80 mb-1 font-medium">Calls</div>
          <h1 className="font-display text-2xl md:text-3xl text-white/95">VoIP Dispatch</h1>
          <p className="text-sm text-white/40 mt-1">Direct extension dialing, voicemail, and SMS log</p>
        </div>

        {/* Main layout: Contacts | Dialer | Call Log */}
        <div className="grid lg:grid-cols-[280px_320px_1fr] gap-5 items-start">
          
          {/* ─── Column 1: Contacts ─────────────────────── */}
          <div className={cn("rounded-2xl p-4 lg:sticky lg:top-6", glass)}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Search size={13} className="text-emerald-400" />
              </div>
              <input
                type="text"
                placeholder="Search contacts..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/25 outline-none"
              />
            </div>

            <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredGuards.map((g, i) => (
                <motion.button
                  key={g.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => startGlobalCall(g.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                    glassLight, glassHover
                  )}
                >
                  <Avatar name={g.name} size={38} ring />
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[13px] font-semibold text-white/90 truncate group-hover:text-emerald-300 transition-colors">
                      {g.name}
                    </div>
                    <div className="text-[11px] text-white/35 font-mono">
                      EXT {g.extension}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <ChevronRight size={13} className="text-emerald-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ─── Column 2: Dialer ───────────────────────── */}
          <div className={cn("rounded-2xl p-5", glass)}>
            {/* Display */}
            <div className="flex items-center justify-between mb-2">
              <Badge color="green" size="sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </Badge>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 mb-5 text-right">
              <div className="font-mono text-3xl md:text-4xl tracking-[0.12em] text-white/90 min-h-[48px] flex items-center justify-end">
                {dialedNumber ? (
                  <span>{dialedNumber.replace(/(.{4})/g, "$1 ").trim()}</span>
                ) : (
                  <span className="text-white/15 text-2xl tracking-[0.2em]">Enter number</span>
                )}
              </div>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {numpadKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setDialedNumber(e => (e + String(key)).slice(0, 15))}
                  className={cn(
                    "group relative rounded-2xl py-4 transition-all duration-150 active:scale-[0.96]",
                    "bg-white/[0.03] border border-white/[0.05]",
                    "hover:bg-white/[0.08] hover:border-white/[0.1]",
                    "hover:shadow-[0_4px_20px_rgba(255,255,255,0.03)]"
                  )}
                >
                  <div className="flex flex-col items-center gap-0">
                    <span className="text-2xl font-light text-white/85 group-hover:text-white transition-colors">
                      {key}
                    </span>
                    {typeof key === "number" && subLabels[key] && (
                      <span className="text-[9px] text-white/25 tracking-widest uppercase mt-[-2px]">
                        {subLabels[key]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDialedNumber(s => s.slice(0, -1))}
                className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/60 transition-all"
              >
                <Delete size={18} />
              </button>
              <button
                onClick={dial}
                disabled={!dialedNumber}
                className={cn(
                  "flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200",
                  dialedNumber
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_8px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.35)] active:scale-[0.98]"
                    : "bg-white/[0.04] text-white/20 cursor-not-allowed"
                )}
              >
                <Phone size={18} />
                <span>Call</span>
              </button>
              <button
                onClick={() => setDialedNumber("")}
                className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ─── Column 3: Call Log / Voicemails / SMS ─── */}
          <div className={cn("rounded-2xl overflow-hidden", glass)}>
            {/* Tabs */}
            <div className="flex border-b border-white/[0.06]">
              {(["log", "vm", "sms"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "relative px-5 py-3.5 text-sm font-medium transition-colors",
                    tab === t ? "text-white" : "text-white/35 hover:text-white/60"
                  )}
                >
                  {t === "log" ? "Call Log" : t === "vm" ? `Voicemails (${voicemails.filter((v) => !v.played).length})` : "SMS Log"}
                  {tab === t && (
                    <motion.div
                      layoutId="calls-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-400 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="max-h-[580px] overflow-y-auto custom-scrollbar">
              {/* Call Log */}
              {tab === "log" && (
                <div className="divide-y divide-white/[0.04]">
                  {calls.map((c, i) => {
                    const g = guards.find((x) => x.id === c.guardId);
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                      >
                        {g && <Avatar name={g.name} size={36} />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white/90">{g?.name}</span>
                            <span className="text-[10px] font-mono text-white/25">EXT {c.extension}</span>
                          </div>
                          <div className="text-xs text-white/30 mt-0.5">
                            {relativeTime(c.startedAt)}
                            {c.notes && <span className="ml-2 text-white/20">· {c.notes}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-xs text-white/40">
                            {c.duration ? durationLabel(c.duration) : "—"}
                          </span>
                          <Badge 
                            color={c.outcome === "answered" ? "green" : c.outcome === "missed" ? "red" : "yellow"}
                            size="sm"
                          >
                            {c.outcome}
                          </Badge>
                          <button 
                            onClick={() => deleteCall(c.id)} 
                            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {calls.length === 0 && (
                    <div className="px-5 py-16 text-center text-white/25 text-sm">No calls recorded</div>
                  )}
                </div>
              )}

              {/* Voicemails */}
              {tab === "vm" && (
                <div className="p-3 space-y-2">
                  {voicemails.length === 0 && (
                    <div className="px-4 py-16 text-center text-white/25 text-sm">No voicemails</div>
                  )}
                  {voicemails.map((v) => {
                    const g = guards.find((x) => x.id === v.fromGuardId);
                    return (
                      <button
                        key={v.id}
                        onClick={() => { setVmOpen(v); updateVoicemail({ ...v, played: true }); }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                          v.played 
                            ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]" 
                            : "bg-emerald-500/[0.05] border-emerald-500/20 hover:bg-emerald-500/[0.08]"
                        )}
                      >
                        {g && <Avatar name={g.name} size={36} />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-white/90">{g?.name}</span>
                            {!v.played && <Badge color="green" size="sm">New</Badge>}
                          </div>
                          <div className="text-xs text-white/30 truncate">{v.transcription}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <VoiceWaveform />
                          <span className="font-mono text-xs text-white/35">{durationLabel(v.duration)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SMS */}
              {tab === "sms" && (
                <div className="p-3 space-y-2">
                  {[
                    { from: "Marcus J.", text: "Got it, on it.", time: "4 min ago" },
                    { from: "Aisha F.", text: "South gate logged.", time: "30 min ago" },
                    { from: "Diana O.", text: "ETA 15 min", time: "22 min ago" },
                    { from: "Khalid R.", text: "Battery replaced.", time: "1h ago" },
                    { from: "Layla M.", text: "Confirmed for tonight.", time: "5h ago" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                      <MessageSquare size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-white/85"><strong className="text-white/95">{s.from}</strong> — {s.text}</div>
                        <div className="text-[10px] uppercase tracking-wider text-white/25 mt-1 font-mono">{s.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Active call modal ─────────────────────────── */}
      <AnimatePresence>
        {activeCall && !activeCall.minimized && (
          <CallModal
            call={activeCall.data}
            state={activeCall.state}
            muted={activeCall.muted}
            onMute={() => setGlobalCallMuted(!activeCall.muted)}
            onEnd={endGlobalCall}
            onMinimize={() => setGlobalCallMinimized(true)}
            onTransfer={() => setTransferOpen(true)}
            now={now}
          />
        )}
      </AnimatePresence>

      {/* Transfer modal */}
      {transferOpen && (
        <Modal open onClose={() => setTransferOpen(false)} title="Transfer Call" width="sm">
          <div className="space-y-4">
            <div className="text-xs text-white/40">Select a guard to transfer this call to:</div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {guards.filter(g => g.id !== activeCall?.data.guardId).map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    toast(`Transferring to ${g.name}...`);
                    setTransferOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                    glassLight, glassHover
                  )}
                >
                  <Avatar name={g.name} size={32} />
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium text-white/90">{g.name}</div>
                    <div className="text-[10px] text-white/35">EXT {g.extension}</div>
                  </div>
                </button>
              ))}
            </div>
            <Input label="Or enter external number" placeholder="+1..." />
            <Button fullWidth variant="primary" onClick={() => { toast("Transferring to external number..."); setTransferOpen(false); }}>Transfer</Button>
          </div>
        </Modal>
      )}

      {/* Voicemail playback */}
      {vmOpen && (
        <Modal
          open
          onClose={() => setVmOpen(null)}
          title={`Voicemail — ${guards.find((g) => g.id === vmOpen.fromGuardId)?.name}`}
          width="md"
          footer={
            <>
              <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => { deleteVoicemail(vmOpen.id); setVmOpen(null); toast("Voicemail deleted", "info"); }}>Delete</Button>
              <Button variant="ghost" onClick={() => setVmOpen(null)}>Close</Button>
              <Button variant="primary" icon={<Phone size={14} />} onClick={() => { setVmOpen(null); startGlobalCall(vmOpen.fromGuardId); }}>Call back</Button>
            </>
          }
        >
          <div className={cn("flex items-center gap-3 mb-4 p-3 rounded-xl", glassLight)}>
            <VoiceWaveform big />
            <span className="font-mono text-sm text-white/70">{durationLabel(vmOpen.duration)}</span>
            <Button size="sm" variant="primary" icon={<Volume2 size={12} />}>Play</Button>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Auto-transcription</div>
          <p className={cn("text-sm text-white/80 leading-relaxed rounded-xl p-3", glassLight)}>
            "{vmOpen.transcription}"
          </p>
          <div className="text-[10px] text-white/25 mt-3 font-mono">
            Received {relativeTime(vmOpen.receivedAt)}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Active Call Modal ────────────────────────────────── */
function CallModal({ call, state, muted, onMute, onEnd, onMinimize, onTransfer, now }: { 
  call: CallLog; 
  state: "ringing" | "connected"; 
  muted: boolean; 
  onMute: () => void; 
  onEnd: () => void; 
  onMinimize: () => void;
  onTransfer: () => void;
  now: Date 
}) {
  const { guards } = useApp();
  const g = guards.find((x) => x.id === call.guardId);
  const dur = Math.floor((now.getTime() - call.startedAt.getTime()) / 1000);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1500] bg-black/70 backdrop-blur-xl flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={cn(
          "rounded-3xl p-8 w-full max-w-sm text-center relative",
          "bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        )}
      >
        <button 
          onClick={onMinimize}
          className="absolute top-4 left-4 p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition"
          title="Minimize"
        >
          <ArrowDownLeft size={16} />
        </button>
        
        <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 mb-3 font-medium">
          {state === "ringing" ? "Calling..." : "Connected"}
        </div>
        <div className="relative inline-block mb-4">
          <Avatar name={g?.name || "External"} size={96} ring />
          {state === "ringing" && (
            <span className="absolute inset-0 rounded-full" style={{ animation: "pulse-active 1.6s cubic-bezier(0.66, 0, 0, 1) infinite", boxShadow: "0 0 0 0 rgba(16,185,129,0.5)" }} />
          )}
        </div>
        <div className="font-display text-xl text-white/95">{g?.name || call.notes}</div>
        <div className="text-sm text-white/40">
          {g ? `Ext ${g.extension} · ${g.site}` : "External Number"}
        </div>
        <div className="font-mono text-3xl text-emerald-400 mt-4">
          {state === "connected" ? durationLabel(dur) : "00:00:00"}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button onClick={onMute} className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all", muted ? "bg-white/15 text-white" : "bg-white/[0.06] hover:bg-white/10 text-white/60")}>
            {muted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button onClick={onTransfer} className="w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center text-white/60 transition-all">
            <ArrowRightLeft size={18} />
          </button>
          <button onClick={onEnd} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all shadow-[0_8px_30px_rgba(239,68,68,0.3)]">
            <PhoneOff size={20} className="text-white" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center text-white/60">
            <Volume2 size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Voice Waveform ───────────────────────────────────── */
function VoiceWaveform({ big }: { big?: boolean }) {
  return (
    <div className={cn("flex items-end gap-0.5", big ? "h-8" : "h-5")}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="voice-bar bg-emerald-400 rounded-full"
          style={{
            width: big ? 4 : 3,
            height: "100%",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
