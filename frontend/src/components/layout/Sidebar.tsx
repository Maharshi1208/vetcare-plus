import { NavLink } from "react-router-dom";
import { LayoutDashboard, PawPrint, CalendarDays, Stethoscope, LogOut } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pets", label: "Pets", icon: PawPrint },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/vets", label: "Vets", icon: Stethoscope },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r bg-white shadow-sm">
      {/* Logo */}
      <div className="p-6 text-xl font-bold tracking-tight text-sky-700">
        VetCare<span className="text-slate-900">+</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
              ${isActive ? "bg-sky-100 text-sky-700 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          onClick={() => {
            localStorage.removeItem("access");
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}