import type { GuardStatus, IncidentSeverity, IncidentStatus, ShiftStatus, SiteStatus, CheckpointStatus } from "@/types";
import { Badge } from "./Badge";

const guardMap: Record<GuardStatus, { color: Parameters<typeof Badge>[0]["color"]; label: string; pulse?: boolean }> = {
  active: { color: "green", label: "Active", pulse: true },
  "on-patrol": { color: "blue", label: "On Patrol", pulse: true },
  "on-break": { color: "yellow", label: "On Break" },
  late: { color: "yellow", label: "Late" },
  missing: { color: "red", label: "Missing", pulse: true },
  scheduled: { color: "gray", label: "Scheduled" },
  "off-duty": { color: "gray", label: "Off Duty" },
};

export function GuardStatusBadge({ status }: { status: GuardStatus }) {
  const m = guardMap[status];
  return (
    <Badge color={m.color} pulse={m.pulse}>
      {m.label}
    </Badge>
  );
}

const shiftMap: Record<ShiftStatus, { color: Parameters<typeof Badge>[0]["color"]; label: string }> = {
  scheduled: { color: "gray", label: "Scheduled" },
  published: { color: "blue", label: "Published" },
  confirmed: { color: "blue", label: "Confirmed" },
  active: { color: "green", label: "Active" },
  late: { color: "yellow", label: "Late" },
  missed: { color: "red", label: "Missed" },
  completed: { color: "purple", label: "Completed" },
};

export function ShiftStatusBadge({ status }: { status: ShiftStatus }) {
  const m = shiftMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}

const sevMap: Record<IncidentSeverity, { color: Parameters<typeof Badge>[0]["color"]; label: string; pulse?: boolean }> = {
  low: { color: "blue", label: "Low" },
  medium: { color: "yellow", label: "Medium" },
  high: { color: "orange", label: "High" },
  emergency: { color: "red", label: "Emergency", pulse: true },
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const m = sevMap[severity];
  return (
    <Badge color={m.color} pulse={m.pulse}>
      {m.label}
    </Badge>
  );
}

const incidentStatusMap: Record<IncidentStatus, { color: Parameters<typeof Badge>[0]["color"]; label: string }> = {
  open: { color: "red", label: "Open" },
  "in-review": { color: "yellow", label: "In Review" },
  resolved: { color: "green", label: "Resolved" },
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const m = incidentStatusMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}

const siteMap: Record<SiteStatus, { color: Parameters<typeof Badge>[0]["color"]; label: string; pulse?: boolean }> = {
  active: { color: "green", label: "Active" },
  upcoming: { color: "blue", label: "Upcoming" },
  alert: { color: "red", label: "Alert", pulse: true },
  inactive: { color: "gray", label: "Inactive" },
};

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const m = siteMap[status];
  return (
    <Badge color={m.color} pulse={m.pulse}>
      {m.label}
    </Badge>
  );
}

const cpMap: Record<CheckpointStatus, { color: Parameters<typeof Badge>[0]["color"]; label: string }> = {
  completed: { color: "green", label: "Completed" },
  pending: { color: "yellow", label: "Pending" },
  overdue: { color: "orange", label: "Overdue" },
  missed: { color: "red", label: "Missed" },
};

export function CheckpointStatusBadge({ status }: { status: CheckpointStatus }) {
  const m = cpMap[status];
  return <Badge color={m.color}>{m.label}</Badge>;
}
