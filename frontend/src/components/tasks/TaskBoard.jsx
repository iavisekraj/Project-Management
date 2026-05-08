import { useState } from "react";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard.jsx";
import { STATUS_LABEL, STATUS_COLORS } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const COLUMNS = ["todo", "in_progress", "review", "done"];

export default function TaskBoard({
  tasks = [],
  onTaskClick,
  onStatusChange,
  onAddTask,
  canEdit = true,
}) {
  const [dragOver, setDragOver] = useState(null);

  const grouped = COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((status) => {
        const cfg = STATUS_COLORS[status];
        const list = grouped[status];
        return (
          <div
            key={status}
            onDragOver={(e) => {
              if (!canEdit) return;
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              if (!canEdit) return;
              e.preventDefault();
              const id = e.dataTransfer.getData("text/task-id");
              const fromStatus = e.dataTransfer.getData("text/from-status");
              setDragOver(null);
              if (id && fromStatus !== status) onStatusChange?.(id, status);
            }}
            className={cn(
              "rounded-xl border bg-slate-50/60 p-3 flex flex-col min-h-[320px] transition",
              dragOver === status
                ? "border-brand-400 bg-brand-50/60"
                : "border-slate-200"
            )}
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                <h3 className="text-sm font-semibold text-slate-700">
                  {STATUS_LABEL[status]}
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  {list.length}
                </span>
              </div>
              {onAddTask && canEdit && (
                <button
                  onClick={() => onAddTask(status)}
                  className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-600 transition"
                  aria-label="Add task"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-2.5">
              {list.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">
                  Drop tasks here
                </div>
              ) : (
                list.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={() => onTaskClick?.(task)}
                    draggable={canEdit}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/task-id", task._id);
                      e.dataTransfer.setData("text/from-status", task.status);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
