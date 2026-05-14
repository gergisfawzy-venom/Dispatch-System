import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppNotification,
  CallLog,
  CurrentUser,
  Guard,
  Incident,
  Message,
  NotificationType,
  Shift,
  Site,
  SwapRequest,
  TimeOffRequest,
  Toast,
  ViewKey,
  Voicemail,
} from "@/types";
import {
  initialCalls,
  initialGuards,
  initialIncidents,
  initialMessages,
  initialShifts,
  initialSites,
  initialSwapRequests,
  initialTimeOff,
  initialVoicemails,
} from "@/data/seed";

interface AppState {
  view: ViewKey;
  currentUser: CurrentUser | null;
  guards: Guard[];
  sites: Site[];
  shifts: Shift[];
  incidents: Incident[];
  messages: Message[];
  calls: CallLog[];
  voicemails: Voicemail[];
  notifications: AppNotification[];
  swapRequests: SwapRequest[];
  timeOffRequests: TimeOffRequest[];
  panicActive: boolean;
  panicGuardId: number | null;
  toasts: Toast[];
  activeCall: {
    data: CallLog;
    state: "ringing" | "connected";
    muted: boolean;
    minimized: boolean;
  } | null;
  requestLogs: {
    id: number;
    type: "swap" | "time-off";
    status: "approved" | "rejected";
    guardName: string;
    targetGuardName?: string;
    details: string;
    resolvedAt: Date;
  }[];
}

