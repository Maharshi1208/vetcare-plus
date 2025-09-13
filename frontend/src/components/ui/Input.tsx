import React from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export default function Input({ label, error, hint, className, id, ...rest }: Props) {
  const inputId = id || rest.name || crypto.randomUUID();
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-900 dark:text-slate-100">{label}</label>}
      <input
        id={inputId}
        aria-invalid={!!error}
        className={clsx(
          // size & spacing
          "w-full h-11 rounded-xl px-3",
          // base colors
          "bg-white text-slate-900 placeholder:text-slate-400",
          "dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400",
          // border & focus
          "border border-slate-300 dark:border-slate-700",
          "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500",
          // error
          error && "border-red-500 focus:ring-red-300 focus:border-red-500",
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
