# ASAP DISPATCH — Web Application
# Full Build Prompt for Google AI Studio (Gemini 2.5 Pro)
# Start fresh. New project. Complete system.

---

## ROLE & MISSION

You are a senior full-stack frontend engineer specializing in React, TypeScript, and
operations management platforms. You will build ASAP Dispatch — a complete, production-
quality security dispatch management system from scratch.

This is NOT a prototype. Every feature must work. Every button must do something.
Every piece of data must be reactive, editable, and persistent across all views
using React state.

---

## PROJECT IDENTITY

**Name:** ASAP Dispatch
**Tagline:** "Tactical Command. Total Visibility."
**Type:** Security Operations Dispatch Platform
**Users:** Dispatchers, Supervisors, Admins (web) + Guards (mobile companion)
**Purpose:** Replace three separate tools (scheduling, guard tracking, VoIP calling)
with one unified command center.

---

## TECHNICAL STACK — EXACT REQUIREMENTS

```
Framework:     React 19 with TypeScript (strict mode)
Bundler:       Vite 6
Styling:       Tailwind CSS v4 (utility-first, no component libraries)
Animation:     Framer Motion (all transitions and interactions)
Maps:          Leaflet + React-Leaflet (guard tracking)
Icons:         Lucide React
State:         React useState + useReducer + useContext (no Redux, no Zustand)
Data:          100% local mock data in a /src/data/ folder — no API calls
Routing:       View-based state switching (no React Router needed)
Charts:        Recharts (for reports tab)
```

No external UI component libraries. No shadcn. No Material UI. No Chakra.
Build everything from scratch using Tailwind utilities.

---

## DESIGN SYSTEM

### Color Palette (CSS variables in index.css)
```
--color-bg-primary:     #06080F   (deepest background)
--color-bg-secondary:   #0A0E1A   (card backgrounds)
--color-bg-tertiary:    #0F1525   (elevated surfaces)
--color-bg-hover:       #161D30   (hover states)
--color-border:         rgba(255,255,255,0.06)
--color-border-active:  rgba(255,255,255,0.12)
--color-accent-orange:  #FF5C00   (primary action color)
--color-accent-blue:    #3B82F6   (secondary accent)
--color-accent-red:     #EF4444   (danger / emergency)
--color-accent-green:   #22C55E   (success / active)
--color-accent-yellow:  #F59E0B   (warning / late)
--color-text-primary:   #F1F5F9   (main text)
--color-text-secondary: #94A3B8   (muted text)
--color-text-dim:       #475569   (very muted)
```

### Typography
```
Display/Headers:  font-family: 'Syne', sans-serif (Google Fonts — bold, geometric)
Body/UI:          font-family: 'DM Sans', sans-serif (Google Fonts — clean, readable)
Monospace/Data:   font-family: 'JetBrains Mono', monospace (timestamps, IDs, codes)
```

Import all three from Google Fonts in index.html.

### Component Language
- Cards: bg-secondary, 1px border using --color-border, rounded-xl, subtle shadow
- Buttons: Primary = bg-accent-orange text-white. Secondary = bg-tertiary border.
  Ghost = transparent with hover. Danger = bg-red-500/10 text-red-400 border-red-500/20
- Badges: Small pill shapes with bg-color/10 text-color border-color/20 pattern
- Modals: Full overlay (backdrop-blur-md bg-black/60), centered card, slide-up animation
- All interactive elements: smooth 150ms transitions on hover and active states
- Focus states: ring-2 ring-accent-orange ring-offset-2 ring-offset-bg-primary

---

## FILE STRUCTURE

```
/src
  /components
    /ui           (Button, Modal, Badge, Card, Input, Select, Table, Tabs)
    /layout       (Navbar, Sidebar, TopBar, NotificationPanel)
    /shared       (ConfirmDialog, LoadingSpinner, EmptyState, SearchBar)
  /views
    /landing      (LandingView, Hero, Features, Stats, MobilePreview, CTA)
    /auth         (LoginView, RoleSelector)
    /dashboard    (DashboardView, ShiftSummary, AlertsPanel, ActivityFeed)
    /scheduler    (SchedulerView, WeekGrid, ShiftCard, ShiftModal, SwapPanel)
    /timesheet    (TimesheetView, GuardRow, ClockModal, ExportModal)
    /tracker      (TrackerView, GuardMap, CheckpointPanel, PanicOverlay)
    /incidents    (IncidentsView, IncidentCard, IncidentModal, DARModal)
    /chat         (ChatView, ConversationList, MessageThread, BroadcastModal)
    /calls        (CallsView, DialPanel, CallModal, VoicemailList, SMSLog)
    /sites        (SitesView, SiteCard, SiteModal, PostOrdersModal)
    /users        (UsersView, UserCard, UserModal, PermissionsPanel)
    /reports      (ReportsView, ActivityChart, IncidentChart, ComplianceChart)
  /data
    guards.ts     (guard profiles, extensions, status)
    sites.ts      (sites, geofence coords, post orders, checkpoints)
    shifts.ts     (initial shift schedule for current week)
    incidents.ts  (sample incidents)
    messages.ts   (sample conversations)
    calls.ts      (sample call history and voicemails)
  /hooks
    useNotifications.ts
    useTimer.ts
    useClock.ts
    useShifts.ts
  /context
    AppContext.tsx  (global state: current user, active alerts, notifications)
  /types
    index.ts       (all TypeScript interfaces and types)
  App.tsx
  main.tsx
  index.css
```

