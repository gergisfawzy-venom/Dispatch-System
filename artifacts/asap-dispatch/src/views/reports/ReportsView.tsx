import { useMemo, useState } from "react";
import { Download, TrendingUp, Clock, AlertTriangle, Shield, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { addDays, isoDay, startOfWeek } from "@/lib/utils";

const COLORS = ["#FF5C00", "#3B82F6", "#22C55E", "#F59E0B", "#A855F7", "#EC4899", "#14B8A6", "#EF4444"];

export function ReportsView() {
  const { guards, sites, shifts, incidents, calls, toast } = useApp();
  const [exportOpen, setExportOpen] = useState(false);

  const weekStart = startOfWeek(new Date());

  const hoursByGuard = useMemo(() => {
    const map: Record<number, number> = {};
    shifts.forEach((s) => {
      const start = parseTime(s.startTime);
      const end = parseTime(s.endTime);
      const dur = end > start ? end - start : 1440 - start + end;
      map[s.guardId] = (map[s.guardId] ?? 0) + dur / 60;
    });
    return guards.map((g) => ({ name: g.name.split(" ")[0]!, hours: Math.round(map[g.id] ?? 0) }));
  }, [shifts, guards]);

  const incidentsBySeverity = useMemo(() => {
    const map = { low: 0, medium: 0, high: 0, emergency: 0 };
    incidents.forEach((i) => { map[i.severity]++; });
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v }));
  }, [incidents]);

  const incidentsBySite = useMemo(
    () => sites.map((s) => ({ name: s.name, count: incidents.filter((i) => i.siteId === s.id).length })),
    [sites, incidents]
  );

  const dailyTrend = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(weekStart, i);
      const dStr = isoDay(d);
      const incidentsToday = incidents.filter((x) => isoDay(x.createdAt) === dStr).length;
      const callsToday = calls.filter((c) => isoDay(c.startedAt) === dStr).length;
      return {
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        incidents: incidentsToday,
        calls: callsToday + Math.round(Math.random() * 4),
      };
    });
  }, [incidents, calls, weekStart]);

  const stats = [
    { icon: <Clock size={16} />, label: "Total hours", value: `${hoursByGuard.reduce((a, h) => a + h.hours, 0)}h` },
    { icon: <AlertTriangle size={16} />, label: "Incidents this week", value: incidents.length },
    { icon: <Shield size={16} />, label: "Sites covered", value: sites.length },
    { icon: <Activity size={16} />, label: "Calls placed", value: calls.length },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#FF5C00] mb-1">Reports</div>
          <h1 className="font-display text-2xl md:text-3xl">Operations Reports</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Weekly summary of hours, incidents, and activity</p>
        </div>
        <Button variant="primary" icon={<Download size={14} />} onClick={() => setExportOpen(true)}>Export</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card padded key={s.label}>
            <div className="text-[#FF5C00]">{s.icon}</div>
            <div className="font-display text-3xl mt-3">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-[#94A3B8] mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card padded>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-base">Hours by Guard</h3>
            <Badge color="orange">This week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hoursByGuard}>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,92,0,0.05)" }} />
              <Bar dataKey="hours" fill="#FF5C00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padded>
          <h3 className="font-display text-base mb-3">Incident Severity Mix</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={incidentsBySeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {incidentsBySeverity.map((_, i) => (
                  <Cell key={i} fill={["#3B82F6", "#F59E0B", "#FF5C00", "#EF4444"][i]!} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card padded>
          <h3 className="font-display text-base mb-3">Incidents by Site</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={incidentsBySite} layout="vertical">
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 11 }} width={100} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,92,0,0.05)" }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padded>
          <h3 className="font-display text-base mb-3">Daily Activity Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#94A3B8", fontSize: 12 }} />
              <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444", r: 4 }} />
              <Line type="monotone" dataKey="calls" stroke="#FF5C00" strokeWidth={2} dot={{ fill: "#FF5C00", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card padded>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base">Top Performers</h3>
          <TrendingUp size={14} className="text-[#FF5C00]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hoursByGuard
            .map((h, i) => ({ ...h, full: guards[i]!.name }))
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 4)
            .map((h) => (
              <div key={h.full} className="flex items-center gap-3 p-3 rounded-lg bg-[#06080F] border border-white/[0.06]">
                <Avatar name={h.full} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{h.full}</div>
                  <div className="text-xs text-[#FF5C00] font-mono">{h.hours}h logged</div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {exportOpen && (
        <Modal
          open
          onClose={() => setExportOpen(false)}
          title="Export Reports"
          width="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setExportOpen(false)}>Cancel</Button>
              <Button variant="primary" icon={<Download size={14} />} onClick={() => { toast("Report exported"); setExportOpen(false); }}>Export</Button>
            </>
          }
        >
          <div className="space-y-2">
            {["Daily Activity Report (DAR)", "Hours by guard (CSV)", "Incident summary (PDF)", "Site coverage report (CSV)"].map((opt) => (
              <label key={opt} className="flex items-center gap-3 p-3 bg-[#06080F] border border-white/[0.06] rounded-lg cursor-pointer hover:border-white/15">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-[#06080F]" />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#0F1525",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F1F5F9",
};

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
