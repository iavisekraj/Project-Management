import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn.js";

const Select = forwardRef(function Select(
  { label, error, hint, options = [], className, id: idProp, children, ...props },
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
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={cn(
            "block w-full h-10 appearance-none rounded-lg border bg-white px-3 pr-9 text-sm text-slate-900 transition shadow-sm",
            "focus:outline-none focus:border-brand-500 focus:shadow-focus",
            error
              ? "border-rose-300 focus:border-rose-500"
              : "border-slate-200",
            className
          )}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          aria-hidden
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default Select;
