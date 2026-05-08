import { Link } from "react-router-dom";
import { Calendar, CheckSquare } from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import { StatusPill, PriorityPill } from "../ui/StatusBadge.jsx";
import { AvatarGroup } from "../ui/Avatar.jsx";
import { fmtDate } from "../../utils/format.js";

export default function ProjectCard({ project }) {
  const dueSoon =
    project.dueDate &&
    new Date(project.dueDate) - new Date() < 1000 * 60 * 60 * 24 * 7 &&
    project.status !== "completed";

  return (
    <Link to={`/projects/${project._id}`} className="block group">
      <Card className="h-full transition hover:shadow-card group-hover:-translate-y-0.5">
        <div className="h-1.5 rounded-t-xl" style={{ background: project.color }} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate group-hover:text-brand-700 transition">
                {project.name}
              </h3>
              {project.description && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <PriorityPill priority={project.priority} />
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <StatusPill status={project.status} />
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <CheckSquare className="h-3.5 w-3.5" />
              {project.taskCount || 0} tasks
            </span>
            {project.dueDate && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs ${
                  dueSoon ? "text-rose-600 font-medium" : "text-slate-500"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {fmtDate(project.dueDate, "MMM d")}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <AvatarGroup users={project.members || []} max={4} />
            <span className="text-xs text-slate-400">
              {project.owner?.name?.split(" ")[0]}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
