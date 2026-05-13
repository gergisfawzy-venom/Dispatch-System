# ASAP Dispatch — Build Roadmap

## What You Are Building

ASAP Dispatch is a B2B SaaS security operations platform. It replaces the multi-app, spreadsheet-heavy workflow that most security companies use with one unified system.

The product has two surfaces:
- **Web App** — used by admins, dispatchers, and supervisors (already built as a visual demo in React + Vite)
- **Mobile App** — used by guards in the field and clients monitoring their sites (not yet built)

Your job is to make the web demo functional by connecting it to a real backend, and to build the mobile app from scratch so that a guard can install it on their phone, clock in, patrol a site, and be tracked live on the web dispatcher dashboard.

---

## Your Role

You are the lead developer on this project. You own the full stack — web, mobile, database, and realtime. You work task by task. Each task is self-contained and independently executable. You do not need to complete one phase before picking up a task from another.

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Web frontend | React + Vite | Already exists as a demo |
| Web hosting | Vercel | Auto-deploys on GitHub push |
| Database | Supabase | Postgres + Auth + Realtime + Storage |
| Mobile app | Expo (React Native) | Guard app + Client app, same codebase |
| VoIP | Agora.io | Free tier: 10,000 min/month |
| Maps (web) | Leaflet + OpenStreetMap | Already integrated in demo |
| Maps (mobile) | Google Maps SDK | Free tier |
| Push notifications | Expo Push Notifications | Free |
| Version control | GitHub | — |
| CI/CD | Vercel auto-deploy | — |

Do not introduce any tools outside this list without confirmation.

---

## User Roles

| Role | Surface | What they do |
|---|---|---|
| Admin | Web | Full access. Manages company, users, billing, all data |
| Dispatcher | Web | Runs active operations. Tracks guards, handles incidents, chat, calls. Clocks in/out of dispatch shifts |
| Supervisor | Web | Reviews guard performance, approves timesheets and incidents |
| Guard | Mobile | Field worker. Clocks in/out, patrols checkpoints, submits incidents, receives calls |
| Client | Mobile | Monitors their site live. Requests shift extensions and extra guards |

---

## Architecture Decisions

**Database:** Supabase is the single source of truth for all data.

**Realtime:** Supabase Realtime (WebSockets) handles all live updates — guard positions, panic alerts, notifications, chat. Do not add a separate socket server.

**GPS updates:** Guard location is written to the database every 60 seconds maximum. Before every write, compare the new coordinates to the last saved position. If the guard has moved less than 10 meters, skip the write entirely. This prevents unnecessary database load while keeping the map accurate.

**Multi-tenancy:** Every table includes a `company_id` column. Row Level Security (RLS) on every table ensures users only ever see their own company's data.

**Mobile testing:** During development, the app runs on a real device via Expo Go. No App Store submission is needed to test.

**Email notifications:** Not included in this build. Push notifications handle all real-time alerts.

**Billing:** Not included in this build. Implement after the first paying client is acquired.

---

## The Goal

The build is complete when the following is true:

A developer installs the guard app on their phone via Expo Go, logs in as a guard, and walks around. Their location dot moves in real time on the web dispatcher dashboard. They press the panic button — the alert fires on the web dashboard within 3 seconds. They clock in — their shift goes active on the web. They scan a checkpoint — the marker updates on the map.

Everything in this plan builds toward that outcome.

---

## Build Order

```
Phase 0 — Foundation       (do this first, everything depends on it)
Phase 2 — Mobile App       (build this before wiring the web)
Phase 1 — Web Backend      (connect the existing demo to real data)
Phase 3 — Advanced         (build after the core is working)
```

Phase numbering matches task IDs. Build order is 0 → 2 → 1 → 3.

---

---

# PHASE 0 — Foundation

---

### TASK 0.1 — Supabase Project Setup

**What:** Create the Supabase project and connect it to the web app.

**Steps:**
1. Create a new project at supabase.com
2. Enable the Email auth provider
3. Create `.env.local` in the web app root with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Add the same two variables to the Vercel project dashboard
5. Run `npm install @supabase/supabase-js` in the web app
6. Create `src/lib/supabase.ts` — export a single Supabase client instance

**Done when:** `supabase.auth.getSession()` returns a valid response from the running web app with no errors.

---

### TASK 0.2 — Database Schema

**What:** Create all tables in Supabase that will replace the mock data in the web demo.

Run the following in the Supabase SQL editor:

