import React from "react";

export default function AuthLayout({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-xl border bg-white/90 dark:bg-slate-900/80 backdrop-blur">
        {/* Brand / illustration panel */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-emerald-600 text-white">
          <div>
            <div className="flex items-center gap-3">
              {/* optional logo: place an SVG/PNG in /src/assets and use <img src={logo} ... /> */}
              <div className="h-9 w-9 rounded-xl bg-white/20 grid place-items-center font-bold">V+</div>
              <span className="text-lg font-semibold">VetCare+</span>
            </div>
            <h2 className="mt-10 text-3xl font-semibold leading-tight">
              Caring for pets,<br />empowering clinics.
            </h2>
            <p className="mt-3 text-sm text-white/90">
              Secure access to appointments, medical history, invoices, and more.
            </p>
          </div>

          <div className="mt-8">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-sm">
                Tip: Use a strong password and keep your account secure.
              </p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-6 sm:p-8">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
            )}

            <div className="mt-6">
              {children}
            </div>

            <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} VetCare+. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
