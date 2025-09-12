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
  altLinkText?: string;
  altLinkTo?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop with light gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />

      {/* Centered card */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(520px, 92vw)",
        }}
      >
        <div className="rounded-2xl border border-slate-200 shadow-xl bg-white p-6 sm:p-8">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">{title}</h1>
            {altLinkText && altLinkTo && (
              <Link
                to={altLinkTo}
                className="text-sm text-emerald-700 hover:underline"
              >
                {altLinkText}
              </Link>
            )}
          </div>

          {subtitle && (
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          )}

          <div className="mt-6">{children}</div>

          {footer && <div className="mt-6">{footer}</div>}

          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} VetCare+. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