```sql
-- Companies
companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  plan text DEFAULT 'trial',
  created_at timestamptz DEFAULT now()
)

-- Profiles (all user types)
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  company_id uuid REFERENCES companies,
  name text,
  role text, -- admin | dispatcher | supervisor | guard | client
  phone text,
  extension text,
  avatar_url text,
  hourly_rate numeric,
  join_date date,
  is_active boolean DEFAULT true,
  push_token text
)

-- Guards (field-specific data)
guards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles,
  company_id uuid REFERENCES companies,
  status text DEFAULT 'off-duty',
  lat numeric,
  lng numeric,
  last_lat numeric,
  last_lng numeric,
  geofence_ok boolean DEFAULT true,
  weekly_hours numeric DEFAULT 0,
  panic_active boolean DEFAULT false,
  panic_lat numeric,
  panic_lng numeric,
  last_activity timestamptz
)

-- Dispatchers (dispatch-specific data)
dispatchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles,
  company_id uuid REFERENCES companies,
  status text DEFAULT 'off-duty',
  clocked_in_at timestamptz,
  clocked_out_at timestamptz,
  weekly_hours numeric DEFAULT 0
)

-- Sites
sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  name text,
  address text,
  lat numeric,
  lng numeric,
  geofence_radius numeric DEFAULT 200,
  status text DEFAULT 'active',
  post_orders_json jsonb,
  client_name text,
  client_phone text,
  client_email text,
  min_guards_required int DEFAULT 1
)

-- Checkpoints
checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES sites,
  name text,
  lat numeric,
  lng numeric,
  required_interval_minutes int DEFAULT 60,
  status text DEFAULT 'pending',
  last_scanned_at timestamptz,
  last_scanned_by uuid REFERENCES profiles
)

-- Shifts (guards AND dispatchers)
shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  assignee_id uuid REFERENCES profiles,
  assignee_role text, -- guard | dispatcher
  site_id uuid REFERENCES sites,
  date date,
  start_time time,
  end_time time,
  actual_clock_in timestamptz,
  actual_clock_out timestamptz,
  role text,
  status text DEFAULT 'scheduled',
  published_at timestamptz,
  confirmed_at timestamptz
)

-- Shift Templates (recurring shifts)
shift_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  assignee_id uuid REFERENCES profiles,
  assignee_role text,
  site_id uuid REFERENCES sites,
  start_time time,
  end_time time,
  role text,
  days_of_week int[], -- 0=Sun through 6=Sat
  effective_from date,
  effective_until date
)

-- Shift Tasks
shift_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid REFERENCES shifts,
  text text,
  completed boolean DEFAULT false,
  completed_at timestamptz
)

-- Incidents
incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  guard_id uuid REFERENCES profiles,
  site_id uuid REFERENCES sites,
  incident_number text UNIQUE,
  title text,
  description text,
  category text,
  severity text, -- low | medium | high | emergency
  status text DEFAULT 'open',
  photo_url text,
  gps_lat numeric,
  gps_lng numeric,
  linked_panic boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles
)

-- Incident Log (timeline entries per incident)
incident_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES incidents,
  author_id uuid REFERENCES profiles,
  text text,
  created_at timestamptz DEFAULT now()
)

-- Messages
messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  from_id uuid REFERENCES profiles,
  to_id uuid REFERENCES profiles,
  channel_id uuid,
  text text,
  attachment_url text,
  type text DEFAULT 'direct',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Channels (group chats)
channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  name text,
  site_id uuid REFERENCES sites,
  type text -- direct | site | broadcast
)

-- Calls
calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  guard_id uuid REFERENCES profiles,
  extension text,
  started_at timestamptz,
  ended_at timestamptz,
  duration int,
  outcome text,
  notes text,
  recording_url text
)

-- Voicemails
voicemails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  from_guard_id uuid REFERENCES profiles,
  transcription text,
  duration int,
  received_at timestamptz DEFAULT now(),
  played boolean DEFAULT false
)

-- Certifications
certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id uuid REFERENCES profiles,
  type text,
  number text,
  issued_at date,
  expires_at date,
  document_url text
)

-- Notifications
notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  user_id uuid REFERENCES profiles,
  type text,
  message text,
  guard_id uuid REFERENCES profiles,
  site_id uuid REFERENCES sites,
  navigate_to text,
  read boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
)

-- Swap Requests
swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid REFERENCES shifts,
  requested_by uuid REFERENCES profiles,
  requested_guard_id uuid REFERENCES profiles,
  reason text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
)

-- Time Off Requests
time_off_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id uuid REFERENCES profiles,
  date date,
  reason text,
  status text DEFAULT 'pending',
  submitted_at timestamptz DEFAULT now()
)

-- Guard Location History
location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_id uuid REFERENCES profiles,
  lat numeric,
  lng numeric,
  recorded_at timestamptz DEFAULT now()
)

-- Dispatcher Clock Records
dispatcher_clock_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatcher_id uuid REFERENCES profiles,
  company_id uuid REFERENCES companies,
  shift_id uuid REFERENCES shifts,
  clocked_in_at timestamptz,
  clocked_out_at timestamptz,
  notes text
)

-- Audit Log
audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies,
  actor_id uuid REFERENCES profiles,
  action text,
  entity_type text,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
)
```

**Done when:** All tables exist in Supabase with no errors.

---

### TASK 0.3 — Row Level Security (RLS)

**What:** Lock every table so users only see their own company's data.

**Rules to apply to every table:**
- Enable RLS on the table
- Add a SELECT policy: `company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())`
- Guards: add a policy allowing them to read/write only their own row in the `guards` table
- Admins: full read/write on all tables within their company
- Dispatchers: full read on all company data, write on shifts/incidents/messages/calls
- Supervisors: read all, write on incidents and shifts only

**Done when:** A user logged in as Company A cannot read any row belonging to Company B.

---

### TASK 0.4 — Authentication

**What:** Replace the demo quick-login buttons with real Supabase authentication.

**Steps:**
1. Update `LoginView.tsx` — connect email/password fields to `supabase.auth.signInWithPassword()`
2. Add "Forgot password?" link below the password field → calls `supabase.auth.resetPasswordForEmail()`
3. On app load, call `supabase.auth.getSession()` — if a session exists, route to dashboard without showing the login screen
4. Add a logout button in the TopBar → `supabase.auth.signOut()` then redirect to login
5. Keep the demo quick-login tiles but point them at real pre-seeded accounts (see Task 0.5)
6. After successful login, fetch the user's row from `profiles` and store it as the current user

**Done when:** Real email/password login works, the session survives a page refresh, and logout returns to the login screen.

---

### TASK 0.5 — Seed Demo Data

**What:** Populate the database with realistic data so the demo looks full on first login.

**Write a script at `scripts/seed.ts` that inserts:**
- 1 company: "ASAP Security"
- 7 profiles: admin (Reema), dispatcher (Daniel), supervisor (Samir), guards (Marcus, Diana, James), 1 client
- 5 sites, each with 3–4 checkpoints
- 2 weeks of shifts — guards and dispatchers
- 6 incidents across different severities and statuses
- 20 messages between dispatcher and guards
- 5 call log entries, 3 voicemails
- 3 dispatcher clock records
- Certifications for each guard