---

## DATA MODELS (types/index.ts)

Define these TypeScript interfaces — all other data must conform to them:

```typescript
// User roles
type UserRole = 'admin' | 'dispatcher' | 'supervisor' | 'guard';

// Guard / User
interface Guard {
  id: number;
  name: string;
  role: UserRole;
  phone: string;
  extension: number;        // VoIP extension e.g. 101
  site: string;             // assigned site name
  status: 'active' | 'on-patrol' | 'on-break' | 'late' | 'missing' | 'scheduled' | 'off-duty';
  lat: number;
  lng: number;
  clockIn?: string;         // "08:02"
  clockOut?: string;
  panicActive: boolean;
  lastActivity: Date;
  history: [number, number][];   // GPS trail
  assignedPath: [number, number][];
  avatar?: string;          // initials fallback
}

// Site
interface Site {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  geofenceRadius: number;   // meters
  status: 'active' | 'upcoming' | 'alert' | 'inactive';
  postOrders: string;
  checkpoints: Checkpoint[];
  assignedGuards: number[]; // guard IDs
}

// Checkpoint
interface Checkpoint {
  id: number;
  siteId: number;
  name: string;
  lat: number;
  lng: number;
  requiredIntervalMinutes: number;
  lastScanned?: Date;
  scannedBy?: number;       // guard ID
  status: 'completed' | 'pending' | 'overdue' | 'missed';
}

// Shift
interface Shift {
  id: number;
  guardId: number;
  siteId: number;
  date: string;             // "2025-04-28"
  startTime: string;        // "08:00"
  endTime: string;          // "16:00"
  role: string;
  status: 'scheduled' | 'confirmed' | 'active' | 'late' | 'missed' | 'completed';
  confirmedAt?: Date;
  tasks: ShiftTask[];
  swapRequest?: SwapRequest;
}

// Shift Task
interface ShiftTask {
  id: number;
  text: string;
  completed: boolean;
  completedAt?: Date;
}

// Swap Request
interface SwapRequest {
  id: number;
  shiftId: number;
  requestedById: number;
  requestedGuardId: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// Time-Off Request
interface TimeOffRequest {
  id: number;
  guardId: number;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

// Incident
interface Incident {
  id: number;
  title: string;
  description: string;
  guardId: number;
  siteId: number;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'in-review' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  hasPhoto: boolean;
  photoPlaceholder?: string;
  gpsLat?: number;
  gpsLng?: number;
  linkedPanic: boolean;
}

// Message
interface Message {
  id: number;
  fromId: number | 'dispatcher';
  toId: number | 'broadcast';
  text: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'incident-ref';
  incidentId?: number;
}

// Call Log
interface CallLog {
  id: number;
  guardId: number;
  extension: number;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;        // seconds
  outcome: 'answered' | 'missed' | 'voicemail';
  notes?: string;
  isActive: boolean;
}

// Voicemail
interface Voicemail {
  id: number;
  fromGuardId: number;
  toDispatcher: boolean;
  duration: number;
  receivedAt: Date;
  transcription: string;
  played: boolean;
}

// Notification
interface AppNotification {
  id: number;
  type: 'panic' | 'checkpoint-missed' | 'shift-unconfirmed' | 'geofence-breach' |
        'overtime' | 'new-incident' | 'time-off-request' | 'swap-request' | 'late';
  message: string;
  guardId?: number;
  siteId?: number;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
}

// DAR (Daily Activity Report)
interface DailyActivityReport {
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
```

---

## MOCK DATA REQUIREMENTS

Populate the following in /src/data/:

**Guards (7 total):**
- 3 active/on-patrol right now
- 1 late to shift
- 1 missing (no check-in)
- 2 scheduled for later today
- Each has a unique extension (101–107), phone, assigned site, GPS coords near Cairo
  (lat ~30.04–30.07, lng ~31.20–31.26), realistic history trail array

**Sites (5 total):**
- 2 active with guards on site
- 1 upcoming (no guards yet)
- 1 on alert (missing guard)
- 1 with an open emergency incident
- Each site has 3–4 checkpoints with varied statuses
- Each has full post orders text (3–4 paragraphs of realistic security instructions)

**Shifts (current week Mon–Sun):**
- At least 15 shifts spread across all guards and sites
- Varied statuses: some confirmed, some unconfirmed, some completed
- At least 1 guard with overtime (>40h weekly total)
- At least 2 pending swap requests
- At least 1 pending time-off request

