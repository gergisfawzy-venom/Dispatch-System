import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Mic, MicOff, Volume2, ArrowDownLeft, ArrowRightLeft, Maximize2, Phone } from "lucide-react";
import { useApp, useNow } from "@/context/AppContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { durationLabel, cn } from "@/lib/utils";
import { useState } from "react";
import type { CallLog } from "@/types";

export function GlobalCallUI() {
  const { 
    activeCall, guards, setGlobalCallMuted, endGlobalCall, 
    setGlobalCallMinimized, setGlobalCallState, toast 
  } = useApp();
  const [transferOpen, setTransferOpen] = useState(false);
  const now = useNow(1000);

  if (!activeCall) return null;

  const g = guards.find((x) => x.id === activeCall.data.guardId);
  const dur = Math.floor((now.getTime() - activeCall.data.startedAt.getTime()) / 1000);

  return (
    <>
      <AnimatePresence>
        {activeCall.minimized ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-6 right-6 z-[2000] flex items-center gap-3 bg-[#0A0E1A] border border-[#FF5C00]/30 rounded-full pl-2 pr-4 py-2 shadow-2xl shadow-[#FF5C00]/10 backdrop-blur-md"
          >
            <div className="relative">
              <Avatar name={g?.name || "External"} size={36} ring />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0E1A]" />
            </div>
            
            <div className="flex flex-col min-w-[80px]">
              <div className="text-[10px] font-medium text-white truncate max-w-[120px]">
                {g?.name || activeCall.data.notes}
              </div>
              <div className="text-[10px] font-mono text-green-400">
                {activeCall.state === "connected" ? durationLabel(dur) : "Ringing..."}
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 mx-1" />

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setGlobalCallMuted(!activeCall.muted)}
                className={cn("p-2 rounded-full hover:bg-white/5 transition", activeCall.muted ? "text-red-400" : "text-[#94A3B8]")}
              >
                {activeCall.muted ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <button 
                onClick={() => setGlobalCallMinimized(false)}
                className="p-2 rounded-full hover:bg-white/5 text-[#94A3B8] transition"
              >
                <Maximize2 size={14} />
              </button>
              <button 
                onClick={endGlobalCall}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition ml-1 shadow-lg shadow-red-500/20"
              >
                <PhoneOff size={14} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1500] bg-black/80 backdrop-blur flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0A0E1A] border border-white/10 rounded-2xl p-8 w-full max-w-sm text-center relative"
            >
              <button 
                onClick={() => setGlobalCallMinimized(true)}
                className="absolute top-4 left-4 p-2 rounded-lg hover:bg-white/10 text-[#94A3B8] hover:text-white transition"
                title="Minimize"
              >
                <ArrowDownLeft size={16} />
              </button>
              
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#FF5C00] mb-2">
                {activeCall.state === "ringing" ? "Calling..." : "Connected"}
              </div>
              <div className="relative inline-block mb-4">
                <Avatar name={g?.name || "External"} size={96} ring />
                {activeCall.state === "ringing" && (
                  <span className="absolute inset-0 rounded-full pulse-ring" style={{ animationName: "pulse-active" }} />
                )}
              </div>
              <div className="font-display text-xl">{g?.name || activeCall.data.notes}</div>
              <div className="text-sm text-[#94A3B8]">
                {g ? `Ext ${g.extension} · ${g.site}` : "External Number"}
              </div>
              <div className="font-mono text-3xl text-[#22C55E] mt-4">
                {activeCall.state === "connected" ? durationLabel(dur) : "00:00:00"}
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <button 
                  onClick={() => setGlobalCallMuted(!activeCall.muted)} 
                  className={cn("w-12 h-12 rounded-full flex items-center justify-center transition", activeCall.muted ? "bg-white/10" : "bg-white/5 hover:bg-white/10")}
                >
                  {activeCall.muted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button 
                  onClick={() => setTransferOpen(true)} 
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                >
                  <ArrowRightLeft size={18} />
                </button>
                <button 
                  onClick={endGlobalCall} 
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition"
                >
                  <PhoneOff size={20} />
                </button>
                <button className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
                  <Volume2 size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {transferOpen && (
        <Modal open onClose={() => setTransferOpen(false)} title="Transfer Call" width="sm">
          <div className="space-y-4">
            <div className="text-xs text-[#94A3B8]">Select a guard to transfer this call to:</div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {guards.filter(x => x.id !== activeCall.data.guardId).map(x => (
                <button
                  key={x.id}
                  onClick={() => {
                    toast(`Transferring to ${x.name}...`);
                    setTransferOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#06080F] border border-white/[0.06] hover:border-[#FF5C00]/50 transition"
                >
                  <Avatar name={x.name} size={32} />
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium">{x.name}</div>
                    <div className="text-[10px] text-[#94A3B8]">EXT {x.extension}</div>
                  </div>
                </button>
              ))}
            </div>
            <Input label="Or enter external number" placeholder="+1..." />
            <Button fullWidth variant="primary" onClick={() => { toast("Transferring to external number..."); setTransferOpen(false); }}>Transfer</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
