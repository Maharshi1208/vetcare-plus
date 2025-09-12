import React from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function PasswordInput({ label, error, className, id, ...rest }: Props) {
  const [show, setShow] = React.useState(false);
  const inputId = id || rest.name || crypto.randomUUID();

  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-900 dark:text-slate-100">{label}</label>}
      <div className="relative">
        <input
          id={inputId}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          className={clsx(
            // size & spacing
            "w-full h-11 rounded-xl pl-3 pr-12",
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
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
