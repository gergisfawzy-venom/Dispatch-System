import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Send, Search, MessageSquare, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatTime, relativeTime, cn } from "@/lib/utils";
import type { Message } from "@/types";

const QUICK = [
  "Status check — please confirm location.",
  "All clear, continue patrol.",
  "Hold position and standby.",
  "Photo update required.",
];

export function ChatView() {
  const { guards, messages, addMessage, markMessagesRead, nextId, toast } = useApp();
  const [activeId, setActiveId] = useState<number>(guards[0]!.id);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const guard = guards.find((g) => g.id === activeId);
  const thread = useMemo(
    () => messages
      .filter((m) => (m.fromId === activeId && m.toId === "dispatcher") || (m.fromId === "dispatcher" && m.toId === activeId))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    [messages, activeId]
  );

  useEffect(() => {
    markMessagesRead(activeId);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [activeId, markMessagesRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length]);

  // Simulated incoming messages every 30s
  useEffect(() => {
    const id = setInterval(() => {
      const candidates = guards.filter((g) => g.status === "active" || g.status === "on-patrol");
      if (candidates.length === 0) return;
      const sender = candidates[Math.floor(Math.random() * candidates.length)]!;
      const lines = [
        "Patrol complete, all clear.",
        "Visiting checkpoint now.",
        "No incidents to report this round.",
        "Foot traffic light, continuing rounds.",
        "Will radio when next checkpoint reached.",
      ];
      addMessage({
        id: nextId(),
        fromId: sender.id,
        toId: "dispatcher",
        text: lines[Math.floor(Math.random() * lines.length)]!,
        timestamp: new Date(),
        read: sender.id === activeId,
        type: "text",
      });
    }, 35000);
    return () => clearInterval(id);
  }, [guards, addMessage, nextId, activeId]);

  function send(text: string) {
    if (!text.trim()) return;
    addMessage({
      id: nextId(),
      fromId: "dispatcher",
      toId: activeId,
      text: text.trim(),
      timestamp: new Date(),
      read: true,
      type: "text",
    });
    setDraft("");
  }

  function unreadCount(guardId: number) {
    return messages.filter((m) => m.fromId === guardId && !m.read).length;
  }

  function lastMessage(guardId: number) {
    const m = messages
      .filter((x) => x.fromId === guardId || x.toId === guardId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    return m;
  }

  const filteredGuards = guards.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#FF5C00] mb-1">Chat</div>
          <h1 className="font-display text-2xl md:text-3xl">Field Communications</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Direct messaging with guards in the field</p>
        </div>
        <Button variant="primary" icon={<Megaphone size={14} />} onClick={() => setBroadcastOpen(true)}>Broadcast</Button>
      </div>

      <Card padded={false} className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[calc(100vh-260px)] min-h-[500px] overflow-hidden">
        {/* Sidebar */}
        <div className="border-r border-white/[0.06] flex flex-col">
          <div className="p-3 border-b border-white/[0.06]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guards..."
                className="w-full bg-[#06080F] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#FF5C00]/60"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredGuards.map((g) => {
              const unread = unreadCount(g.id);
              const last = lastMessage(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => setActiveId(g.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.03] transition border-b border-white/[0.04]",
                    activeId === g.id && "bg-[#FF5C00]/[0.06] border-l-2 border-l-[#FF5C00]"
                  )}
                >
                  <div className="relative">
                    <Avatar name={g.name} size={36} />
                    {(g.status === "active" || g.status === "on-patrol") && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0A0E1A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{g.name}</span>
                      {last && <span className="text-[10px] text-[#94A3B8] font-mono shrink-0 ml-1">{relativeTime(last.timestamp)}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-[#94A3B8] truncate flex-1">
                        {last?.text ?? "No messages yet"}
                      </span>
                      {unread > 0 && (
                        <Badge color="orange" size="sm" className="ml-1">{unread}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
        {guard ? (
          <div className="flex flex-col">
            <div className="p-3 border-b border-white/[0.06] flex items-center gap-3">
              <Avatar name={guard.name} size={36} />
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm">{guard.name}</div>
                <div className="text-xs text-[#94A3B8]">Ext {guard.extension} · {guard.site}</div>
              </div>
              <Badge color={guard.status === "active" || guard.status === "on-patrol" ? "green" : "gray"} pulse={guard.status === "active"}>
                {guard.status}
              </Badge>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {thread.length === 0 ? (
                <EmptyState icon={<MessageSquare size={20} />} title="No messages yet" description="Send the first message below." />
              ) : (
                <AnimatePresence>
                  {thread.map((m) => (
                    <ChatBubble key={m.id} m={m} guardName={guard.name} />
                  ))}
                </AnimatePresence>
              )}
            </div>
            <div className="border-t border-white/[0.06] p-3 space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#06080F] border border-white/10 hover:border-[#FF5C00]/40 hover:text-white text-[#94A3B8] transition"
                  >
                    <Zap size={10} className="inline mr-1 -mt-0.5 text-[#FF5C00]" />
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(draft)}
                  placeholder={`Message ${guard.name}...`}
                  className="flex-1 bg-[#06080F] border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF5C00]/60"
                />
                <Button variant="primary" icon={<Send size={14} />} onClick={() => send(draft)}>Send</Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={<MessageSquare size={20} />} title="Select a guard" />
        )}
      </Card>

      {broadcastOpen && (
        <BroadcastModal onClose={() => setBroadcastOpen(false)} />
      )}
    </div>
  );
}

function ChatBubble({ m, guardName }: { m: Message; guardName: string }) {
  const fromGuard = m.fromId !== "dispatcher";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-2", fromGuard ? "justify-start" : "justify-end")}
    >
      {fromGuard && <Avatar name={guardName} size={28} className="shrink-0 mt-1" />}
      <div className={cn(
        "max-w-[70%] rounded-2xl px-3.5 py-2.5",
        fromGuard ? "bg-[#0F1525] border border-white/[0.06] rounded-tl-sm" : "bg-[#FF5C00] text-white rounded-tr-sm"
      )}>
        <p className="text-sm leading-snug">{m.text}</p>
        <p className={cn("text-[10px] mt-1 font-mono", fromGuard ? "text-[#94A3B8]" : "text-white/70")}>
          {formatTime(m.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}

function BroadcastModal({ onClose }: { onClose: () => void }) {
  const { guards, addMessage, nextId, toast } = useApp();
  const [text, setText] = useState("Heads up — please respond with current location and status.");
  const activeGuards = guards.filter((g) => g.status === "active" || g.status === "on-patrol");

  function send() {
    if (!text.trim()) return;
    activeGuards.forEach((g) => {
      addMessage({
        id: nextId(),
        fromId: "dispatcher",
        toId: g.id,
        text: text.trim(),
        timestamp: new Date(),
        read: true,
        type: "broadcast",
      });
    });
    toast(`Broadcast sent to ${activeGuards.length} guards`);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Broadcast to active team"
      width="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={<Megaphone size={14} />} onClick={send}>Send to {activeGuards.length}</Button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {activeGuards.map((g) => (
          <div key={g.id} className="flex items-center gap-1.5 px-2 py-1 bg-[#06080F] border border-white/10 rounded-full text-xs">
            <Avatar name={g.name} size={18} />
            {g.name}
          </div>
        ))}
      </div>
      <Textarea
        label="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />
    </Modal>
  );
}
