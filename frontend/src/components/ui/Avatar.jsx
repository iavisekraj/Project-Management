import { cn } from "../../utils/cn.js";
import { getInitials } from "../../utils/format.js";

const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const colors = [
  "bg-brand-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-teal-500",
];

function pickColor(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}

export default function Avatar({
  name = "",
  src,
  size = "md",
  className,
  ring = false,
}) {
  const initials = getInitials(name) || "?";
  const color = pickColor(name);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white select-none overflow-hidden flex-shrink-0",
        sizes[size],
        ring && "ring-2 ring-white",
        !src && color,
        className
      )}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export function AvatarGroup({ users = [], max = 4, size = "sm" }) {
  const visible = users.slice(0, max);
  const rest = users.length - visible.length;
  return (
    <div className="flex -space-x-2">
      {visible.map((u) => (
        <Avatar key={u._id || u.email} name={u.name} src={u.avatarUrl} size={size} ring />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold ring-2 ring-white",
            sizes[size]
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
