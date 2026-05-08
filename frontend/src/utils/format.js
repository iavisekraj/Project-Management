import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function fmtDate(value, pattern = "MMM d, yyyy") {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return isValid(d) ? format(d, pattern) : "—";
}

export function fmtRelative(value) {
  if (!value) return "";
  const d = typeof value === "string" ? parseISO(value) : value;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "";
}

export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");
}

export const STATUS_LABEL = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Done",
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
};

export const PRIORITY_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_COLORS = {
  todo: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400", border: "border-slate-200" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  review: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  done: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  planning: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", border: "border-violet-200" },
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  on_hold: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  completed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  archived: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200" },
};

export const PRIORITY_COLORS = {
  low: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  medium: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  high: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  urgent: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

export const ROLE_COLORS = {
  admin: "bg-rose-50 text-rose-700 border-rose-200",
  manager: "bg-violet-50 text-violet-700 border-violet-200",
  member: "bg-slate-100 text-slate-700 border-slate-200",
};
