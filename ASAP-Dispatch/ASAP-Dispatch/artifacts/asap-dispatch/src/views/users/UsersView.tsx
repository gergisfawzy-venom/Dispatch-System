import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Mail, Phone, Edit, Trash2, Shield, Check, X, Search, Calendar, MapPin, User as UserIcon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GuardStatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { Guard, UserRole } from "@/types";

const ROLE_PERMISSIONS: Record<UserRole, Record<string, boolean>> = {
  admin: { dashboard: true, scheduler: true, timesheet: true, tracker: true, incidents: true, chat: true, calls: true, sites: true, users: true, reports: true },
  dispatcher: { dashboard: true, scheduler: true, timesheet: true, tracker: true, incidents: true, chat: true, calls: true, sites: true, users: false, reports: true },
  supervisor: { dashboard: true, scheduler: true, timesheet: true, tracker: true, incidents: true, chat: true, calls: true, sites: false, users: false, reports: true },
  guard: { dashboard: false, scheduler: true, timesheet: true, tracker: false, incidents: true, chat: true, calls: false, sites: false, users: false, reports: false },
};

export function UsersView() {
  const { guards, upsertGuard, deleteGuard, sites, nextId, toast } = useApp();
  const [editing, setEditing] = useState<Guard | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Guard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuards = useMemo(() => {
    return guards.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [guards, searchQuery]);
  const [permsOpen, setPermsOpen] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#FF5C00] mb-1">Users</div>
          <h1 className="font-display text-2xl md:text-3xl">Roster & Roles</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{guards.length} guards on the roster</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={14} />
            <input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#06080F] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#FF5C00]/50 transition w-64"
            />
          </div>
          <Button variant="secondary" icon={<Shield size={14} />} onClick={() => setPermsOpen(true)}>Permissions</Button>
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setAdding(true)}>Add User</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredGuards.map((g) => {
            const roleColor = g.role === "admin" ? "red" : g.role === "dispatcher" ? "orange" : g.role === "supervisor" ? "blue" : "gray";
            return (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card padded={false} className="group overflow-hidden transition-all hover:border-white/[0.12] hover:bg-white/[0.01]">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar name={g.name} size={48} ring className="ring-offset-[#0A0E1A]" />
                          <div className={cn("absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0A0E1A]", 
                            g.status === "active" ? "bg-green-500" : "bg-gray-500"
                          )} />
                        </div>
                        <div>
                          <h3 className="font-display text-base text-[#F1F5F9]">{g.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge color={roleColor as any} size="sm" className="uppercase tracking-widest text-[9px] font-bold">
                              {g.role}
                            </Badge>
                            <span className="text-[10px] text-[#94A3B8] font-mono">#{g.id.toString().padStart(4, '0')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(g)} className="p-2 rounded-lg hover:bg-white/5 text-[#94A3B8] hover:text-white transition">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => setConfirmDelete(g)} className="p-2 rounded-lg hover:bg-white/5 text-[#94A3B8] hover:text-red-400 transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                        <div className="w-6 flex justify-center"><Mail size={12} className="text-[#94A3B8]" /></div>
                        <span className="truncate">{(g as any).email || `${g.name.toLowerCase().replace(" ", ".")}@asap.com`}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                        <div className="w-6 flex justify-center"><Phone size={12} className="text-[#94A3B8]" /></div>
                        <span>{g.phone} <span className="text-[10px] text-[#94A3B8] ml-1">(Ext {g.extension})</span></span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                        <div className="w-6 flex justify-center"><MapPin size={12} className="text-[#94A3B8]" /></div>
                        <span className="truncate">{g.site}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <GuardStatusBadge status={g.status} />
                    </div>
                    <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">
                      Joined {new Date((g as any).joinDate || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {(editing || adding) && (
        <UserModal
          guard={
            editing ?? {
              id: nextId(),
              name: "",
              role: "guard",
              phone: "",
              extension: 100 + nextId() % 900,
              site: sites[0]!.name,
              status: "scheduled",
              lat: 30.05,
              lng: 31.24,
              panicActive: false,
              lastActivity: new Date(),
              history: [],
              assignedPath: [],
              weeklyHours: 0,
              geofenceOk: true,
            }
          }
          isNew={adding}
          onClose={() => { setEditing(null); setAdding(false); }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            deleteGuard(confirmDelete.id);
            toast("User removed — assigned shifts unassigned", "info");
          }
        }}
        title={`Delete ${confirmDelete?.name}?`}
        description="This user will be removed from the roster and any future shifts will be left unassigned for re-staffing."
        confirmText="Delete user"
        destructive
      />

      {permsOpen && (
        <Modal open onClose={() => setPermsOpen(false)} title="Role Permissions Matrix" width="xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-[#94A3B8] font-medium">Capability</th>
                  {(["admin", "dispatcher", "supervisor", "guard"] as const).map((r) => (
                    <th key={r} className="px-3 py-2 text-xs uppercase tracking-wider text-[#94A3B8] font-medium text-center">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(ROLE_PERMISSIONS.admin).map((cap) => (
                  <tr key={cap} className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 capitalize text-[#F1F5F9]">{cap}</td>
                    {(["admin", "dispatcher", "supervisor", "guard"] as const).map((r) => (
                      <td key={r} className="px-3 py-2 text-center">
                        {ROLE_PERMISSIONS[r][cap] ? (
                          <Check size={14} className="text-green-400 inline" />
                        ) : (
                          <X size={14} className="text-[#94A3B8] inline" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}

function UserModal({ guard: initial, onClose, isNew }: { guard: Guard; onClose: () => void; isNew?: boolean }) {
  const { sites, upsertGuard, toast } = useApp();
  const [g, setG] = useState<Guard>(initial);

  function save() {
    if (!g.name.trim()) {
      toast("Name is required", "error");
      return;
    }
    upsertGuard(g);
    toast(isNew ? "User added" : "User updated");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "Add User" : `Edit ${initial.name}`}
      width="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>{isNew ? "Add user" : "Save changes"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full name" value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} className="col-span-2" />
        <Select label="Role" value={g.role} onChange={(e) => setG({ ...g, role: e.target.value as UserRole })}
          options={[
            { value: "admin", label: "Admin" },
            { value: "dispatcher", label: "Dispatcher" },
            { value: "supervisor", label: "Supervisor" },
            { value: "guard", label: "Guard" },
          ]}
        />
        <Select label="Primary Site" value={g.site} onChange={(e) => setG({ ...g, site: e.target.value })}
          options={sites.map((s) => ({ value: s.name, label: s.name }))}
        />
        <Input label="Phone Number" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} />
        <Input label="Internal Extension" type="number" value={g.extension} onChange={(e) => setG({ ...g, extension: Number(e.target.value) })} />
        <Input
          label="Email Address"
          type="email"
          value={(g as any).email || ""}
          onChange={(e) => setG({ ...g, email: e.target.value } as any)}
        />
        <Input
          label="License Number"
          value={(g as any).licenseNumber || ""}
          onChange={(e) => setG({ ...g, licenseNumber: e.target.value } as any)}
        />
        <Input
          label="Emergency Contact"
          value={(g as any).emergencyContact || ""}
          onChange={(e) => setG({ ...g, emergencyContact: e.target.value } as any)}
        />
        <Input
          label="Join Date"
          type="date"
          value={(g as any).joinDate || ""}
          onChange={(e) => setG({ ...g, joinDate: e.target.value } as any)}
        />
        <Input
          label="Home Address"
          value={(g as any).address || ""}
          onChange={(e) => setG({ ...g, address: e.target.value } as any)}
          className="col-span-2"
        />
        <div className="col-span-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8] mb-1.5 block">Staff Notes</label>
          <textarea
            className="w-full bg-[#06080F] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-[#FF5C00]/50 transition h-24"
            value={(g as any).notes || ""}
            onChange={(e) => setG({ ...g, notes: e.target.value } as any)}
            placeholder="Additional staff information..."
          />
        </div>
      </div>
    </Modal>
  );
}