**Done when:** Logging in with any demo account shows a fully populated dashboard identical to what the current visual demo shows.

---

---

# PHASE 2 — Mobile App

---

### TASK 2.1 — Expo Project Setup

**What:** Create the React Native mobile app and connect it to the Supabase backend.

**Steps:**
1. Run: `npx create-expo-app asap-mobile --template blank-typescript`
2. Install dependencies:
   ```
   @supabase/supabase-js
   expo-location
   expo-camera
   expo-barcode-scanner
   expo-notifications
   expo-local-authentication
   react-native-maps
   @react-navigation/native
   @react-navigation/bottom-tabs
   @react-native-async-storage/async-storage
   agora-react-native-rtm
   ```
3. Create `.env` with the same Supabase URL and anon key as the web app, plus the Agora App ID
4. Run `npx expo start` and scan the QR code with the Expo Go app on a real device

**Done when:** The app opens on a real phone via Expo Go with no errors.

---

### TASK 2.2 — Mobile Authentication

**What:** Login screen that routes guards and clients to their respective experiences.

**Steps:**
1. Build a `LoginScreen` with a role selector at the top: Guard | Client
2. Email/password form → `supabase.auth.signInWithPassword()`
3. On success, store the session in AsyncStorage so the user stays logged in after closing the app
4. On app open, check for an existing session and route directly to the correct home screen if found
5. Add optional biometric unlock via `expo-local-authentication` as a shortcut after first login

**Done when:** Login works with real Supabase credentials. Closing and reopening the app keeps the user logged in.

---

### TASK 2.3 — Guard Home Screen

**What:** The main screen a guard sees when they are on or about to start a shift.

**UI elements to build:**
- Active shift card showing: site name, scheduled start time, elapsed timer
- Clock In button (large, prominent) — disabled until within 30 minutes of shift start
- Clock Out button — replaces Clock In once the guard has clocked in
- Next checkpoint card: checkpoint name + countdown to when it must be scanned
- Scan Checkpoint button — opens the camera (Task 2.5)
- Submit Incident button — opens incident form (Task 2.7)
- PANIC button — red, full width, at the bottom of the screen
- Chat icon in the header with an unread message badge

**Done when:** Guard can see their current shift and all primary action buttons on one screen.

---

### TASK 2.4 — GPS Tracking

**What:** Guard's location streams to Supabase while on shift and appears live on the web map.

**Steps:**
1. Request foreground and background location permissions using `expo-location`
2. Start position watching when the guard clocks in. Check every 60 seconds.
3. On each position check, compare new coordinates to the last saved `last_lat` and `last_lng` on the guard's row
4. If the distance moved is less than 10 meters — do nothing. Skip the write.
5. If the distance is 10 meters or more — update `guards.lat`, `guards.lng`, `guards.last_lat`, `guards.last_lng`, `guards.last_activity` and insert one row into `location_history`
6. On every position write, check if the guard is outside the geofence radius of their active site. If yes, insert a notification of type `geofence_breach`
7. Stop all location watching when the guard clocks out

**Done when:** Guard walking with their phone → their dot moves on the web Tracker map. Standing still → no DB writes.

---

### TASK 2.5 — Checkpoint Scanning

**What:** Guard marks a checkpoint as completed. Two methods are available — QR scan and GPS proximity. Both do the same thing.

**Method 1 — QR Scan:**
1. Pressing "Scan Checkpoint" opens `expo-barcode-scanner`
2. The QR code encodes the checkpoint ID
3. Before accepting the scan, verify the guard is within 50 meters of that checkpoint's GPS coordinates
4. If within range → mark checkpoint complete
5. If out of range → show error: "You must be at the checkpoint to scan"

**Method 2 — GPS Proximity (no QR code needed):**
1. Guard presses "I'm Here" on the home screen
2. Get current GPS position
3. Find all checkpoints for the guard's active site and calculate distance to each
4. If the guard is within 50 meters of any checkpoint → mark the nearest one complete
5. If the guard is more than 50 meters from all checkpoints → show: "You're not close enough to any checkpoint"

**Both methods write:**
- `checkpoints.status = 'completed'`
- `checkpoints.last_scanned_at = now()`
- `checkpoints.last_scanned_by = guard profile id`

**After a successful scan:**
- Show a success animation on the phone
- Update the "Next checkpoint" card on the home screen
- The checkpoint marker on the web Tracker map updates color via Realtime

**Done when:** Guard can complete a checkpoint by scanning a QR code or by standing next to it and pressing "I'm Here."

---

### TASK 2.6 — Panic Button

**What:** One-press SOS that alerts all dispatchers within 3 seconds.

**Steps:**
1. The PANIC button requires a 2-second hold to activate — this prevents accidental triggers
2. On activation:
   - Get the guard's current GPS coordinates
   - Update `guards.panic_active = true`, `guards.panic_lat`, `guards.panic_lng`
   - Send an Expo push notification to all dispatcher devices immediately
3. The guard's screen switches to a "PANIC ACTIVE — Help is on the way" state with a cancel option
4. Canceling requires a 3-second hold to prevent accidental cancellation
5. On cancel → set `guards.panic_active = false`
6. On the web: the panic banner appears on the dashboard and the Tracker auto-focuses the panicking guard (handled in Task 1.3)

**Done when:** Holding panic on the phone triggers the red alert banner on the web dispatcher dashboard within 3 seconds.

---

### TASK 2.7 — Submit Incident

**What:** Guard files an incident report from the field with photo evidence and GPS location.

