import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  fullWidth?: boolean;
};

export default function Button({ className, loading, disabled, fullWidth, children, ...rest }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
        fullWidth && "w-full",
        // theme gradient
        "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600",
        "text-white shadow-md",
        // hover/active states
        "hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700",
        "active:scale-[0.98]",
        // disabled state
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
