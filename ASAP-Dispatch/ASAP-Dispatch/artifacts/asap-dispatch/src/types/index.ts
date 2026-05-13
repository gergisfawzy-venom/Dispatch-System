export type UserRole = "admin" | "dispatcher" | "supervisor" | "guard";

export type GuardStatus =
  | "active"
  | "on-patrol"
  | "on-break"
  | "late"
  | "missing"
  | "scheduled"
  | "off-duty";

export interface Guard {
  id: number;
  name: string;
  role: UserRole;
  phone: string;
  extension: number;
  site: string;
  status: GuardStatus;
  lat: number;
  lng: number;
  clockIn?: string;
  clockOut?: string;
  panicActive: boolean;
  lastActivity: Date;
  history: [number, number][];
  assignedPath: [number, number][];
  avatar?: string;
  geofenceOk?: boolean;
  weeklyHours: number;
}

export type SiteStatus = "active" | "upcoming" | "alert" | "inactive";

export interface Site {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  geofenceRadius: number;
  status: SiteStatus;
  postOrders: string;
  checkpoints: Checkpoint[];
  assignedGuards: number[];
}

export type CheckpointStatus = "completed" | "pending" | "overdue" | "missed";

export interface Checkpoint {
  id: number;
  siteId: number;
  name: string;
  lat: number;
  lng: number;
  requiredIntervalMinutes: number;
  lastScanned?: Date;
  scannedBy?: number;
  status: CheckpointStatus;
}

export type ShiftStatus =
  | "scheduled"
  | "published"
  | "confirmed"
  | "active"
  | "late"
  | "missed"
  | "completed";

export interface Shift {
  id: number;
  guardId: number;
  siteId: number;
  date: string;
  startTime: string;
  endTime: string;
  actualClockIn?: string;
  actualClockOut?: string;
  role: string;
  status: ShiftStatus;
  confirmedAt?: Date;
  tasks: ShiftTask[];
  swapRequest?: SwapRequest;
}

export interface ShiftTask {
  id: number;
  text: string;
  completed: boolean;
  completedAt?: Date;
}

export interface SwapRequest {
  id: number;
  shiftId: number;
  requestedById: number;
  requestedGuardId: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface TimeOffRequest {
  id: number;
  guardId: number;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
}

export type IncidentSeverity = "low" | "medium" | "high" | "emergency";
export type IncidentStatus = "open" | "in-review" | "resolved";

export interface Incident {
  id: number;
  title: string;
  description: string;
  guardId: number;
  siteId: number;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
  hasPhoto: boolean;
  photoPlaceholder?: string;
  gpsLat?: number;
  gpsLng?: number;
  linkedPanic: boolean;
}

export type MessageEndpoint = number | "dispatcher" | "broadcast";

export interface Message {
  id: number;
  fromId: MessageEndpoint;
  toId: MessageEndpoint;
  text: string;
  timestamp: Date;
  read: boolean;
  type: "text" | "incident-ref" | "broadcast";
  incidentId?: number;
}

export interface CallLog {
  id: number;
  guardId: number;
  extension: number;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  outcome: "answered" | "missed" | "voicemail";
  notes?: string;
  isActive: boolean;
}

export interface Voicemail {
  id: number;
  fromGuardId: number;
  toDispatcher: boolean;
  duration: number;
  receivedAt: Date;
  transcription: string;
  played: boolean;
}

export type NotificationType =
  | "panic"
  | "checkpoint-missed"
  | "shift-unconfirmed"
  | "geofence-breach"
  | "overtime"
  | "new-incident"
  | "time-off-request"
  | "swap-request"
  | "late";

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  guardId?: number;
  siteId?: number;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  navigateTo?: ViewKey;
}

export interface DailyActivityReport {
  guardId: number;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  checkpointsCompleted: number;
  checkpointsMissed: number;
  incidentsFiled: number;
  incidents: Incident[];
  notes: string;
  generatedAt: Date;
}

export type ViewKey =
  | "landing"
  | "login"
  | "dashboard"
  | "scheduler"
  | "timesheet"
  | "tracker"
  | "incidents"
  | "chat"
  | "calls"
  | "sites"
  | "users"
  | "reports"
  | "settings";

export interface CurrentUser {
  id?: number;
  name: string;
  email?: string;
  role: UserRole;
  extension: number;
  avatar?: string;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "info" | "warn" | "error";
}