**Steps:**
1. Build an `IncidentFormScreen` with: title, category dropdown, description text area, severity selector
2. GPS coordinates auto-fill from the guard's current location
3. Photo: open `expo-camera`, take photo, upload to Supabase Storage bucket `incident-evidence`
4. On submit: insert into `incidents` table with all fields including `photo_url` and `gps_lat/lng`
5. Auto-link the incident to the guard's current active shift
6. Auto-generate the incident number: `INC-{YEAR}-{SEQUENCE}` (use a Supabase sequence or Edge Function)
7. Show a confirmation screen with the incident number after submission

**Categories available:** Theft, Vandalism, Medical Emergency, Trespassing, Fire, Accident, Suspicious Person, Property Damage, Disturbance, Other

**Done when:** Guard submits an incident from their phone and it appears in the web IncidentView within 5 seconds with the correct number, category, and photo.

---

### TASK 2.8 — Guard Chat

**What:** Guard can send and receive messages with the dispatcher.

**Steps:**
1. Build a `ChatScreen` showing the guard's message thread with their dispatcher
2. Messages load from Supabase `messages` table, filtered to this guard ↔ dispatcher pair
3. Subscribe to new messages via Supabase Realtime — new messages appear without refresh
4. Send text messages: insert into `messages` table
5. Send photo: pick from camera roll → upload to Supabase Storage `chat-attachments` → send message with `attachment_url`
6. Incoming message while the app is in the background → Expo push notification
7. Quick reply buttons below the input field: "All clear", "En route", "Need backup", "On break", "Arrived on site"
8. Unread message count badge on the chat tab icon

**Done when:** A message sent from the guard's phone appears in the web dispatcher chat in real time, and vice versa.

---

### TASK 2.9 — Voice Calls (Agora)

**What:** Guard receives real voice calls from the dispatcher.

**Steps:**
1. On app launch, connect the guard to Agora RTM (messaging channel) using their profile ID as the UID
2. When the dispatcher initiates a call from the web, the guard receives an Expo push notification: "Incoming call from Dispatch — Accept / Decline"
3. On accept: join the Agora RTC channel assigned to this guard (`guard-{guardId}`) and begin the voice call
4. Build an in-call screen: caller name, duration timer, mute button, end call button
5. On end: leave the Agora channel and log the call to the `calls` table with duration and outcome

**Done when:** Dispatcher clicks "Call" next to a guard's name on the web → guard's phone rings → real two-way voice call works.

---

### TASK 2.10 — Guard Schedule and Timesheet

**What:** Guard can see their upcoming shifts and review their past hours.

**Screens:** Schedule tab, Timesheet tab

**Schedule tab:**
1. Query `shifts` for this guard for the next 14 days
2. Show shift cards: site name, date, start/end time, status badge
3. Tapping a shift shows: list of assigned tasks, post orders summary, site address with a button to open native Maps

**Timesheet tab:**
1. Query completed shifts for this guard
2. Show each shift: date, site, scheduled hours vs actual hours clocked
3. Show weekly total hours

**Clock-in rule:** The Clock In button on the home screen is only active within 30 minutes of the shift's scheduled start time.

**Done when:** Guard can see their upcoming week and review their past timesheet from their phone.

---

### TASK 2.11 — Client Home Screen

**What:** Client logs in and sees their site with live guard activity.

