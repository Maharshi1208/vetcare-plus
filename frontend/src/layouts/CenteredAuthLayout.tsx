import React from "react";

export default function CenteredAuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen grid place-items-center p-4
      bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600
      dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/20 shadow-2xl
        bg-white/95 dark:bg-slate-900/90 backdrop-blur p-6 sm:p-8"
      >
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white drop-shadow-sm">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-center text-slate-700 dark:text-slate-300">
            {subtitle}
          </p>
        )}
        <div className="mt-6">{children}</div>
        {footer}
        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} VetCare+. All rights reserved.
        </p>
      </div>
    </div>
  );
}