type Action =
  | { type: "SET_VIEW"; view: ViewKey }
  | { type: "SET_USER"; user: CurrentUser | null }
  | { type: "SET_GUARDS"; guards: Guard[] }
  | { type: "UPSERT_GUARD"; guard: Guard }
  | { type: "DELETE_GUARD"; id: number }
  | { type: "SET_SITES"; sites: Site[] }
  | { type: "UPSERT_SITE"; site: Site }
  | { type: "DELETE_SITE"; id: number }
  | { type: "SET_SHIFTS"; shifts: Shift[] }
  | { type: "UPSERT_SHIFT"; shift: Shift }
  | { type: "DELETE_SHIFT"; id: number }
  | { type: "SET_INCIDENTS"; incidents: Incident[] }
  | { type: "UPSERT_INCIDENT"; incident: Incident }
  | { type: "DELETE_INCIDENT"; id: number }
  | { type: "SET_MESSAGES"; messages: Message[] }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "MARK_MESSAGES_READ"; guardId: number }
  | { type: "SET_CALLS"; calls: CallLog[] }
  | { type: "ADD_CALL"; call: CallLog }
  | { type: "UPDATE_CALL"; call: CallLog }
  | { type: "DELETE_CALL"; id: number }
  | { type: "SET_VOICEMAILS"; voicemails: Voicemail[] }
  | { type: "UPDATE_VOICEMAIL"; voicemail: Voicemail }
  | { type: "DELETE_VOICEMAIL"; id: number }
  | { type: "ADD_NOTIFICATION"; notification: AppNotification }
  | { type: "DISMISS_NOTIFICATION"; id: number }
  | { type: "MARK_NOTIFICATION_READ"; id: number }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "SET_SWAPS"; swaps: SwapRequest[] }
  | { type: "RESOLVE_SWAP"; id: number; approve: boolean; reassignTo?: number }
  | { type: "SET_TIMEOFF"; timeOff: TimeOffRequest[] }
  | { type: "RESOLVE_TIMEOFF"; id: number; approve: boolean }
  | { type: "SET_PANIC"; active: boolean; guardId: number | null }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: number }
  | { type: "REMOVE_TOAST"; id: number }
  | { type: "MOVE_GUARDS" }
  | { type: "START_GLOBAL_CALL"; call: CallLog }
  | { type: "SET_CALL_STATE"; state: "ringing" | "connected" }
  | { type: "SET_CALL_MUTED"; muted: boolean }
  | { type: "SET_CALL_MINIMIZED"; minimized: boolean }
  | { type: "END_GLOBAL_CALL" }
  | { type: "ADD_REQUEST_LOG"; log: AppState["requestLogs"][0] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "SET_USER":
      return { ...state, currentUser: action.user };
    case "SET_GUARDS":
      return { ...state, guards: action.guards };
    case "UPSERT_GUARD": {
      const exists = state.guards.some((g) => g.id === action.guard.id);
      return {
        ...state,
        guards: exists
          ? state.guards.map((g) => (g.id === action.guard.id ? action.guard : g))
          : [...state.guards, action.guard],
      };
    }
    case "DELETE_GUARD": {
      return {
        ...state,
        guards: state.guards.filter((g) => g.id !== action.id),
        shifts: state.shifts.map((s) =>
          s.guardId === action.id ? { ...s, guardId: 0 } : s
        ),
      };
    }
    case "SET_SITES":
      return { ...state, sites: action.sites };
    case "UPSERT_SITE": {
      const exists = state.sites.some((s) => s.id === action.site.id);
      return {
        ...state,
        sites: exists
          ? state.sites.map((s) => (s.id === action.site.id ? action.site : s))
          : [...state.sites, action.site],
      };
    }
    case "DELETE_SITE":
      return {
        ...state,
        sites: state.sites.filter((s) => s.id !== action.id),
        shifts: state.shifts.filter((s) => s.siteId !== action.id),
        incidents: state.incidents.map((i) =>
          i.siteId === action.id ? { ...i, status: "resolved" } : i
        ),
      };
    case "SET_SHIFTS":
      return { ...state, shifts: action.shifts };
    case "UPSERT_SHIFT": {
      const exists = state.shifts.some((s) => s.id === action.shift.id);
      return {
        ...state,
        shifts: exists
          ? state.shifts.map((s) => (s.id === action.shift.id ? action.shift : s))
          : [...state.shifts, action.shift],
      };
    }
    case "DELETE_SHIFT":
      return {
        ...state,
        shifts: state.shifts.filter((s) => s.id !== action.id),
      };
    case "SET_INCIDENTS":
      return { ...state, incidents: action.incidents };
    case "UPSERT_INCIDENT": {
      const exists = state.incidents.some((i) => i.id === action.incident.id);
      return {
        ...state,
        incidents: exists
          ? state.incidents.map((i) =>
              i.id === action.incident.id ? action.incident : i
            )
          : [action.incident, ...state.incidents],
      };
    }
    case "DELETE_INCIDENT":
      return {
        ...state,
        incidents: state.incidents.filter((i) => i.id !== action.id),
      };
    case "SET_MESSAGES":
      return { ...state, messages: action.messages };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "MARK_MESSAGES_READ":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.fromId === action.guardId ? { ...m, read: true } : m
        ),
      };
    case "SET_CALLS":
      return { ...state, calls: action.calls };
    case "ADD_CALL":
      return { ...state, calls: [action.call, ...state.calls] };
    case "UPDATE_CALL":
      return {
        ...state,
        calls: state.calls.map((c) => (c.id === action.call.id ? action.call : c)),
      };
    case "DELETE_CALL":
      return { ...state, calls: state.calls.filter((c) => c.id !== action.id) };
    case "SET_VOICEMAILS":
      return { ...state, voicemails: action.voicemails };
    case "UPDATE_VOICEMAIL":
      return {
        ...state,
        voicemails: state.voicemails.map((v) =>
          v.id === action.voicemail.id ? action.voicemail : v
        ),
      };
    case "DELETE_VOICEMAIL":
      return {
        ...state,
        voicemails: state.voicemails.filter((v) => v.id !== action.id),
      };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications].slice(0, 50),
      };
    case "DISMISS_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, dismissed: true } : n
        ),
      };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };
    case "SET_SWAPS":
      return { ...state, swapRequests: action.swaps };
    case "RESOLVE_SWAP": {
      const swap = state.swapRequests.find((s) => s.id === action.id);
      if (!swap) return state;
      const requester = state.guards.find(g => g.id === swap.requestedById);
      const target = action.reassignTo ? state.guards.find(g => g.id === action.reassignTo) : null;
      
      const updatedShifts =
        action.approve && action.reassignTo
          ? state.shifts.map((sh) =>
              sh.id === swap.shiftId ? { ...sh, guardId: action.reassignTo! } : sh
            )
          : state.shifts;
          
      const newLog = {
        id: Date.now(),
        type: "swap" as const,
        status: action.approve ? ("approved" as const) : ("rejected" as const),
        guardName: requester?.name || "Unknown",
        targetGuardName: target?.name || "Unknown",
        details: swap.reason,
        resolvedAt: new Date()
      };

      return {
        ...state,
        shifts: updatedShifts,
        swapRequests: state.swapRequests.filter((s) => s.id !== action.id),
        requestLogs: [newLog, ...state.requestLogs]
      };
    }
    case "SET_TIMEOFF":
      return { ...state, timeOffRequests: action.timeOff };
    case "RESOLVE_TIMEOFF": {
      const req = state.timeOffRequests.find((t) => t.id === action.id);
      if (!req) return state;
      const guard = state.guards.find(g => g.id === req.guardId);
      
      const updatedShifts = action.approve
        ? state.shifts.filter(
            (s) => !(s.guardId === req.guardId && s.date === req.date)
          )
        : state.shifts;
        
      const newLog = {
        id: Date.now(),
        type: "time-off" as const,
        status: action.approve ? ("approved" as const) : ("rejected" as const),
        guardName: guard?.name || "Unknown",
        details: req.reason,
        resolvedAt: new Date()
      };

      return {
        ...state,
        shifts: updatedShifts,
        timeOffRequests: state.timeOffRequests.filter((t) => t.id !== action.id),
        requestLogs: [newLog, ...state.requestLogs]
      };
    }
    case "SET_PANIC":
      return {
        ...state,
        panicActive: action.active,
        panicGuardId: action.guardId,
        guards: state.guards.map((g) =>
          g.id === action.guardId
            ? { ...g, panicActive: action.active }
            : action.active
              ? g
              : { ...g, panicActive: false }
        ),
      };
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "MOVE_GUARDS":
      return {
        ...state,
        guards: state.guards.map((g) => {
          if (g.status !== "active" && g.status !== "on-patrol") return g;
          const newLat = g.lat + (Math.random() - 0.5) * 0.0005;
          const newLng = g.lng + (Math.random() - 0.5) * 0.0005;
          return {
            ...g,
            lat: newLat,
            lng: newLng,
            history: [...(g.history || []), [newLat, newLng] as [number, number]].slice(-30),
          };
        }),
      };
    case "START_GLOBAL_CALL":
      return { ...state, activeCall: { data: action.call, state: "ringing", muted: false, minimized: false } };
    case "SET_CALL_STATE":
      return state.activeCall ? { ...state, activeCall: { ...state.activeCall, state: action.state } } : state;
    case "SET_CALL_MUTED":
      return state.activeCall ? { ...state, activeCall: { ...state.activeCall, muted: action.muted } } : state;
    case "SET_CALL_MINIMIZED":
      return state.activeCall ? { ...state, activeCall: { ...state.activeCall, minimized: action.minimized } } : state;
    case "END_GLOBAL_CALL":
      return { ...state, activeCall: null };
    case "ADD_REQUEST_LOG":
      return { ...state, requestLogs: [action.log, ...state.requestLogs] };
    default:
      return state;
  }
}