**Steps:**
1. After login as Client, route to `ClientHomeScreen`
2. Query sites where `client_email` matches the logged-in user's email
3. Show each site: active guard count, guards currently on shift with names, open incident count
4. Show a live map with guard position markers for that site only — read-only, no editing
5. Show a list of recent incidents filed at their site (no internal notes, no other companies' data)
6. Show a "Contact Dispatcher" button that opens a chat thread with the duty dispatcher

**Done when:** Client logs in and sees their guards on a live map in real time.

---

### TASK 2.12 — Client Service Requests

**What:** Client can request a shift extension or additional guard coverage directly from the app.

**Screens:** `RequestScreen`, `RequestHistoryScreen`

**Shift extension:**
1. Client selects a currently active guard at their site and picks a new end time
2. This creates a record and sends a push notification to the dispatcher: "Client requested shift extension — Marcus Johnson until 22:00"
3. Dispatcher approves or denies from the web
4. Client receives a push notification with the outcome

**Extra guard request:**
1. Client picks a date, time range, and site
2. Creates an open shift record and notifies the dispatcher
3. Dispatcher assigns a guard and the client is notified

**History screen:** All past requests with dates, details, and final status.

**Done when:** Client submits a shift extension request from their phone and the dispatcher sees the notification on the web app.

---

### TASK 2.13 — Push Notifications

**What:** All critical alerts reach the right person on their device.

**Steps:**
1. On app launch, call `Notifications.getExpoPushTokenAsync()` and save the token to `profiles.push_token`
2. Create a Supabase Edge Function named `send-push` that accepts a profile ID and a message, looks up the push token, and sends via the Expo Push API
3. Call `send-push` from other Edge Functions or DB triggers for each event type below

**Guard receives:**
- New message from dispatcher
- Incoming voice call
- Shift reminder — 1 hour before scheduled start
- New task assigned to their shift

**Dispatcher receives:**
- Guard panic alert
- New incident filed (high or emergency severity)
- Guard clocked in late
- Guard left geofence
- Client service request submitted

**Client receives:**
- Incident filed at their site
- Service request approved or denied

**Done when:** Panic triggered on the web fires a push notification to the dispatcher's phone within 5 seconds.

---

### TASK 2.14 — Checkpoint QR Code Generator

**What:** Generate a printable PDF of QR codes to physically install at checkpoint locations.

**Steps:**
1. In the web app, Sites view → site detail → Checkpoints section → add a "Print QR Codes" button
2. Clicking the button generates a PDF using `jspdf`
3. Each page has one QR code per checkpoint, printed large enough to scan from 1 meter away
4. The QR code encodes: `asap://checkpoint/{checkpointId}/{siteId}`
5. Below each QR, print: checkpoint name, site name, and GPS coordinates
6. When the guard scans this QR in Task 2.5, it deep-links directly to the checkpoint scan confirmation

**Done when:** A QR sheet can be printed, one code stuck on a wall, and scanning it marks the checkpoint complete on the web map.

---

---

# PHASE 1 — Web Backend

---

### TASK 1.1 — Replace Mock Data with Supabase Queries

**What:** Remove all mock arrays and useState data from the web app and replace with real database queries.

**Create a `src/hooks/` folder with one custom hook per entity:**
- `useGuards()` — fetches from `guards` joined with `profiles`
- `useSites()` — fetches from `sites` joined with `checkpoints`
- `useShifts()` — fetches from `shifts` joined with `profiles` and `sites`
- `useIncidents()` — fetches from `incidents` joined with `profiles` and `sites`
- `useMessages()` — fetches from `messages` for the current user
- `useCalls()` — fetches from `calls`
- `useDispatchers()` — fetches dispatcher rows joined with `profiles`
- `useNotifications()` — fetches `notifications` for the current user

Replace all references to mock data in views and components with the corresponding hook.

**Done when:** The dashboard, scheduler, tracker, and all other views load real data from the database with no mock arrays remaining in the codebase.

---

### TASK 1.2 — Realtime Guard Positions

**What:** Guard markers on the Tracker map move automatically when guards update their position.

**Steps:**
1. In `TrackerView`, subscribe to the `guards` table via `supabase.channel('guards').on('postgres_changes', ...)`
2. When a row update arrives with new `lat/lng` values, update the corresponding marker position on the map without a page reload
3. When `TrackerView` first loads, query the last 50 rows from `location_history` per guard and render their patrol trail as a polyline
4. Trail updates with each new position write

**Done when:** Guard walks with their phone → their dot moves on the web map in real time.

---

### TASK 1.3 — Realtime Panic

**What:** Panic triggered from a guard's phone appears on all active dispatcher sessions within 3 seconds.

**Steps:**
1. Subscribe to `guards.panic_active` changes via Supabase Realtime in the app's root component
2. When `panic_active` changes to `true` → show the panic banner on the dashboard and auto-focus the guard on the Tracker map
3. Insert a notification record of type `panic` with the guard's details
4. When the dispatcher clicks "Resolve" → update `guards.panic_active = false`, remove the banner

**Done when:** Guard holds the panic button on their phone → the red alert banner fires on the web dashboard within 3 seconds.

---

### TASK 1.4 — Realtime Notifications

**What:** All system events create real notifications that appear in the bell menu instantly.

**Steps:**
1. Subscribe to the `notifications` table for the current user via Supabase Realtime
2. When a new row arrives, add it to the notification list and increment the bell badge count
3. Clicking a notification → mark it as `read = true` in the database
4. Dismissing → set `dismissed = true`
5. The bell badge shows only unread, non-dismissed count

**Notification types to handle in the UI:** `panic`, `geofence_breach`, `guard_late`, `dispatcher_late`, `incident_new`, `checkpoint_missed`, `cert_expiring`, `client_request`

**Done when:** Filing an incident from the mobile app triggers a real notification in the web bell menu within 5 seconds.

---

### TASK 1.5 — Incidents — Real CRUD

**What:** The Incidents module reads from and writes to the real database.

**Steps:**
1. Incident list loads from `incidents` table with real filters
2. Create incident → `supabase.from('incidents').insert()` with all fields
3. Auto-generate incident number: use a Supabase sequence and format as `INC-{YEAR}-{SEQUENCE padded to 4 digits}`
4. Add a category field to the create/edit modal with a dropdown: Theft, Vandalism, Medical Emergency, Trespassing, Fire, Accident, Suspicious Person, Property Damage, Disturbance, Other
5. Add a timeline panel inside the incident detail: load `incident_logs` for this incident, display chronologically, include a text input to add a new log entry
6. Status progression: open → in-review → resolved. Moving to "resolved" requires supervisor or admin role. Moving to "in-review" is available to dispatchers.

**Done when:** Full incident lifecycle — create, update, add log entries, resolve — works end-to-end with real data.

---

### TASK 1.6 — File and Photo Upload

**What:** Photos can be attached to incidents and messages and stored in Supabase Storage.

**Steps:**
1. Create a Supabase Storage bucket named `incident-evidence` (private, 50MB file size limit)
2. Create a bucket named `chat-attachments` (private)
3. In the incident create/edit modal: add a file input, upload the selected file to `incident-evidence`, save the returned URL as `incidents.photo_url`
4. In ChatView: add a paperclip button next to the message input, upload selected image to `chat-attachments`, send the message with `attachment_url` set
5. Display image thumbnails inline in both the incident detail and the chat thread

**Done when:** A photo attached to an incident is visible to the dispatcher when they open the incident detail.

---

### TASK 1.7 — Recurring Shifts

**What:** A dispatcher or admin can create a shift pattern once and have all future shifts generated automatically.

**Steps:**
1. Add a "Recurring" toggle to the Add Shift modal
2. When toggled on, show: day-of-week checkboxes (Mon–Sun) and a date range (effective from → effective until)
3. On save: insert the pattern into `shift_templates`, then generate and insert individual `shifts` rows for every matching day in the date range
4. Generated shifts appear in the scheduler grid with a small repeat icon
5. Recurring shifts work for both guard and dispatcher assignees

**Done when:** Creating a recurring Monday shift for one guard generates all Monday shift records for the selected date range automatically.

---

### TASK 1.8 — Guard Clock-In / Clock-Out (Web View)

**What:** Guard clock activity recorded on mobile is reflected on the web Timesheet in real time.

**Steps:**
1. Subscribe to `shifts` table changes via Realtime for `actual_clock_in` and `actual_clock_out` fields
2. When `actual_clock_in` is set → update the guard's status to "active" in the UI, start an elapsed timer on their scheduler card
3. When `actual_clock_out` is set → mark shift as completed in the UI
4. If clock-in is more than 15 minutes after the scheduled start time → insert a `guard_late` notification
5. Timesheet view: show scheduled time vs actual time side by side. Highlight in orange if actual differs by more than 10 minutes.
6. Add a supervisor-only "Approve Week" button per guard that sets all that guard's completed shifts for the current week to `approved` status

**Done when:** Guard clocks in on their phone → web Timesheet immediately reflects the actual clock-in time.

---

### TASK 1.9 — Checkpoint Management (Web)

**What:** Checkpoint scan status updates in real time on the web, and admins can manage checkpoints and print QR codes.

**Steps:**
1. Subscribe to the `checkpoints` table via Realtime — when `status` changes, update the marker color on the Tracker map and the status icon in the SitesView checkpoint list
2. Add "+ Add Checkpoint" and edit/delete buttons inside the site detail modal
3. Show `last_scanned_at` and `last_scanned_by` for each checkpoint in the site detail
4. QR code PDF generator (see Task 2.14 — this is the web-side trigger for that)
5. Create a Supabase Edge Function that runs on a schedule every 5 minutes: for each checkpoint where `required_interval_minutes` has elapsed since `last_scanned_at`, insert a `checkpoint_missed` notification to the site's assigned dispatcher

**Done when:** Guard scans a checkpoint on their phone → the checkpoint marker on the web map changes color within 3 seconds.

---

### TASK 1.10 — Guard Certifications

**What:** Track guard licenses and certifications with automatic expiry warnings.

**Steps:**
1. Add a "Certifications" tab to the guard edit modal in the Users view
2. Fields per certification: Type (Guard Card / CPR / First Aid / Firearms / Other), License number, Issued date, Expiry date, Document upload (PDF or image → Supabase Storage)
3. On the dashboard, show a warning card listing all certifications expiring within 30 days, with the guard's name and days remaining
4. In the Scheduler, when assigning a guard to a shift with the role "Armed": check if they have a valid, non-expired firearms certification. If not, show a warning and block assignment.

**Done when:** A guard with an expiring certification appears on the admin dashboard as a warning 30 days before the expiry date.

---

### TASK 1.11 — Reports — Real Export

**What:** Export buttons generate actual downloadable files.

**Steps:**
1. Install `jspdf` and `jspdf-autotable`
2. Replace all stub export toasts with real file generation
3. Build the following export types:
   - **DAR (Daily Activity Report) PDF** — per guard per day: clock in/out times, checkpoints completed, incidents filed, notes
   - **Hours CSV** — columns: guard name, date, site, scheduled start, scheduled end, actual clock in, actual clock out, total hours, status
   - **Incident Summary PDF** — table of incidents filtered by the current date range and filters: incident number, date, guard, site, category, severity, status
   - **Patrol Compliance PDF** — per guard per site: checkpoints required vs completed, % compliance, date range
4. Add a date range picker to the Reports view with presets: Today, This Week, This Month, Custom
5. Remove all `Math.random()` calls from chart data and replace with real aggregation queries against the database

**Done when:** Clicking any Export button downloads a real file with real data.

---

### TASK 1.12 — Settings — Company Tab and Save All

**What:** Add company settings and make all save operations persist to the database.

**Steps:**
1. Add a "Company" tab to the Settings view with: company name, company logo (upload to Supabase Storage `company-assets` bucket), primary timezone, address
2. Wire all existing Save buttons in the Profile, Regional, and Security tabs to call `supabase.from('profiles').update()` with the changed fields
3. Company settings save to `supabase.from('companies').update()`
4. Replace the timezone dropdown stub with a full IANA timezone list
5. Show a success toast after each successful save and an error toast if it fails

**Done when:** Changing any setting and clicking Save persists the change after a full page refresh.

---

### TASK 1.13 — VoIP — Agora Web

**What:** Replace simulated VoIP with real Agora voice calls on the dispatcher web side.

**Steps:**
1. Create an Agora.io account and obtain the App ID (free tier: 10,000 minutes/month)
2. Install `agora-rtc-sdk-ng` in the web app
3. Create a Supabase Edge Function named `get-agora-token` that generates a short-lived RTC token server-side using the App Certificate. The App Certificate must never be sent to the client.
4. Each guard's voice channel name is: `guard-{guardId}`
5. When dispatcher clicks "Call" on a guard: fetch a token from the Edge Function, join the guard's channel as publisher, start audio track
6. The GlobalCallUI (persistent call bar at the top): wire mute/unmute to `localTrack.setMuted(true/false)`, end call to `client.leave()` and `localTrack.close()`
7. On call end: calculate duration and insert a row into `calls` with outcome, duration, and notes

**Done when:** Dispatcher clicks "Call Marcus" on the web → Marcus's phone rings (Task 2.9) → real two-way voice works.

---

### TASK 1.15 — Remove Demo Artifacts

**What:** All demo-only UI elements are hidden in production and gated behind an environment variable.

**Steps:**
1. Add a `VITE_DEMO_MODE` environment variable. Set it to `true` only on the demo Vercel deployment. Leave it unset or `false` on the production deployment.
2. Wrap the "Simulate Panic" and "Simulate Geofence Breach" buttons in `TrackerView` with a condition: only render when `import.meta.env.VITE_DEMO_MODE === 'true'`
3. Wrap the quick-login demo tiles in `LoginView` with the same condition
4. Ensure all `Math.random()` calls in `ReportsView` are replaced (covered in Task 1.11)

**Done when:** The production deployment shows no simulate buttons or demo tiles. The demo deployment still shows them.

---

### TASK 1.16 — Dispatcher Clock-In / Clock-Out

**What:** Dispatchers clock in and out of their dispatch shifts from the web app. Admins can see who is on duty in real time.

**Steps:**
1. Add a Clock In / Clock Out button to the dispatcher dashboard — visible only to the dispatcher role. Place it prominently at the top of the page, next to the greeting.
2. Clock-in action:
   - Insert a row into `dispatcher_clock_records` with `clocked_in_at = now()` and link to the dispatcher's current scheduled shift if one exists
   - Update `dispatchers.status = 'on-duty'` and `dispatchers.clocked_in_at = now()`
3. Clock-out action:
   - Update `dispatcher_clock_records.clocked_out_at = now()`
   - Update `dispatchers.status = 'off-duty'`
4. Admin dashboard: add an "On-Duty Now" section that lists all dispatchers currently clocked in with an elapsed time counter. Subscribe via Realtime so it updates when any dispatcher clocks in or out.
5. Late clock-in: if a dispatcher clocks in more than 15 minutes after their scheduled shift start time → insert a `dispatcher_late` notification to the admin
6. Timesheet view: add a "Dispatchers" tab alongside the existing "Guards" tab. Show the same columns: date, scheduled start, scheduled end, actual clock in, actual clock out, total hours, status, and an approve button for admin/supervisor.

**Done when:** Dispatcher clicks Clock In → admin sees them listed as on-duty with a running timer. Clock-out records the exact end time. The dispatcher timesheet tab shows their full history.

---

### TASK 1.17 — Dispatcher Scheduling

**What:** Admin can schedule dispatcher shifts using the same Scheduler used for guards. Dispatchers see their upcoming shifts on their dashboard.

**Steps:**
1. Add a toggle to the top of the Scheduler view: "Guards" | "Dispatchers" | "All". Default to "All".
2. When "Dispatchers" is selected, the scheduler grid shows dispatcher rows instead of guard rows, using the same card and drag-and-drop UI
3. The Add Shift modal uses the existing form with one addition: an `assignee_role` selector (Guard / Dispatcher). When Dispatcher is selected, the site field becomes optional since dispatchers may cover the full operation rather than one site.
4. The `shifts` table already has `assignee_role` from Task 0.2 — use it to filter the correct rows per view
5. Dispatcher dashboard: query for this dispatcher's next upcoming shift. If one exists, show a "Your Next Shift" card at the top of the page with the date, start time, end time, and a Clock In button (active within 30 minutes of start)
6. Recurring dispatcher shifts: the recurring toggle from Task 1.7 works for dispatchers without any changes since `shift_templates` includes `assignee_role`
7. Overtime: if a dispatcher's `actual_clock_out - actual_clock_in` exceeds their scheduled duration by more than 30 minutes → highlight in orange in the Timesheet and insert a notification to admin
8. Shift swaps: dispatchers can submit swap requests the same way guards do using the existing `swap_requests` table

**Done when:** Admin creates a dispatcher shift in the Scheduler. The dispatcher logs in and sees "Your next shift: Today 08:00–16:00" on their dashboard. When they clock in, the actual time is recorded against that shift.

---

---

# PHASE 3 — Advanced Features

---

### TASK 3.1 — Historical GPS Playback

**What:** A dispatcher can replay a guard's patrol from any past date as an animation on the Tracker map.

**Steps:**
1. Add a date picker and a time range scrubber to the TrackerView sidebar
2. When a date is selected, query `location_history` for the selected guard and date range, ordered by `recorded_at`
3. Animate the guard marker along the returned positions using `setInterval`, moving one position per tick
4. Add playback controls: Play, Pause, 1×, 2×, 4× speed
5. Draw the trail as a polyline for the selected time window

**Done when:** Selecting a guard and a past date shows their full patrol path as a playable animation on the map.

---

### TASK 3.2 — Lone Worker Timer

**What:** If a guard hasn't moved or interacted with the app within a set time, the dispatcher is automatically alerted.

**Steps:**
1. Add a "Lone Worker Interval" field to the site settings (default: 30 minutes)
2. Create a Supabase Edge Function on a pg_cron schedule running every 5 minutes
3. The function queries all active guards where `last_activity < now() - lone_worker_interval`
4. For each match: insert a `lone-worker-alert` notification to the assigned dispatcher and send a push notification to the guard's device: "Check-in required — tap to confirm you're OK"
5. When the guard taps the notification → update `guards.last_activity = now()`, which clears the alert

**Done when:** A guard who hasn't interacted with the app for 30 minutes triggers a dispatcher notification automatically.

---

### TASK 3.3 — Patrol Compliance Report

**What:** Show what percentage of required checkpoints each guard completed per site per time period.

**Steps:**
1. Add a "Patrol Compliance" report type to the Reports view alongside the existing reports
2. Filters: guard (optional), site (optional), date range (required)
3. Query: for each checkpoint at each site in the date range, count how many times it was scanned vs how many times it was required based on `required_interval_minutes`
4. Display as a table: guard name, site name, checkpoints required, checkpoints completed, % compliance
5. Color code each row: green ≥ 90%, yellow 70–89%, red < 70%
6. Export as PDF with company logo in the header

**Done when:** Can generate and export a patrol compliance report for any guard for any date range.

---

### TASK 3.4 — Incident PDF Export

**What:** Generate a professional, printable PDF for any individual incident.

**Template contents:** Company logo and name, incident number, date and time, guard name, site name, category, severity, description, full timeline log (all `incident_logs` entries in order), photo thumbnail if attached, GPS coordinates, supervisor sign-off line.

**Steps:**
1. Add an "Export PDF" button to the incident detail view
2. On click: build the PDF using `jspdf` with the template above
3. Also auto-generate and store the PDF when an incident's status changes to "resolved" — save the file to Supabase Storage and store the URL on the incident row

**Done when:** Clicking "Export PDF" on any incident downloads a formatted, complete incident report.

---

### TASK 3.5 — Client Web Portal

**What:** A lightweight read-only web login for clients who prefer a browser over the mobile app.

**Steps:**
1. Add a `/client` route to the web app with its own layout — no sidebar, no dispatcher tools
2. Client logs in with their email/password — the same Supabase auth, but the RLS policies restrict them to their site data only
3. Show: live map with guard positions, active shift roster, open incident list — all for their site only
4. No edit controls anywhere on this view
5. A "Contact Dispatcher" button opens a chat window

**Note:** This is the browser fallback. The full client experience is the mobile app (Tasks 2.11 and 2.12).

**Done when:** Client logs in at the web URL and sees their guards on a live map with no access to any other data.

---

### TASK 3.6 — Billing and Subscription

**Status: Skipped. Build this after acquiring the first paying client.**

When the time comes: use Lemon Squeezy (supports Egypt via PayPal and Payoneer). Pricing model: per guard per month. On payment confirmation, a webhook updates `companies.plan` and sets a `guard_limit`. The app enforces the limit when adding new guards.

---

### TASK 3.7 — Audit Log

**What:** Every significant admin action is recorded with who did it, when, and what changed.

**Steps:**
1. The `audit_log` table is already in the schema from Task 0.2
2. Add a database trigger or call a logging function on every write to: `guards`, `shifts`, `incidents`, `profiles`, `sites`, `certifications`, `companies`
3. Log the actor ID, the action (INSERT / UPDATE / DELETE), the entity type, the entity ID, the old value (jsonb), and the new value (jsonb)
4. Also log from the app: login, logout, any settings save
5. Add an "Audit Log" tab to the Settings view — searchable by actor name, date range, and action type

**Done when:** Every admin action appears in the audit log with the actor, timestamp, and before/after values.

---

---

## Task Quick Reference

| Task | Phase | Effort | Depends On |
|---|---|---|---|
| 0.1 Supabase Setup | Foundation | 1h | — |
| 0.2 Database Schema | Foundation | 2h | 0.1 |
| 0.3 Row Level Security | Foundation | 1h | 0.2 |
| 0.4 Authentication | Foundation | 2h | 0.1, 0.2 |
| 0.5 Seed Demo Data | Foundation | 2h | 0.2 |
| 2.1 Expo Project Setup | Mobile | 1h | 0.1 |
| 2.2 Mobile Authentication | Mobile | 2h | 2.1, 0.4 |
| 2.3 Guard Home Screen | Mobile | 3h | 2.2 |
| 2.4 GPS Tracking | Mobile | 3h | 2.3 |
| 2.5 Checkpoint Scanning | Mobile | 3h | 2.4 |
| 2.6 Panic Button | Mobile | 2h | 2.4 |
| 2.7 Submit Incident | Mobile | 2h | 2.2 |
| 2.8 Guard Chat | Mobile | 2h | 2.2 |
| 2.9 Voice Calls | Mobile | 3h | 1.13, 2.2 |
| 2.10 Guard Schedule and Timesheet | Mobile | 2h | 2.2 |
| 2.11 Client Home Screen | Mobile | 2h | 2.2 |
| 2.12 Client Service Requests | Mobile | 2h | 2.11 |
| 2.13 Push Notifications | Mobile | 2h | 2.1 |
| 2.14 Checkpoint QR Generator | Mobile | 1h | 1.9 |
| 1.1 Replace Mock Data | Web | 4h | 0.2, 0.4 |
| 1.2 Realtime Guard Positions | Web | 2h | 1.1 |
| 1.3 Realtime Panic | Web | 2h | 1.2 |
| 1.4 Realtime Notifications | Web | 2h | 1.1 |
| 1.5 Incidents Real CRUD | Web | 3h | 1.1 |
| 1.6 File and Photo Upload | Web | 2h | 0.1 |
| 1.7 Recurring Shifts | Web | 3h | 1.1 |
| 1.8 Guard Clock-In / Out Web View | Web | 2h | 1.1 |
| 1.9 Checkpoint Management | Web | 2h | 1.1 |
| 1.10 Guard Certifications | Web | 2h | 1.1 |
| 1.11 Reports Real Export | Web | 3h | 1.1 |
| 1.12 Settings Company Tab and Save | Web | 2h | 0.4 |
| 1.13 VoIP Agora Web | Web | 4h | 0.4 |
| 1.15 Remove Demo Artifacts | Web | 1h | — |
| 1.16 Dispatcher Clock-In / Out | Web | 2h | 1.1, 0.2 |
| 1.17 Dispatcher Scheduling | Web | 3h | 1.7, 1.16 |
| 3.1 Historical GPS Playback | Advanced | 3h | 1.2 |
| 3.2 Lone Worker Timer | Advanced | 2h | 1.2 |
| 3.3 Patrol Compliance Report | Advanced | 2h | 1.9 |
| 3.4 Incident PDF Export | Advanced | 2h | 1.5 |
| 3.5 Client Web Portal | Advanced | 3h | 1.1 |
| 3.6 Billing | Advanced | 3h | 0.4 | ⏸ Skipped |
| 3.7 Audit Log | Advanced | 2h | 1.1 |

**Total: ~92 hours**
Foundation 8h · Mobile 30h · Web 39h · Advanced 20h

---

## The Target Demo

These are the minimum tasks needed to have a working live demo on a real phone:

**Tasks 0.1 through 0.5** — backend is live and seeded
**Tasks 2.1 through 2.6** — guard app installed on phone, GPS streaming, panic working
**Tasks 1.1 through 1.3** — web dashboard shows real data and live guard positions

That is 13 tasks and approximately 24 hours of work.

At that point: open the web dispatcher dashboard on a laptop, open the guard app on a phone via Expo Go, walk around, and watch the dot move on the live map in real time.
