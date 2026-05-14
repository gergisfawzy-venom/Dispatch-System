import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Shield, Eye, EyeOff } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { UserRole } from "@/types";

const demoAccounts: { name: string; role: UserRole; ext: number; email: string; avatar?: string }[] = [
  { name: "Reema Hassan", role: "admin", ext: 100, email: "admin@asap.dispatch", avatar: "/dispatcher_profile_pic_1777351635293.png" },
  { name: "Daniel Chen", role: "dispatcher", ext: 110, email: "dispatch@asap.dispatch" },
  { name: "Samir Najjar", role: "supervisor", ext: 107, email: "supervisor@asap.dispatch" },
  { name: "Marcus Johnson", role: "guard", ext: 101, email: "guard@asap.dispatch" },
];

export function LoginView() {
  const { setUser, setView, toast } = useApp();
  const [email, setEmail] = useState("dispatch@asap.dispatch");
  const [password, setPassword] = useState("demo");
  const [role, setRole] = useState<UserRole>("dispatcher");
  const [showPw, setShowPw] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setShake(true);
      setTimeout(() => setShake(false), 320);
      toast("Email and password are required", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const account = demoAccounts.find((a) => a.email === email) ?? demoAccounts.find((a) => a.role === role)!;
      setUser({ name: account.name, role: account.role, extension: account.ext });
      setView("dashboard");
      toast(`Signed in as ${account.name}`);
    }, 450);
  }

  function quickLogin(idx: number) {
    const a = demoAccounts[idx]!;
    setEmail(a.email);
    setPassword("demo");
    setRole(a.role);
    setLoading(true);
    setTimeout(() => {
      setUser({ name: a.name, role: a.role, extension: a.ext });
      setView("dashboard");
      toast(`Signed in as ${a.name}`);
    }, 350);
  }

  return (
    <div className="min-h-screen flex items-stretch bg-[#06080F] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,92,0,0.18) 0%, rgba(255,92,0,0) 60%)" }}
      />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0) 60%)" }} />

      <div className="hidden lg:flex flex-col justify-between p-12 w-1/2 relative z-10">
        <button onClick={() => setView("landing")} className="self-start">
          <Logo size="lg" />
        </button>
        <div>
          <Badge color="orange" pulse className="mb-4">Live system</Badge>
          <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight">
            Eyes on every guard.<br />
            <span className="text-[#FF5C00]">Hands on every shift.</span>
          </h1>
          <p className="text-[#94A3B8] mt-6 text-lg max-w-md leading-relaxed">
            Sign in to launch the command center. All data shown is locally
            simulated for the demo — real ops would hook to your roster.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#94A3B8]">
          <Shield size={14} />
          Operations grade · session encrypted
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className={`w-full max-w-md bg-[#0A0E1A]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-7 shadow-2xl ${shake ? "shake" : ""}`}
        >
          <div className="lg:hidden mb-6 flex justify-center">
            <Logo />
          </div>

          <h2 className="font-display text-2xl">Sign in</h2>
          <p className="text-sm text-[#94A3B8] mt-1 mb-6">
            Choose your role and credentials
          </p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {(["admin", "dispatcher", "supervisor", "guard"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-3 py-2 rounded-lg text-xs uppercase tracking-wider font-medium transition border ${
                  role === r
                    ? "bg-[#FF5C00]/10 border-[#FF5C00] text-[#FFA66B]"
                    : "bg-[#06080F] border-white/10 text-[#94A3B8] hover:border-white/20"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={14} />}
              placeholder="you@company.com"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={14} />}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-[34px] text-[#94A3B8] hover:text-white"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            iconRight={<ArrowRight size={16} />}
            className="mt-6"
          >
            Sign in
          </Button>

          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="text-[10px] uppercase tracking-wider text-[#94A3B8] mb-2">
              Quick demo login
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((a, i) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => quickLogin(i)}
                  className="text-left p-2.5 rounded-lg bg-[#06080F] border border-white/[0.06] hover:border-[#FF5C00]/30 transition"
                >
                  <div className="text-xs text-[#F1F5F9] font-medium">{a.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#94A3B8] mt-0.5">
                    {a.role}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
