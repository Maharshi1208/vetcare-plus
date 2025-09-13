import React from "react";
import { Link } from "react-router-dom";

export default function ModalAuthLayout({
  title,
  subtitle,
  altLinkText,
  altLinkTo,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  /** top-right link text, e.g. "I don't have an account" or "I already have an account" */
  altLinkText?: string;
  /** href for that link, e.g. "/register" or "/login" */
  altLinkTo?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop (dim + blur) */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Centered modal card */}
      <div className="relative z-50 min-h-full grid place-items-center p-4">
        <div className="w-[92vw] max-w-[520px] rounded-2xl border shadow-2xl
                        bg-white dark:bg-slate-900
                        border-slate-200/70 dark:border-slate-700
                        p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h1>
            {altLinkText && altLinkTo && (
              <Link
                to={altLinkTo}
                className="ml-auto text-sm text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {altLinkText}
              </Link>
            )}
          </div>

          {subtitle && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
          )}

          <div className="mt-6">{children}</div>

          {footer && <div className="mt-6">{footer}</div>}

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} VetCare+. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
