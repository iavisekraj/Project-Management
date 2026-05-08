import { forwardRef, useId } from "react";
import { cn } from "../../utils/cn.js";

const Input = forwardRef(function Input(
  { label, error, hint, leftIcon, rightIcon, className, id: idProp, ...props },
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
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "block w-full h-10 rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition shadow-sm",
            "focus:outline-none focus:border-brand-500 focus:shadow-focus",
            "disabled:bg-slate-50 disabled:text-slate-500",
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            error
              ? "border-rose-300 focus:border-rose-500 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.15)]"
              : "border-slate-200",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
