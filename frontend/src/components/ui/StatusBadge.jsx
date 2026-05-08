import { cn } from "../../utils/cn.js";
import {
  STATUS_LABEL,
  STATUS_COLORS,
  PRIORITY_LABEL,
  PRIORITY_COLORS,
  ROLE_COLORS,
} from "../../utils/format.js";

export function StatusPill({ status, className }) {
  const cfg = STATUS_COLORS[status] || STATUS_COLORS.todo;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.bg,
        cfg.text,
        cfg.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function PriorityPill({ priority, className }) {
  const cfg = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.bg,
        cfg.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {PRIORITY_LABEL[priority] || priority}
    </span>
  );
}

export function RolePill({ role, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        ROLE_COLORS[role] || ROLE_COLORS.member,
        className
      )}
    >
      {role}
    </span>
  );
}