const initialState: AppState = {
  view: "landing",
  currentUser: null,
  guards: initialGuards,
  sites: initialSites,
  shifts: initialShifts,
  incidents: initialIncidents,
  messages: initialMessages,
  calls: initialCalls,
  voicemails: initialVoicemails,
  notifications: [],
  swapRequests: initialSwapRequests,
  timeOffRequests: initialTimeOff,
  panicActive: false,
  panicGuardId: null,
  toasts: [],
  activeCall: null,
  requestLogs: [],
};

interface AppContextValue extends AppState {
  setView: (view: ViewKey) => void;
  setUser: (user: CurrentUser | null) => void;
  upsertGuard: (g: Guard) => void;
  deleteGuard: (id: number) => void;
  upsertSite: (s: Site) => void;
  deleteSite: (id: number) => void;
  upsertShift: (s: Shift) => void;
  deleteShift: (id: number) => void;
  upsertIncident: (i: Incident) => void;
  deleteIncident: (id: number) => void;
  addMessage: (m: Message) => void;
  markMessagesRead: (guardId: number) => void;
  addCall: (c: CallLog) => void;
  updateCall: (c: CallLog) => void;
  deleteCall: (id: number) => void;
  updateVoicemail: (v: Voicemail) => void;
  deleteVoicemail: (id: number) => void;
  pushNotification: (
    type: NotificationType,
    message: string,
    options?: { guardId?: number; siteId?: number; navigateTo?: ViewKey }
  ) => void;
  dismissNotification: (id: number) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  resolveSwap: (id: number, approve: boolean, reassignTo?: number) => void;
  resolveTimeOff: (id: number, approve: boolean) => void;
  triggerPanic: (guardId: number) => void;
  resolvePanic: () => void;
  toast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: number) => void;
  nextId: () => number;
  startGlobalCall: (guardId?: number, number?: string) => void;
  setGlobalCallState: (state: "ringing" | "connected") => void;
  setGlobalCallMuted: (muted: boolean) => void;
  setGlobalCallMinimized: (minimized: boolean) => void;
  endGlobalCall: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const idCounter = useRef(100000);
  const nextId = useCallback(() => ++idCounter.current, []);

  const pushNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      options?: { guardId?: number; siteId?: number; navigateTo?: ViewKey }
    ) => {
      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          id: nextId(),
          type,
          message,
          guardId: options?.guardId,
          siteId: options?.siteId,
          timestamp: new Date(),
          read: false,
          dismissed: false,
          navigateTo: options?.navigateTo,
        },
      });
    },
    [nextId]
  );

  const toast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = nextId();
      dispatch({ type: "ADD_TOAST", toast: { id, message, type } });
      setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), 3500);
    },
    [nextId]
  );

  const triggerPanic = useCallback(
    (guardId: number) => {
      dispatch({ type: "SET_PANIC", active: true, guardId });
      const g = state.guards.find((x) => x.id === guardId);
      pushNotification(
        "panic",
        `Panic alert: ${g?.name ?? "Guard"} at ${g?.site ?? "unknown site"}`,
        { guardId, navigateTo: "tracker" }
      );
    },
    [state.guards, pushNotification]
  );

  const resolvePanic = useCallback(() => {
    if (state.panicGuardId == null) return;
    const g = state.guards.find((x) => x.id === state.panicGuardId);
    const incident: Incident = {
      id: nextId(),
      title: `Resolved panic alert from ${g?.name ?? "Guard"}`,
      description: `Panic alert raised by ${g?.name ?? "Guard"} at ${g?.site ?? "unknown site"} was resolved by dispatch.`,
      guardId: state.panicGuardId,
      siteId: state.sites.find((s) => s.name === g?.site)?.id ?? 1,
      severity: "emergency",
      status: "resolved",
      createdAt: new Date(),
      updatedAt: new Date(),
      hasPhoto: false,
      gpsLat: g?.lat,
      gpsLng: g?.lng,
      linkedPanic: true,
    };
    dispatch({ type: "UPSERT_INCIDENT", incident });
    dispatch({ type: "SET_PANIC", active: false, guardId: null });
    toast("Panic alert resolved and logged");
  }, [state.panicGuardId, state.guards, state.sites, nextId, toast]);

  // Auto-generate a few notifications on mount
  useEffect(() => {
    const t = setTimeout(() => {
      const missingGuard = state.guards.find((g) => g.status === "missing");
      const lateGuard = state.guards.find((g) => g.status === "late");
      const overtimeGuard = state.guards.find((g) => g.weeklyHours > 40);
      const missedCheckpoint = state.sites
        .flatMap((s) => s.checkpoints)
        .find((c) => c.status === "missed");
      if (lateGuard)
        pushNotification("late", `${lateGuard.name} is late to shift`, {
          guardId: lateGuard.id,
          navigateTo: "scheduler",
        });
      if (missingGuard)
        pushNotification(
          "checkpoint-missed",
          `${missingGuard.name} has not checked in — last seen 47 min ago`,
          { guardId: missingGuard.id, navigateTo: "tracker" }
        );
      if (overtimeGuard)
        pushNotification(
          "overtime",
          `${overtimeGuard.name} exceeded 40h this week — ${overtimeGuard.weeklyHours.toFixed(1)}h logged`,
          { guardId: overtimeGuard.id, navigateTo: "scheduler" }
        );
      if (missedCheckpoint) {
        const site = state.sites.find((s) => s.id === missedCheckpoint.siteId);
        pushNotification(
          "checkpoint-missed",
          `Missed checkpoint: ${missedCheckpoint.name} at ${site?.name ?? ""}`,
          { siteId: site?.id, navigateTo: "tracker" }
        );
      }
      state.swapRequests.forEach((s) => {
        const g = state.guards.find((x) => x.id === s.requestedById);
        pushNotification(
          "swap-request",
          `${g?.name ?? "Guard"} submitted a swap request`,
          { guardId: s.requestedById, navigateTo: "scheduler" }
        );
      });
      state.timeOffRequests.forEach((t) => {
        const g = state.guards.find((x) => x.id === t.guardId);
        pushNotification(
          "time-off-request",
          `${g?.name ?? "Guard"} requested time off (${t.date})`,
          { guardId: t.guardId, navigateTo: "scheduler" }
        );
      });
    }, 1500);

    const moveInterval = setInterval(() => {
      dispatch({ type: "MOVE_GUARDS" });
    }, 10000);

    return () => {
      clearTimeout(t);
      clearInterval(moveInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setView: (view) => dispatch({ type: "SET_VIEW", view }),
      setUser: (user) => dispatch({ type: "SET_USER", user }),
      upsertGuard: (guard) => dispatch({ type: "UPSERT_GUARD", guard }),
      deleteGuard: (id) => dispatch({ type: "DELETE_GUARD", id }),
      upsertSite: (site) => dispatch({ type: "UPSERT_SITE", site }),
      deleteSite: (id) => dispatch({ type: "DELETE_SITE", id }),
      upsertShift: (shift) => dispatch({ type: "UPSERT_SHIFT", shift }),
      deleteShift: (id) => dispatch({ type: "DELETE_SHIFT", id }),
      upsertIncident: (incident) => dispatch({ type: "UPSERT_INCIDENT", incident }),
      deleteIncident: (id) => dispatch({ type: "DELETE_INCIDENT", id }),
      addMessage: (message) => dispatch({ type: "ADD_MESSAGE", message }),
      markMessagesRead: (guardId) =>
        dispatch({ type: "MARK_MESSAGES_READ", guardId }),
      addCall: (call) => dispatch({ type: "ADD_CALL", call }),
      updateCall: (call) => dispatch({ type: "UPDATE_CALL", call }),
      deleteCall: (id) => dispatch({ type: "DELETE_CALL", id }),
      updateVoicemail: (voicemail) =>
        dispatch({ type: "UPDATE_VOICEMAIL", voicemail }),
      deleteVoicemail: (id) => dispatch({ type: "DELETE_VOICEMAIL", id }),
      pushNotification,
      dismissNotification: (id) =>
        dispatch({ type: "DISMISS_NOTIFICATION", id }),
      markNotificationRead: (id) =>
        dispatch({ type: "MARK_NOTIFICATION_READ", id }),
      markAllNotificationsRead: () =>
        dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" }),
      clearNotifications: () => dispatch({ type: "CLEAR_NOTIFICATIONS" }),
      resolveSwap: (id, approve, reassignTo) =>
        dispatch({ type: "RESOLVE_SWAP", id, approve, reassignTo }),
      resolveTimeOff: (id, approve) =>
        dispatch({ type: "RESOLVE_TIMEOFF", id, approve }),
      triggerPanic,
      resolvePanic,
      toast,
      removeToast: (id) => dispatch({ type: "REMOVE_TOAST", id }),
      nextId,
      startGlobalCall: (guardId, number) => {
        const id = ++idCounter.current;
        const g = guardId ? state.guards.find(x => x.id === guardId) : null;
        const call: CallLog = {
          id,
          guardId: guardId || 0,
          extension: g?.extension || 0,
          startedAt: new Date(),
          outcome: "answered",
          isActive: true,
          notes: number ? `Call to ${number}` : `Call to ${g?.name}`
        };
        dispatch({ type: "ADD_CALL", call });
        dispatch({ type: "START_GLOBAL_CALL", call });
      },
      setGlobalCallState: (state) => dispatch({ type: "SET_CALL_STATE", state }),
      setGlobalCallMuted: (muted) => dispatch({ type: "SET_CALL_MUTED", muted }),
      setGlobalCallMinimized: (minimized) => dispatch({ type: "SET_CALL_MINIMIZED", minimized }),
      endGlobalCall: () => {
        if (state.activeCall) {
          const dur = Math.floor((Date.now() - state.activeCall.data.startedAt.getTime()) / 1000);
          dispatch({ 
            type: "UPDATE_CALL", 
            call: { ...state.activeCall.data, isActive: false, endedAt: new Date(), duration: dur } 
          });
        }
        dispatch({ type: "END_GLOBAL_CALL" });
      },
    }),
    [state, pushNotification, triggerPanic, resolvePanic, toast, nextId]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

// Live clock hook
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
