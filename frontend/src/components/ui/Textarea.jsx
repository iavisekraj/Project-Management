import { forwardRef, useId } from "react";
import { cn } from "../../utils/cn.js";

const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, rows = 4, id: idProp, ...props },
  ref
) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={cn(
          "block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition shadow-sm",
          "focus:outline-none focus:border-brand-500 focus:shadow-focus",
          error
            ? "border-rose-300 focus:border-rose-500 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.15)]"
            : "border-slate-200",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
