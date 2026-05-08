import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ChevronDown, LogOut, UserCircle2, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Avatar from "../ui/Avatar.jsx";
import { RolePill } from "../ui/StatusBadge.jsx";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs text-slate-500">Welcome back</p>
          <p className="text-sm font-semibold text-slate-900">
            {user?.name?.split(" ")[0] || "there"} 👋
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition"
          >
            <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-tight">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {user?.email}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-card overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar name={user?.name} src={user?.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <RolePill role={user?.role} />
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <UserCircle2 className="h-4 w-4 text-slate-400" />
                  Profile settings
                </button>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