**Incidents (6 total):**
- 1 emergency (panic-linked)
- 2 high severity
- 2 medium
- 1 low/resolved
- Mix of open, in-review, resolved statuses

**Messages:**
- Each guard has at least 3 messages in their conversation thread
- Mix of dispatcher-to-guard and guard-to-dispatcher
- At least 2 unread conversations

**Calls:**
- 8 entries in call history (mix of answered, missed, voicemail)
- 3 voicemail entries with realistic transcriptions

---

## VIEW 1 — LANDING PAGE

The landing page is the first thing a visitor sees before logging in.
It must be visually stunning and communicate the product clearly.

### Section 1: Hero
Full-viewport height. Dark background with subtle animated grid or dot pattern.
Large headline: "One Platform. Total Command." (use Syne font, very large, bold)
Sub-headline: "Schedule shifts, track guards in real time, and manage all
communications — without switching between three different tools."
Two CTA buttons: "Launch Live Demo" (primary, orange) and "See How It Works" (ghost)
Below the text: an animated dashboard preview — a live miniature version of the
actual dashboard rendered inside a browser-frame mockup that auto-cycles through
3 panels every 4 seconds (shifts panel, map panel, incidents panel)

### Section 2: Problem Statement
Three columns, each with an icon and short text describing the pain:
- "Scheduling in one app"
- "Tracking in another"
- "Calling in a third"
Arrow flow graphic between them leading to "One tool that does it all."

### Section 3: Feature Showcase
Three large feature blocks alternating left/right layout:
1. "Real-Time Guard Tracking" — animated map with moving guard dots
2. "Smart Scheduling" — animated weekly schedule grid with shift cards appearing
3. "Integrated Command Calling" — mock phone interface with call log

### Section 4: Stats Bar
Full-width dark band with 4 animated counters:
- "12,000+ Shifts Managed"
- "99.8% Uptime"
- "3 Tools Replaced by 1"
- "< 2 Min Average Response Time"
Numbers count up when section enters viewport.

### Section 5: Mobile Preview
Show two phone mockups side by side (the guard mobile app companion).
Left phone: Clock-in screen. Right phone: Patrol checkpoint screen.
Slide in from sides on scroll.

### Section 6: Pricing / CTA
Clean section with headline "Ready to unify your operations?"
One big CTA button: "Start Live Demo"

### Section 7: Footer
Logo, tagline, navigation links, copyright.

---

## VIEW 2 — LOGIN

Clean centered card on dark background.
"Welcome back, Commander" headline.
Email + Password fields (accept any input for demo).
Role selector pills below: Admin | Dispatcher | Supervisor (each has different
dashboard access when selected — for demo, all go to same dashboard but show
different names and permission badges in the UI).
"Remember me" toggle.
Quick Login buttons for 3 demo roles.
After login: smooth page transition to dashboard.
Store selected role and user name in AppContext.

---

## VIEW 3 — DASHBOARD

This is the main overview screen after login.

### Top Bar (persistent across all tabs)
Left: ASAP Dispatch logo + "Command Center" label
Center: Current date + time (live, updating every second)
Right: Notification bell with unread count badge + User avatar + role badge + Logout

### Navigation
Horizontal scrollable tab bar below top bar.
Tabs: Dashboard | Scheduler | Timesheet | Tracker | Incidents | Chat | Calls |
      Sites | Users | Reports
Each tab has an icon and label. Active tab has orange bottom border + slight glow.

### Dashboard Layout (3-column grid on desktop, stacked on mobile)

**Column 1 — Today's Operations**
- Summary cards: Active Guards, On Patrol, Late/Missing, Open Incidents
  Each card has a number, trend arrow, and colored border-left
- "Active Right Now" list: each active guard with name, site, status badge,
  time on shift, and a "Contact" quick button

**Column 2 — Live Map Preview**
- Miniature Leaflet map showing all guard positions
- Color-coded pins (green=active, yellow=late, red=missing)
- Clicking the map expands to full Tracker view

**Column 3 — Alert Feed**
- Real-time activity feed of all events (newest at top):
  - Panic alerts (red)
  - Missed checkpoints (yellow)
  - New incidents (orange)
  - Clock-ins/outs (green)
  - Messages (blue)
- Each entry has: icon, text, timestamp, guard name
- New entries animate in from top with slide-down + fade

**Bottom Row — Shift Timeline**
A horizontal timeline showing all today's shifts as colored bars across the day
(00:00 to 23:59). Guards listed on Y axis. Current time marked with a vertical line.
Hovering a shift bar shows a tooltip with guard name, site, and status.

---

## VIEW 4 — SCHEDULER

### Layout
Left panel (70%): Weekly calendar grid
Right panel (30%): Pending Swaps + Time-Off Requests

