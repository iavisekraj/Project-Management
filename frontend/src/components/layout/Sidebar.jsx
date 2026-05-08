import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  UserCircle2,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { cn } from "../../utils/cn.js";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/users", label: "Team", icon: Users, roles: ["admin", "manager"] },
  { to: "/profile", label: "Profile", icon: UserCircle2 },
];

export default function Sidebar({ open, onClose }) {
  const { hasRole } = useAuth();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 lg:z-0 h-screen w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-soft">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Pulse
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {items.map((item) => {
            if (item.roles && !hasRole(...item.roles)) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 p-4">
            <p className="text-xs font-semibold text-brand-700">Pro tip</p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Use filters and the Kanban board to track work-in-progress at a glance.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
