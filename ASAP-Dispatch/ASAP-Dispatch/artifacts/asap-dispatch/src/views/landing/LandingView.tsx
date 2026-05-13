import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  MapPin,
  Phone,
  AlertTriangle,
  Shield,
  Zap,
  Activity,
  Users,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function LandingView() {
  const { setView } = useApp();

  return (
    <div className="min-h-screen bg-[#06080F] text-[#F1F5F9] overflow-x-hidden">
      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 md:px-12 py-5 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#94A3B8]">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#impact" className="hover:text-white transition">Impact</a>
          <a href="#cta" className="hover:text-white transition">Get Started</a>
        </nav>
        <Button variant="primary" onClick={() => setView("login")} icon={<ArrowRight size={14} />}>
          Sign in
        </Button>
      </header>

      {/* Hero */}
      <section className="relative pt-36 md:pt-44 pb-24 px-6 md:px-12">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,92,0,0.18) 0%, rgba(255,92,0,0) 60%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge color="orange" size="md" pulse className="mb-6">
              Live Operations Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight"
          >
            Tactical Command.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF5C00 0%, #FF8A3D 60%, #FFB48A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Total Visibility.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto mt-6"
          >
            One unified platform for security operations. Schedule shifts, track
            guards in real time, manage incidents, and dispatch over VoIP — all
            from a single command surface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => setView("login")}
              iconRight={<ArrowRight size={16} />}
            >
              Launch Command Center
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const el = document.getElementById("features");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See how it works
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl border border-white/10 overflow-hidden shadow-[0_30px_120px_-20px_rgba(255,92,0,0.4)]">
              <div className="aspect-[16/9] bg-[#0A0E1A] relative overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-px p-6">
                  <div className="col-span-3 row-span-6 bg-[#0F1525] rounded-lg border border-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-[#FF5C00] mb-3">Active Guards</div>
                    {["Marcus J.", "Aisha F.", "Khalid R.", "Diana O."].map((n, i) => (
                      <div key={n} className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 rounded-full ${i === 3 ? "bg-yellow-400" : "bg-green-400 pulse-active"}`} />
                        <div className="text-xs text-[#F1F5F9]">{n}</div>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-6 row-span-4 bg-[#0F1525] rounded-lg border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-dots opacity-20" />
                    <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-green-400 rounded-full pulse-active" />
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-400 rounded-full pulse-active" />
                    <div className="absolute top-2/3 left-2/3 w-3 h-3 bg-red-500 rounded-full pulse-ring" />
                    <div className="absolute bottom-3 right-3 text-[10px] uppercase tracking-wider text-[#94A3B8]">Live Tracker</div>
                  </div>
                  <div className="col-span-3 row-span-3 bg-[#0F1525] rounded-lg border border-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#FF5C00] mb-2">Alerts</div>
                    <div className="space-y-2 text-xs">
                      <div className="text-red-400">Panic — Tomas R.</div>
                      <div className="text-yellow-400">Late — Diana O.</div>
                      <div className="text-blue-400">New incident</div>
                    </div>
                  </div>
                  <div className="col-span-3 row-span-3 bg-[#0F1525] rounded-lg border border-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#FF5C00] mb-2">VoIP</div>
                    <div className="font-mono text-2xl text-[#22C55E]">02:14</div>
                    <div className="text-[10px] text-[#94A3B8] mt-1">Ext 102 connected</div>
                  </div>
                  <div className="col-span-6 row-span-2 bg-[#0F1525] rounded-lg border border-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#FF5C00] mb-2">Today's Shifts</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-6 rounded ${i < 4 ? "bg-green-500/40" : i < 6 ? "bg-blue-500/40" : "bg-white/5"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge color="red" pulse className="mb-4">The Problem</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Three apps, four spreadsheets, and a missing guard.
            </h2>
            <p className="text-[#94A3B8] mt-6 text-lg leading-relaxed">
              Most operations stitch together a scheduler, a GPS tracker, a chat
              tool, and a phone — none of which talk to each other. When a panic
              alert fires, dispatchers waste critical seconds opening tabs.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { time: "00:00", text: "Panic alert fires from Guard #5", color: "red" },
              { time: "00:08", text: "Dispatcher opens GPS tracker tab", color: "yellow" },
              { time: "00:14", text: "Switches to phone app to call", color: "yellow" },
              { time: "00:22", text: "Switches to chat to send team", color: "yellow" },
              { time: "00:31", text: "Logs incident in fourth tool", color: "yellow" },
              { time: "00:00", text: "ASAP Dispatch — one click, all four", color: "green" },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl border ${row.color === "green"
                    ? "border-green-500/40 bg-green-500/5"
                    : row.color === "red"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-white/5 bg-white/[0.02]"
                  }`}
              >
                <span className="font-mono text-sm text-[#94A3B8] w-12">{row.time}</span>
                <span className="text-sm text-[#F1F5F9]">{row.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge color="orange" className="mb-4">Capabilities</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Everything dispatch needs.
            <br />
            <span className="text-[#94A3B8]">Nothing it doesn't.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <Calendar size={22} />, title: "Smart Scheduler", desc: "Drag-drop shift planning, swap requests, overtime alerts, and auto-conflict detection." },
            { icon: <MapPin size={22} />, title: "Live Tracker", desc: "Real-time GPS, custom geofences, checkpoint scans, and panic-button overlays." },
            { icon: <AlertTriangle size={22} />, title: "Incident Reports", desc: "Photo evidence, GPS-stamped entries, and full review workflow with audit trail." },
            { icon: <Phone size={22} />, title: "Built-in VoIP", desc: "Call any guard by extension, broadcast to active teams, and play voicemail with transcription." },
            { icon: <Activity size={22} />, title: "Reports & DAR", desc: "Daily activity reports, hours, incidents, checkpoint compliance — exportable in two clicks." },
            { icon: <Shield size={22} />, title: "Permissions Matrix", desc: "Role-based access for admins, dispatchers, supervisors, and guards." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 rounded-2xl bg-[#0A0E1A] border border-white/[0.06] hover:border-[#FF5C00]/30 transition relative overflow-hidden"
            >
              <div className="w-11 h-11 rounded-lg bg-[#FF5C00]/10 text-[#FF5C00] flex items-center justify-center mb-4 group-hover:bg-[#FF5C00]/20 transition">
                {f.icon}
              </div>
              <h3 className="font-display text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="impact" className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0A0E1A] to-[#06080F] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FF5C00 0%, transparent 70%)" }} />
          <div className="grid md:grid-cols-4 gap-10 relative">
            {[
              { v: "73%", l: "Faster incident response" },
              { v: "5×", l: "Tools consolidated" },
              { v: "100%", l: "Live shift visibility" },
              { v: "24/7", l: "Real-time tracking" },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="font-display text-5xl md:text-6xl font-bold text-[#FF5C00] leading-none">
                  {s.v}
                </div>
                <div className="text-sm text-[#94A3B8] mt-3 uppercase tracking-wider">
                  {s.l}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section id="pricing" className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <Badge color="green" className="mb-4">Pricing</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Plans that scale with
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF5C00 0%, #FF8A3D 60%, #FFB48A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              your operation.
            </span>
          </h2>
          <p className="text-[#94A3B8] mt-4 text-lg max-w-2xl mx-auto">
            From a single-site team to multi-city enterprise — pick the tier that fits your footprint.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Starter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="relative rounded-2xl border border-white/[0.06] bg-[#0A0E1A] p-7 flex flex-col hover:border-white/15 transition-all duration-300"
          >
            <Badge color="gray" className="mb-5 self-start">Starter</Badge>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-display text-4xl font-bold">$299</span>
              <span className="text-sm text-[#94A3B8] mb-1">/month</span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-6">Up to 15 guards · 3 sites</p>
            <ul className="flex-1 space-y-3 mb-8">
              {[
                "Smart Scheduler",
                "Live GPS Tracker",
                "Incident Reporting",
                "Checkpoint Scanning",
                "Email & Chat Support",
                "Basic Analytics",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#CBD5E1]">
                  <Check size={14} className="text-green-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setView("login")}>
              Get Started
            </Button>
          </motion.div>

          {/* Professional — highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative rounded-2xl border-2 border-[#FF5C00]/50 bg-gradient-to-b from-[#FF5C00]/[0.06] to-[#0A0E1A] p-7 flex flex-col shadow-[0_0_60px_-15px_rgba(255,92,0,0.35)]"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full bg-[#FF5C00] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                Most Popular
              </span>
            </div>
            <Badge color="orange" pulse className="mb-5 self-start">Professional</Badge>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-display text-4xl font-bold">$599</span>
              <span className="text-sm text-[#94A3B8] mb-1">/month</span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-6">Up to 50 guards · 10 sites</p>
            <ul className="flex-1 space-y-3 mb-8">
              {[
                "Everything in Starter",
                "Built-in VoIP Dispatch",
                "Panic Button Alerts",
                "Swap & Time-Off Workflow",
                "Daily Activity Reports",
                "Permissions Matrix",
                "Priority Support (4h SLA)",
                "Custom Geofences",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#CBD5E1]">
                  <Check size={14} className="text-[#FF5C00] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="primary" size="lg" className="w-full" onClick={() => setView("login")} iconRight={<ArrowRight size={16} />}>
              Start Free Trial
            </Button>
          </motion.div>

          {/* Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="relative rounded-2xl border border-white/[0.06] bg-[#0A0E1A] p-7 flex flex-col hover:border-white/15 transition-all duration-300"
          >
            <Badge color="purple" className="mb-5 self-start">Enterprise</Badge>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-display text-4xl font-bold">Custom</span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-6">Unlimited guards · Unlimited sites</p>
            <ul className="flex-1 space-y-3 mb-8">
              {[
                "Everything in Professional",
                "SSO & SAML Integration",
                "Dedicated Account Manager",
                "API Access & Webhooks",
                "Custom Integrations",
                "White-label Option",
                "On-premise Deployment",
                "99.99% SLA Guarantee",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#CBD5E1]">
                  <Check size={14} className="text-purple-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setView("login")}>
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Mobile preview */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge color="blue" className="mb-4">Field App</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Dispatch on the desk.<br />Guards in the field.
            </h2>
            <p className="text-[#94A3B8] mt-6 text-lg leading-relaxed">
              Your guards run a focused mobile companion: clock in with geofence,
              scan checkpoints, file incidents with photos, and trigger panic — all
              tied back to the command center in real time.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["One-tap panic with auto-GPS", "Photo-verified clock-in", "Checkpoint QR/NFC scanning", "Push notifications from dispatch"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-[#F1F5F9]">
                  <ChevronRight size={14} className="text-[#FF5C00]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="relative w-[280px] h-[560px] rounded-[44px] border-[10px] border-[#161D30] bg-[#06080F] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7)] overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#161D30] rounded-b-2xl z-10" />
              <div className="p-4 pt-10 h-full flex flex-col">
                <div className="text-[10px] uppercase tracking-wider text-[#FF5C00] mb-1">Marcus Johnson</div>
                <div className="font-display text-lg">Westfield Mall</div>
                <div className="text-xs text-[#94A3B8] mb-4">Active shift · 04:21:18</div>

                <div className="flex-1 space-y-3">
                  <div className="rounded-xl bg-[#0F1525] border border-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Next checkpoint</div>
                    <div className="text-sm font-medium mt-1">East Employee Entrance</div>
                    <div className="text-[10px] text-[#FF5C00] mt-1">Due in 7 min</div>
                  </div>
                  <button className="w-full rounded-xl bg-[#FF5C00] text-white py-3 text-sm font-bold">
                    Scan Checkpoint
                  </button>
                  <button className="w-full rounded-xl bg-white/5 border border-white/10 text-white py-3 text-sm">
                    Submit Incident
                  </button>
                </div>

                <button className="w-full rounded-xl bg-red-500 text-white py-4 text-sm font-bold pulse-active">
                  PANIC
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="px-6 md:px-12 py-24">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <Zap size={42} className="text-[#FF5C00] mx-auto mb-6" />
            <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
              When seconds matter,<br />you need the whole picture.
            </h2>
            <p className="text-lg text-[#94A3B8] max-w-xl mx-auto mt-6">
              Sign in with one of the demo accounts and explore the full
              command center.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="primary" size="lg" onClick={() => setView("login")} iconRight={<ArrowRight size={16} />}>
                Open Command Center
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-md mx-auto text-center">
              <div>
                <Users size={18} className="text-[#FF5C00] mx-auto mb-2" />
                <div className="text-xs text-[#94A3B8]">7 demo guards</div>
              </div>
              <div>
                <Building2 size={18} className="text-[#FF5C00] mx-auto mb-2" />
                <div className="text-xs text-[#94A3B8]">5 active sites</div>
              </div>
              <div>
                <AlertTriangle size={18} className="text-[#FF5C00] mx-auto mb-2" />
                <div className="text-xs text-[#94A3B8]">6 open incidents</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo size="sm" />
        <div className="text-xs text-[#94A3B8]">
          © {new Date().getFullYear()} ASAP Dispatch. Tactical operations platform.
        </div>
      </footer>
    </div>
  );
}
