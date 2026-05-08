import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn.js";

export default function Spinner({ className, size = "md" }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <Loader2
      className={cn("animate-spin text-brand-600", sizes[size], className)}
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
      <Spinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
