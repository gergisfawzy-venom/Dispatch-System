import { useState } from "react";
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Bell, 
  CreditCard, 
  Globe, 
  ChevronRight,
  Save,
  Trash2,
  ShieldCheck,
  Smartphone,
  Mail,
  MessageSquare,
  ExternalLink,
  Plus,
  CreditCard as CardIcon,
  Clock,
  Laptop,
  Camera,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useApp } from "@/context/AppContext";

type TabKey = "general" | "security" | "notifications";

export function SettingsView() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  const tabs = [
    { id: "general", label: "General", icon: User, allowed: ["admin", "dispatcher", "supervisor", "guard"] },
    { id: "security", label: "Security", icon: Lock, allowed: ["admin", "supervisor"] },
    { id: "notifications", label: "Notifications", icon: Bell, allowed: ["admin", "supervisor"] },
  ].filter(t => t.allowed.includes(currentUser?.role || "guard"));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#FF5C00]/10 rounded-lg">
          <SettingsIcon className="text-[#FF5C00]" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-display tracking-tight text-white">System Settings</h1>
          <p className="text-sm text-[#94A3B8]">Manage your account preferences and global system configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-[#FF5C00] text-white shadow-lg shadow-[#FF5C00]/20"
                    : "text-[#94A3B8] hover:bg-white/[0.03] hover:text-[#F1F5F9]"
                )}
              >
                <Icon size={18} />
                {tab.label}
                {activeTab === tab.id && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "general" && <GeneralTab />}
              {activeTab === "security" && <SecurityTab />}
              {activeTab === "notifications" && <NotificationsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function GeneralTab() {
  const { currentUser } = useApp();
  
  return (
    <>
      <Card padded className="border-white/[0.06]">
        <h3 className="text-lg font-medium text-white mb-6">Profile Information</h3>
        
        {/* Profile Picture Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 pb-8 border-b border-white/5">
          <div className="relative group">
            <div className="relative w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-[#FF5C00]/20 group-hover:ring-[#FF5C00]/40 transition-all">
              <Avatar name={currentUser?.name || "User"} size={128} className="w-full h-full text-4xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="text-white" size={32} />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Profile Photo</h4>
              <p className="text-xs text-[#94A3B8]">Upload a professional photo. Recommended size: 512x512px.</p>
            </div>
            <div className="flex gap-3">
              <Button size="sm" className="bg-[#FF5C00] hover:bg-[#FF5C00]/90">
                <Upload size={14} className="mr-2" /> Upload New
              </Button>
              <Button size="sm" variant="secondary" className="text-red-400 border-red-500/20 hover:bg-red-500/10">
                <Trash2 size={14} className="mr-2" /> Remove
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Full Name</label>
            <Input defaultValue={currentUser?.name || "Reema Hassan"} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Email Address</label>
            <Input defaultValue="reema@asapdispatch.com" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Phone Number</label>
            <Input defaultValue="+1 (555) 012-3456" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Extension</label>
            <Input defaultValue={currentUser?.extension || "101"} />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button className="bg-[#FF5C00] hover:bg-[#FF5C00]/90 shadow-lg shadow-[#FF5C00]/20">
            <Save size={16} className="mr-2" /> Save Profile Changes
          </Button>
        </div>
      </Card>

      <Card padded className="border-white/[0.06]">
        <h3 className="text-lg font-medium text-white mb-6">Regional & UI Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Timezone</label>
            <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/50 transition-all appearance-none cursor-pointer">
              <option className="bg-[#0A0E1A] text-white">Eastern Standard Time (EST)</option>
              <option className="bg-[#0A0E1A] text-white">Pacific Standard Time (PST)</option>
              <option className="bg-[#0A0E1A] text-white">GMT / UTC</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Language</label>
            <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/50 transition-all appearance-none cursor-pointer">
              <option className="bg-[#0A0E1A] text-white">English (US)</option>
              <option className="bg-[#0A0E1A] text-white">English (UK)</option>
              <option className="bg-[#0A0E1A] text-white">Spanish</option>
              <option className="bg-[#0A0E1A] text-white">French</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Dashboard Layout</label>
            <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/50 transition-all appearance-none cursor-pointer">
              <option className="bg-[#0A0E1A] text-white">Tactical Overview (Standard)</option>
              <option className="bg-[#0A0E1A] text-white">Map Centric</option>
              <option className="bg-[#0A0E1A] text-white">Feed Centric</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Auto-Refresh Interval</label>
            <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/50 transition-all appearance-none cursor-pointer">
              <option className="bg-[#0A0E1A] text-white">Real-time (Stream)</option>
              <option className="bg-[#0A0E1A] text-white">10 Seconds</option>
              <option className="bg-[#0A0E1A] text-white">30 Seconds</option>
              <option className="bg-[#0A0E1A] text-white">Manual Only</option>
            </select>
          </div>
        </div>
      </Card>
    </>
  );
}

function SecurityTab() {
  return (
    <>
      <Card padded className="border-white/[0.06]">
        <h3 className="text-lg font-medium text-white mb-6">Security Overview</h3>
        <div className="flex items-center gap-4 p-5 bg-green-500/5 border border-green-500/10 rounded-2xl">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <ShieldCheck className="text-green-500" size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Your account security is High</p>
            <p className="text-xs text-[#94A3B8]">Last security check was performed 2 days ago.</p>
          </div>
          <Badge color="green" className="ml-auto">Secure</Badge>
        </div>
      </Card>

      <Card padded className="border-white/[0.06]">
        <h3 className="text-lg font-medium text-white mb-6">Authentication Methods</h3>
        <div className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 group hover:border-[#FF5C00]/20 transition-all">
          <div className="flex gap-4">
            <div className="p-3 bg-[#FF5C00]/10 rounded-xl group-hover:bg-[#FF5C00]/20 transition-colors">
              <Smartphone className="text-[#FF5C00]" size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">SMS Authentication</p>
              <p className="text-xs text-[#94A3B8]">Receive a 6-digit code via SMS to your primary phone.</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" className="border-white/10 text-white hover:bg-[#FF5C00] hover:border-[#FF5C00] transition-all">Enable</Button>
        </div>
      </Card>

      <Card padded className="border-white/[0.06]">
        <h3 className="text-lg font-medium text-white mb-6">Active Login Sessions</h3>
        <div className="space-y-4">
          {[
            { device: "MacBook Pro 16", loc: "San Diego, CA", current: true, icon: Laptop, browser: "Chrome 124.0.0" },
            { device: "iPhone 15 Pro", loc: "San Diego, CA", current: false, icon: Smartphone, browser: "Safari Mobile" },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-transparent hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/5 rounded-xl">
                  <session.icon size={20} className="text-[#94A3B8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{session.device}</span>
                    {session.current && <Badge size="sm" color="blue" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>}
                  </div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-[0.1em] font-bold mt-1">{session.loc} • {session.browser}</p>
                </div>
              </div>
              {!session.current && <button className="text-xs font-bold text-red-400 hover:text-red-300 px-4 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-all uppercase tracking-widest">Revoke</button>}
            </div>
          ))}
        </div>
      </Card>
      
      <Card padded className="border-red-500/20 bg-red-500/5">
        <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
        <p className="text-xs text-red-400/60 mb-6 font-medium">Permanently delete your account and all associated dispatch data. This action is irreversible.</p>
        <Button variant="secondary" className="border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
          <Trash2 size={16} className="mr-2" /> Deactivate Dispatch Account
        </Button>
      </Card>
    </>
  );
}

function NotificationsTab() {
  const categories = [
    { name: "Emergency Alerts", desc: "Panic triggers, critical geofence breaches", types: ["Push", "Email", "SMS"] },
    { name: "Dispatch Updates", desc: "New incidents, shift confirmation delays", types: ["Push", "Email"] },
    { name: "Communication", desc: "Incoming chat, voicemail, broadcast replies", types: ["Push"] },
  ];

  return (
    <Card padded className="border-white/[0.06]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-medium text-white">Notification Center</h3>
          <p className="text-sm text-[#94A3B8]">Configure real-time alerting channels for tactical events.</p>
        </div>
        <Button size="sm" variant="secondary" className="border-white/10 text-white hover:bg-white/5 font-bold uppercase tracking-widest">Restore Defaults</Button>
      </div>

      <div className="space-y-10">
        {categories.map((cat, i) => (
          <div key={i} className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] mb-1">{cat.name}</h4>
                <p className="text-xs text-[#94A3B8] italic">{cat.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cat.types.map((type) => (
                <div key={type} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4 text-sm font-semibold text-[#F1F5F9]">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                      {type === "Push" && <Bell size={16} className="text-blue-400" />}
                      {type === "Email" && <Mail size={16} className="text-purple-400" />}
                      {type === "SMS" && <Smartphone size={16} className="text-green-400" />}
                    </div>
                    {type}
                  </div>
                  <div className="w-11 h-6 bg-[#FF5C00] rounded-full relative p-1 cursor-pointer shadow-inner">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
        <Button className="bg-[#FF5C00] shadow-lg shadow-[#FF5C00]/20 font-bold uppercase tracking-widest px-8 py-6">Save Preferences</Button>
      </div>
    </Card>
  );
}


