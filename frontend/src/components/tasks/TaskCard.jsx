import { Calendar, MessageSquare, MoreVertical } from "lucide-react";
import { isAfter, isBefore } from "date-fns";
import Avatar from "../ui/Avatar.jsx";
import { PriorityPill } from "../ui/StatusBadge.jsx";
import { fmtDate } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

export default function TaskCard({ task, onClick, draggable = false, onDragStart }) {
  const overdue =
    task.dueDate &&
    task.status !== "done" &&
    isBefore(new Date(task.dueDate), new Date());

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        "group rounded-xl border border-slate-200 bg-white p-3.5 shadow-soft hover:shadow-card hover:border-slate-300 transition cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700 transition">
          {task.title}
        </h4>
        <PriorityPill priority={task.priority} />
      </div>

      {task.description && (
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                overdue ? "text-rose-600 font-semibold" : "text-slate-500"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              {fmtDate(task.dueDate, "MMM d")}
            </span>
          )}
        </div>
        {task.assignee ? (
          <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size="xs" />
        ) : (
          <div className="h-6 w-6 rounded-full border border-dashed border-slate-300" />
        )}
      </div>
    </div>
  );
}
