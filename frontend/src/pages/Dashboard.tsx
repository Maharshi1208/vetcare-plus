import { TrendingUp, Users2, PawPrint, Stethoscope } from "lucide-react";

function Stat({ title, value, change, icon: Icon }:{
  title: string; value: string; change?: string; icon: any;
}) {
  return (
    <div className="vc-card p-4">
      <div className="flex items-start justify-between">
        <div className="vc-muted">{title}</div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        {change && (
          <span className="vc-chip border-emerald-200 text-emerald-700 bg-emerald-50">
            <TrendingUp className="h-3 w-3" /> {change}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* hero / highlight card */}
      <div className="vc-card overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="text-xs uppercase tracking-wide text-slate-500">Website Analytics</div>
            <h2 className="mt-1 text-2xl font-semibold">Total 28.5% Conversion Rate</h2>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { k: "Sessions", v: "3.1k" },
                { k: "Page Views", v: "12k" },
                { k: "Leads", v: "1.2k" },
                { k: "Conversions", v: "12%" },
              ].map((x) => (
                <div key={x.k} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">{x.k}</div>
                  <div className="text-lg font-semibold">{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-600 text-white p-6">
            <div className="text-sm/5 opacity-90">Average Daily Sales</div>
            <div className="mt-1 text-2xl font-semibold">$28,450</div>
            <div className="mt-6 h-24 rounded-xl bg-white/15"></div>
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total Pets" value="1,268" change="+3.1%" icon={PawPrint} />
        <Stat title="Appointments Today" value="164" change="+1.8%" icon={Users2} />
        <Stat title="Active Vets" value="27" change="+0.5%" icon={Stethoscope} />
        <Stat title="Revenue (MTD)" value="$42.5k" change="+18.2%" icon={TrendingUp} />
      </div>

      {/* charts area (placeholders) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="vc-card p-4 lg:col-span-2 h-[360px]">
          <div className="vc-muted">Appointments per Day</div>
          <div className="mt-4 grid h-[290px] place-items-center text-slate-400">
            {/* plug a real chart later */}
            Chart goes here
          </div>
        </div>
        <div className="vc-card p-4 h-[360px]">
          <div className="vc-muted">Species Mix</div>
          <div className="mt-4 grid h-[290px] place-items-center text-slate-400">
            Chart goes here
          </div>
        </div>
      </div>
    </div>
  );
}