### Weekly Calendar Grid
- 7 columns (Mon–Sun), rows = 24 hours (or condensed to shift hours only)
- Toggle between "Week View" and "Day View"
- Current day column is slightly highlighted
- Each shift appears as a colored card in the appropriate column and time slot
- Shift card shows: guard name (avatar initials + name), site, time range, status badge
- Color coding by status:
  - Confirmed: blue-tinted card
  - Scheduled: default card
  - Active: green pulsing border
  - Late: yellow card
  - Missed: red card
  - Completed: muted/dimmed

### Add Shift Modal
Trigger: "＋ Add Shift" button (top right, orange)
Fields:
- Guard (searchable dropdown showing all guards with avatars)
- Site (dropdown)
- Date (date picker — use HTML date input)
- Start Time / End Time (time pickers)
- Role (text input with suggestions: Guard, Supervisor, Lead Guard)
- Status (defaults to Scheduled)
- Task Templates (multi-select chips: "Check south gate", "Verify perimeter",
  "Log visitor entries", "Check all emergency exits", "Radio check each hour")
On submit: shift card appears in grid immediately with a brief scale-in animation.
Validate: no overlapping shifts for same guard, end time after start time.

### Edit Shift Modal
Identical to Add Shift modal but pre-filled. Opened by clicking the edit (pencil) icon
on any shift card.

### Delete Shift
Clicking the delete (trash) icon on a shift card shows a ConfirmDialog:
"Delete this shift for [Guard Name] on [Date]?"
On confirm: shift fades out and is removed from all views (including tracker, dashboard).

### Shift Status Dropdown
Each shift card has a small status badge that is clickable. Opens a small popover
with all 6 status options. Selecting one updates immediately with color change.

### Shift Confirmation Toggle
Each shift card shows a checkmark icon. If not confirmed, it's gray.
Dispatcher clicks it → brief spinner → badge turns green "Confirmed ✓" with timestamp.

### Shift Task Checklist Panel
Clicking "Tasks" on a shift card opens a right-side drawer:
- List of tasks with checkboxes
- Each task shows: text, checkbox, optional "completedAt" timestamp when done
- "Add Task" input field at bottom
- "Delete Task" button (trash icon) per task row
- Progress bar at top: "X/Y Tasks Complete"

### Swap Request Panel (right side)
Title: "Pending Swap Requests"
Each request card shows:
- Shift details (guard, site, date)
- Requesting guard + requested replacement guard
- Reason text
- "Approve" (green) and "Reject" (red) buttons
- On approve: shift card updates to show new guard. Disappears from panel.
- On reject: card removes from panel.

### Time-Off Requests Panel (below swaps panel)
Title: "Time-Off Requests"
Each request card shows:
- Guard name, date, reason
- "Approve" (removes guard from that day's shifts, adds "DAY OFF" placeholder)
- "Reject" (removes request from panel)

### Overtime Warnings
A warning banner at top if any guard exceeds 40h this week.
Also: red "OT" badge on affected guard's name everywhere in the scheduler.
Hovering the badge shows tooltip: "43.5h this week — 3.5h overtime"

### Summary Bar (top of scheduler)
Pill stats: "This Week: 18 Shifts | 12 Confirmed | 4 Pending | 2 Overtime Alerts | 1 Swap Request"

---

## VIEW 5 — TIMESHEET

### Layout
Full-width table + action bar at top + summary row at bottom.

### Top Action Bar
- Week navigation arrows (← Previous Week | Current Week | Next Week →)
- "Add Manual Entry" button
- "Export Timesheet" button
- Filter dropdown: All Guards | By Site | By Status

### Timesheet Table
Columns: Avatar+Name | Site | Scheduled In/Out | Actual In/Out | Hours Scheduled |
         Hours Worked | Overtime | Break Time | Status | Actions

Each row:
- Shows guard info and current shift data
- "Clock In" button: large green button if guard hasn't clocked in
  - On click: opens Geofence Verification modal (1.5 second "Verifying GPS..." spinner
    then shows "✓ Location Verified — Within 50m of Westfield Mall" or "⚠ Outside
    Geofence — 340m from site" based on preset condition per guard)
  - After geofence check: shows Photo Verification modal ("Simulating photo capture...")
    with a placeholder selfie placeholder image and timestamp overlay
  - After both checks pass: clock-in time recorded, button changes to red "Clock Out"
  - Active shift shows a live HH:MM:SS timer counting up in the "Hours Worked" cell

- "Clock Out" button: shown only when guard is clocked in
  - On click: ConfirmDialog, then records time, calculates hours worked
  - Timer stops, final duration shown in Hours Worked cell

- "Start Break" / "End Break" toggle:
  - When guard is active and not on break: green "Start Break" button
  - Clicking starts a break timer (shown in Break Time column as counting)
  - "End Break" stops the timer, adds to total break time

- Status badge: Not Started | Active (with timer) | On Break | Completed | Absent

### Manual Entry Modal
Opened by "Add Manual Entry" button.
Fields: Guard dropdown, Date, Clock In Time, Clock Out Time, Break Duration, Reason/Notes.
On submit: adds/updates the row for that guard on that date.

### Geofence Verification Modal
As described above. Shows map pin icon, guard name, site name, distance from site.
Two outcomes: green success or yellow warning (dispatcher can override warning with
"Override & Approve" button).

### Photo Verification Modal
Shows a camera icon with "Capturing..." animation, then a gray placeholder box with
guard name, timestamp, and site overlaid. "Verified ✓" green badge.
This simulates biometric clock-in proof.

### Export Modal
Opened by "Export Timesheet" button.
Shows a formatted table of all timesheet data for the selected week.
Header: "ASAP Dispatch — Timesheet Export — Week of [date]"
Each row: guard name, site, scheduled hours, actual hours, overtime, status.
Total row at bottom.
"Copy to Clipboard" button and "Print View" button.

### Weekly Summary Bar (bottom)
Full-width bar showing totals:
"Total Scheduled: 112h | Total Worked: 108.5h | Total Overtime: 6.5h |
 Total Break Time: 14h | Present: 6/7 | Absent: 1"

---

## VIEW 6 — TRACKER (LIVE MAP)

### Layout
Full-height split: map (left, ~65%) + control panel (right, ~35%)

### Map (Leaflet)
Dark tile layer (use CartoDB dark_matter tiles).
Show all guards as custom markers:
- Green circle with initials: active/on-patrol
- Yellow circle: late
- Red pulsing circle: missing or panic active
- Gray circle: scheduled (not yet clocked in)

Clicking a guard marker opens a popup showing:
- Guard photo placeholder (initials avatar)
- Name, site, status badge, clock-in time
- "View Patrol History" button → draws polyline on map showing guard's historical path
- "🚨 PANIC" button (red, outlined) → triggers Panic Overlay
- "Contact" button → opens Chat view focused on this guard

Show site geofence zones as semi-transparent circles (color coded by site status).
Show checkpoint markers as small numbered squares in a different color.

Map controls (top-right of map):
- Toggle: Show/Hide Geofences
- Toggle: Show/Hide Checkpoints
- Toggle: Show/Hide Guard Trails
- "Fit All" button to re-center map

### Checkpoint Panel (right side — top half)
Title: "Checkpoint Status"
Site filter tabs at top.
Each checkpoint listed:
- Name, required interval, last scanned time, scanned by (guard name)
- Status badge: Completed (green) | Pending (yellow) | Overdue (orange) | Missed (red)
- "Simulate Scan" button → brief "Scanning..." spinner → updates timestamp to now,
  sets status to Completed (green), logs event to activity feed
- Missed checkpoints show a pulsing red border

If any checkpoint is "Missed": show a red alert banner at top of tracker:
"⚠ Missed Checkpoint: [Checkpoint Name] at [Site] — [X minutes] overdue"

### Guard Activity Panel (right side — bottom half)
Title: "Live Guard Status"
Each guard listed with:
- Name, site, status badge
- "Last Activity" — live timer counting up from their last action
- If timer exceeds 30 minutes: yellow "No movement detected" warning
- "Simulate Inactivity" button (for demo purposes) to trigger the warning
- "Welfare Check" button on warned guards → sends a simulated message and logs event

### Geofence Breach Simulation
Each guard in the list has a "Simulate Zone Exit" button.
Clicking it triggers: orange banner at top "⚠ Geofence Breach: [Guard Name]
has left [Site Name] perimeter" and adds a notification.

### Panic Overlay
Triggered by the 🚨 PANIC button on any guard marker.
Full-screen overlay (z-index highest) with:
- Bright red background with subtle noise texture
- "🚨 PANIC ALERT" headline pulsing
- Guard name, site, GPS coordinates, exact time
- Live timer: "Alert active for: 00:02:34"
- "DISPATCH BACKUP" button: shows a modal to select nearest available guard,
  then draws a route arrow on the map from that guard to the panic site
- "CALL GUARD" button: opens Call Modal (same as Calls tab)
- "RESOLVE ALERT" button: ConfirmDialog, then closes overlay, updates guard
  status, creates a linked resolved incident in Incidents tab, clears the
  pulsing red badge from the top navigation bar

Panic state also shows:
- Pulsing red badge on the top nav bell icon
- Red banner at top of all views while active

---

## VIEW 7 — INCIDENTS

### Layout
Filter bar at top + incident list + right-side DAR panel

### Filter Bar
Filter by: Severity (All | Low | Medium | High | Emergency) |
           Status (All | Open | In Review | Resolved) |
           Site dropdown | Guard dropdown
Search input: search by title or description.
Sort by: Newest | Oldest | Severity

### Incident List
Emergency incidents always pinned at top with pulsing red border.
Each incident card shows:
- Severity badge (color coded), status badge, incident title
- Guard name + site + timestamp
- Description preview (2 lines, expandable)
- Action buttons: Edit (pencil) | Delete (trash) | Change Status arrows | Evidence button

### New Incident Modal
Trigger: "＋ New Incident" button (top right, orange)
Fields:
- Title (text input)
- Guard (dropdown)
- Site (dropdown)
- Severity (4 pill options: Low/Medium/High/Emergency)
- Description (multiline textarea)
- "Attach Photo" button: shows a file-picker placeholder that simulates upload,
  displays a thumbnail placeholder with "Photo attached ✓"
- "Capture GPS" button: shows "Capturing location..." spinner then displays
  simulated coordinates (lat/lng from the selected guard's current position)
On submit: new card appears at top of list with slide-down animation.
Emergency incidents trigger a notification automatically.

### Edit Incident Modal
Pre-filled version of the same modal.

### Delete Incident
ConfirmDialog. On confirm: card fades out. Removes from all views.

### Change Status
Each incident has status flow: Open → In Review → Resolved
Two arrow buttons (→ next status, ← previous status) plus a direct status dropdown.
Status changes update the badge color immediately.

### Evidence Modal
Opened by "Evidence" button on any incident card.
Shows:
- "📸 Photo Evidence" section: placeholder image with timestamp overlay
- "📍 GPS Location" section: small map with pin at incident location
- Incident ID, created at, guard name
- "Download Evidence Package" button (shows a toast: "Download simulated")

### DAR (Daily Activity Report) Panel
Collapsible panel on the right side.
Guard selector dropdown + Date picker.
"Generate DAR" button.
Output shows formatted report:
```
DAILY ACTIVITY REPORT
Guard: Marcus Johnson | Site: Westfield Mall | Date: Apr 28, 2025

Clock In: 08:02  |  Clock Out: 16:08  |  Hours Worked: 8.1h
Checkpoints Completed: 4/4  |  Response Time Avg: 3 min

INCIDENTS FILED:
1. [09:14] Medium — Unauthorized person in parking garage — Open
2. [14:32] Low — Broken fence panel on west side — Resolved

PATROL NOTES:
[editable textarea]

Generated by ASAP Dispatch on Apr 28, 2025 at 16:30
```
"Copy Report" button (copies formatted text to clipboard with toast feedback).

---

## VIEW 8 — CHAT

### Layout
Left sidebar (guard list) + Right area (message thread)

### Guard List (left sidebar)
Search input at top.
Each guard listed with:
- Avatar (colored initials circle)
- Name and last message preview
- Unread count badge (if unread messages)
- Online/offline indicator dot
- Time of last message
Clicking a guard opens their conversation thread on the right.

"New Broadcast" button at top of sidebar.

### Message Thread (right area)
Header: guard avatar + name + site + status badge + "Call" button + "View Profile" button
Messages displayed in chat bubble format:
- Dispatcher messages: right-aligned, orange tint
- Guard messages: left-aligned, dark card
- Each message shows: text, timestamp, read indicator (✓ = sent, ✓✓ = read)
  Read status simulates: after 2 seconds of message being visible, marks as read.

Message input area (bottom):
- Text input field with placeholder "Message [guard name]..."
- "Attach Incident" button: dropdown of open incidents to reference
  (shows incident title + severity chip inline in the message)
- Send button (arrow icon, orange)
- Hitting Enter also sends

Quick Commands panel (toggleable, appears above input):
Pre-set message templates (click to auto-fill input):
- "Please check in immediately."
- "Proceed to the main entrance."
- "Patrol report needed — please submit incident."
- "All clear — you may stand down."
- "Backup is en route to your location."
- "Contact dispatcher immediately."
- "Geofence breach detected — please confirm location."

### Broadcast Message Modal
Trigger: "New Broadcast" button in sidebar.
Guard multi-select checkboxes (select all / deselect all toggle).
Message textarea.
"Send to X Guards" button.
On send: message appears in all selected guard conversations tagged as "[BROADCAST]".

### Unread badge logic
When a new message arrives in a conversation (simulate incoming messages every
30 seconds for demo purposes — alternate between 2–3 guards), the unread badge
increments. Opening the conversation clears it.

---

## VIEW 9 — CALLS

### Layout
3-column: Dial Panel (left) | Call Log (center) | Voicemail/SMS (right)

### Dial Panel (left)
Title: "VoIP Command Center"
Guard directory: all guards listed with name, extension (Ext. 101), site, status badge.
"Call" button per guard (green phone icon).

Clicking "Call" opens the Call Modal:
- Animated "Ringing..." pulse effect
- Guard name, extension, site, avatar
- After 1.5 seconds: transitions to "Connected" state (green glow, call timer starts)
- Action buttons: Mute (toggle icon), Hold (toggle, changes button color), End Call (red)
- End Call: ConfirmDialog → saves to call log → shows call summary toast:
  "Call with Marcus Johnson — 2m 14s — Ended"

"Call All Active Guards" button (orange, top of dial panel):
Shows a modal with all active guards listed.
Each guard row shows "Calling..." → auto-resolves to "Answered ✓" or "No Answer ✗"
after a random 1–3 second delay (preset outcomes per guard).

### Call Log (center)
Title: "Call History"
Table: Guard | Extension | Time | Duration | Outcome badge | Notes (editable inline) | Actions
Outcome badges: Answered (green) | Missed (yellow) | Voicemail (blue)
"Delete" button per row (with confirmation).
Filter: All | Answered | Missed | Voicemail

### Voicemail Tab (right — top)
Title: "Voicemails"
Each voicemail entry:
- Caller (guard name + extension), time received, duration
- "▶ Play" button: shows an animated waveform (CSS animation, 3 bars growing/shrinking)
  for the duration of the voicemail then stops. Button changes to "▶ Replay".
- "Transcription" toggle: reveals realistic transcribed text
  Example: "Hey dispatch, this is Aisha from Harbor Office. Uh, I wanted to let you know
  the south gate lock is definitely broken. I've documented it. Gonna need maintenance
  out here. Let me know if you need the incident report. Thanks."
- "Mark Read" / "Delete" buttons
Unread voicemails have a blue left border.

### SMS Log Tab (right — bottom, below voicemail)
Title: "SMS Log"
All text messages from Chat view displayed here, grouped by guard, with timestamps.
This is read-only (acts as a log/record).
Filter by guard dropdown.

---

## VIEW 10 — SITES

### Layout
Cards grid + right panel for selected site detail.

### Site Cards Grid
Each site card shows:
- Site name (large), address (small below)
- Status badge (Active | Upcoming | Alert | Inactive)
- Stats row: [X] Active Guards | [X] Open Incidents | Last Patrol: [time]
- Geofence status indicator
- Action buttons: "View Details" | "Edit" | "Delete"

"＋ Add Site" button (top right, orange).

### Add/Edit Site Modal
Fields:
- Site Name (text input)
- Address (text input)
- Geofence Radius in meters (number input with slider)
- Latitude / Longitude (number inputs, auto-fill with realistic Cairo-area coords)
- Assign Guards (multi-select dropdown)
- Post Orders (large textarea — multi-paragraph security instructions)
- Status dropdown
On submit: new card appears in grid. On edit: card updates in place.

### Post Orders Modal
Trigger: "View Post Orders" button on any site card.
Full-screen modal with large readable text area.
Shows the full post orders content in formatted paragraphs.
"Edit Post Orders" toggle: makes the text area editable.
"Save Changes" button (updates in state).
Print-friendly format.

### Site Detail Panel (right side when a site is selected)
Show:
- Full address + geofence radius
- Assigned guards list (with their current status badges)
- Today's checkpoint completion rate (progress bar)
- Open incidents for this site
- "Generate Site Report" button → modal showing site activity summary for the week

### Delete Site
ConfirmDialog: "Deleting this site will unassign [X] guards and archive [X] shifts.
Proceed?" On confirm: site removed from all views.

---

## VIEW 11 — USERS

### Layout
User cards grid + filters + role management panel

### Filter Bar
Search input | Filter by Role | Filter by Site | Filter by Status

### User Cards
Each card shows:
- Large avatar (colored initials circle with role-based background color)
- Name, role badge, extension number
- Assigned site
- Current status badge
- Today's shift info (or "No shift today")
- Action buttons: Edit | Delete | Assign to Site | View Activity

### Add/Edit User Modal
Fields:
- Full Name
- Role dropdown (Dispatcher | Guard | Supervisor | Admin)
- Phone number
- Assigned Site (dropdown)
- VoIP Extension (number input, auto-suggest next available)
- Shift Template (dropdown: Morning / Afternoon / Night / Rotating / Custom)
- Status (dropdown)
On add: card appears in grid, guard also appears in all dropdowns across the system.

### Delete User
ConfirmDialog: "Deleting [Name] will remove them from all future shifts.
Past records will be preserved." On confirm: guard removed from all active views,
shifts unassigned and show "[Guard Removed]" placeholder.

### Permissions Panel
Toggle panel showing permissions matrix per role:
Each role (Dispatcher, Guard, Supervisor, Admin) has a row.
Columns: View Map | Add Incidents | Edit Shifts | Approve Swaps | Manage Users |
         Access Reports | Clock In/Out | Use Chat | View Calls
Green check / red X per cell.
This is display-only (not functional for demo) but must be visually clear.

---

## VIEW 12 — REPORTS

### Layout
4 chart panels in a 2x2 grid + export button

### Chart 1: Weekly Guard Activity (Bar Chart)
Guard names on X axis, hours worked on Y axis.
Each bar color-coded: blue = scheduled hours, orange = actual hours.
Bars with overtime show a red stripe at the top.
Title: "Guard Hours — Current Week"
Use Recharts BarChart.

### Chart 2: Incidents by Severity (Donut Chart)
Color-coded segments: Low (blue) | Medium (yellow) | High (orange) | Emergency (red).
Center label: total incident count.
Legend below.
Use Recharts PieChart.

### Chart 3: Checkpoint Compliance Rate (Horizontal Bar)
One bar per site.
Shows % of checkpoints completed on time in last 7 days.
Color: green if >90%, yellow if 70-90%, red if <70%.
Title: "Checkpoint Compliance — Last 7 Days"

### Chart 4: Incident Trend (Line Chart)
Last 7 days on X axis, incident count on Y axis.
Two lines: total incidents (orange) + emergency incidents (red).
Use Recharts LineChart.

### Highlight Panel (below charts)
"This Week's Alerts" — 4 stat cards:
- Late/Missing Guards: number with red badge
- Overtime Guards: number with orange badge
- Missed Checkpoints: number with yellow badge
- Unresolved Incidents: number with red badge

### Export Report Modal
Trigger: "Export Full Report" button (top right).
Shows all data in a formatted printable layout.
"Print" and "Copy" buttons.

---

## NOTIFICATIONS SYSTEM

A useNotifications hook manages all notifications in global state.

**Auto-generated notifications (on these events):**
1. Panic alert triggered → type: 'panic', red, urgent
2. Guard misses a checkpoint → type: 'checkpoint-missed', orange
3. Shift not confirmed 1h before start → type: 'shift-unconfirmed', yellow
4. Guard leaves geofence → type: 'geofence-breach', orange
5. Guard exceeds 40h weekly → type: 'overtime', yellow
6. New incident created → type: 'new-incident', blue
7. Time-off request submitted → type: 'time-off-request', blue
8. Swap request submitted → type: 'swap-request', blue
9. Guard marked as late → type: 'late', yellow

**Notification Bell (top nav):**
Shows unread count badge (red).
Clicking opens a dropdown panel (right-aligned, width ~380px):
- Header: "Notifications" + "Mark All Read" + "Clear All" buttons
- Sorted newest first
- Each entry: type icon + message text + timestamp (relative: "2 min ago")
  + "Dismiss" button (×)
- Color-coded left border by type
- Unread entries have slightly brighter background
- Clicking a notification navigates to the relevant view/tab

---

## GLOBAL STATE (AppContext)

Store in React Context:
- currentUser: { name, role, extension }
- guards: Guard[] — the single source of truth for all guard data
- sites: Site[] — single source for all site data
- shifts: Shift[] — all shifts
- incidents: Incident[] — all incidents
- messages: Message[] — all messages
- calls: CallLog[] — all call records
- voicemails: Voicemail[]
- notifications: AppNotification[]
- panicActive: boolean + panicGuardId: number | null
- swapRequests: SwapRequest[]
- timeOffRequests: TimeOffRequest[]

All views READ from and WRITE to this context.
When a guard is deleted, their shifts become unassigned.
When a site is deleted, its incidents are archived.
When a shift is deleted, it disappears from scheduler, tracker, and dashboard.

---

## INTERACTION & ANIMATION RULES

Every user action must have feedback:

1. **Button clicks:** brief scale(0.97) press effect (CSS or Framer)
2. **Adding items:** new card/row slides down + fades in (Framer: initial opacity 0,
   y: -10 → opacity 1, y: 0, duration: 0.25)
3. **Deleting items:** item fades out + collapses height (Framer: opacity 0, height 0,
   duration: 0.2) before removal from state
4. **Modal open:** backdrop fades in, modal slides up (y: 20 → y: 0)
5. **Modal close:** reverse — modal slides down, backdrop fades
6. **Status changes:** badge color transitions with a brief flash (Framer animate
   backgroundColor)
7. **Error states:** red shake animation (3 quick horizontal translations)
8. **Success toasts:** slide in from top-right, auto-dismiss after 3 seconds
9. **Loading states:** subtle pulse animation on skeleton placeholders
10. **Tab switching:** content fades in on tab change
11. **Map marker updates:** markers use CSS transition for position changes
12. **Panic alert:** pulsing ring animation on the badge and overlay

---

## RESPONSIVE DESIGN

All views must work on screens 768px and wider.
Below 768px (tablet/mobile):
- Tab bar becomes horizontally scrollable
- 3-column grids become 1-column
- Side panels collapse to drawer (slide in from right)
- Map takes full width, control panel becomes a bottom sheet
- Tables become card lists

---

## FINAL BUILD INSTRUCTIONS

1. Start by setting up the project structure as defined in the FILE STRUCTURE section.
2. Create all TypeScript interfaces in /types/index.ts first.
3. Create all mock data in /data/ files.
4. Build the AppContext with all state and updater functions.
5. Build all reusable UI components in /components/ui/ first.
6. Build the landing page.
7. Build the login view.
8. Build each tab view, starting with Dashboard, then proceeding in order.
9. Wire all navigation through AppContext view state.
10. Add the notifications system last, after all events are in place.

Output all files completely. Do not truncate any file. Every component, every view,
every piece of logic must be present and functional in the output.
