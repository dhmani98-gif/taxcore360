import { TrendingUp, Calendar, AlertCircle, Building2, Wallet } from "lucide-react";

type TrendPoint = {
  month: string;
  label: string;
  paidCount: number;
  x: number;
  y: number;
};

type ExecutiveTrendChart = {
  chartWidth: number;
  chartHeight: number;
  leftPadding: number;
  rightPadding: number;
  areaPath: string;
  linePath: string;
  points: TrendPoint[];
  yTicks: Array<{ y: number; value: number }>;
};

type ExecutiveDepartmentRow = {
  department: string;
  employees: number;
  gross: number;
  employerTaxes: number;
};

type ExecutiveShareRow = ExecutiveDepartmentRow & {
  color: string;
  share: number;
};

type ExecutiveViewProps = {
  form941CountdownDays: number;
  daysLeftToFile1099: number;
  executiveTrendChart: ExecutiveTrendChart;
  executiveTrendSummary: {
    monthlyAverage: number;
    totalPaid: number;
    currentMonthGrowth: number;
  };
  executiveDepartmentShareRows: ExecutiveShareRow[];
  executiveDonutBackground: string;
  leadingDepartment: ExecutiveShareRow | null;
  executiveDepartmentRows: ExecutiveDepartmentRow[];
  toUsd: (value: number) => string;
};

export function ExecutiveView({
  form941CountdownDays,
  daysLeftToFile1099,
  executiveTrendChart,
  executiveTrendSummary,
  executiveDepartmentShareRows,
  executiveDonutBackground,
  leadingDepartment,
  executiveDepartmentRows,
  toUsd,
}: ExecutiveViewProps) {
  return (
    <div className="space-y-8 p-6 lg:p-8 animate-fade-in">
      {/* ── Header Recap & Deadlines ──────────────── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col justify-center relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -z-10" />
          <h2 className="text-[32px] md:text-[36px] font-black tracking-tighter text-slate-900 leading-tight">
            Executive <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-800">Intelligence</span>
          </h2>
          <p className="mt-2 text-[15px] font-medium text-slate-500/90 leading-relaxed max-w-xl">
            Real-time Monitoring & compliance engine for Q1 2026.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="group flex-1 relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-amber-50/90 to-amber-100/40 p-5 shadow-[0_8px_30px_rgb(245,158,11,0.05)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.25)] hover:border-amber-200/60">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100/80 shadow-inner">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-800/80">Form 941</span>
              </div>
              <p className="text-[28px] font-black text-slate-900 tabular-nums tracking-tight">{form941CountdownDays}D</p>
              <p className="text-[11px] font-bold text-amber-800/60 uppercase tracking-wide mt-1">Until Deadline</p>
            </div>
          </div>
          
          <div className="group flex-1 relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-blue-50/90 to-blue-100/40 p-5 shadow-[0_8px_30px_rgb(59,130,246,0.05)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.25)] hover:border-blue-200/60">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-400/20 to-transparent blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100/80 shadow-inner">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-800/80">1099-NEC</span>
              </div>
              <p className="text-[28px] font-black text-slate-900 tabular-nums tracking-tight">{daysLeftToFile1099}D</p>
              <p className="text-[11px] font-bold text-blue-800/60 uppercase tracking-wide mt-1">Remaining</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Primary Insights ──────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend Visualization */}
        <section className="lg:col-span-2 relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-72 w-72 rounded-full bg-slate-400/10 blur-[100px] pointer-events-none" />
          
          <div className="relative flex items-center justify-between mb-8">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1.5">Performance Trend</p>
              <h3 className="text-[22px] font-extrabold text-slate-900 tracking-tight">Gross Payroll Disbursement</h3>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 border border-slate-100/80 shadow-sm backdrop-blur-md">
               <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600"></span>
              </span>
              <span className="text-[12px] font-bold text-slate-700">Live Sync</span>
            </div>
          </div>

          <div className="relative h-72 w-full mt-4">
            <svg viewBox={`0 0 ${executiveTrendChart.chartWidth} ${executiveTrendChart.chartHeight}`} className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="glowLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                  <feOffset dx="0" dy="6" result="offsetblur" />
                  <feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer>
                  <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Grid Lines */}
              {executiveTrendChart.yTicks.map((tick) => (
                <g key={`y-${tick.value}`}>
                  <line x1={executiveTrendChart.leftPadding} x2={executiveTrendChart.chartWidth} y1={tick.y} y2={tick.y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" className="opacity-60" />
                  <text x="0" y={tick.y + 4} className="text-[11px] font-bold fill-slate-400 tracking-wider">{toUsd(tick.value).replace(".00", "")}</text>
                </g>
              ))}

              {/* Paths */}
              <path d={executiveTrendChart.areaPath} fill="url(#areaGrad)" />
              <path d={executiveTrendChart.linePath} fill="none" stroke="url(#glowLine)" strokeWidth="4" strokeLinecap="round" filter="url(#shadow)" className="drop-shadow-2xl" />

              {/* Points */}
              {executiveTrendChart.points.map((p) => (
                <g key={p.month} className="group/dot cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="8" fill="white" stroke="#3b82f6" strokeWidth="2.5" className="transition-all duration-500 ease-out group-hover/dot:r-10 group-hover/dot:stroke-[3px] shadow-xl" />
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" className="transition-all duration-300 group-hover/dot:fill-indigo-500 group-hover/dot:scale-110" />
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
             <div className="group rounded-3xl bg-white/50 border border-slate-100/60 p-5 transition-all duration-500 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 transition-colors group-hover:text-slate-500">Monthly Average</p>
                <p className="text-[22px] font-black text-slate-900 tracking-tight">{toUsd(executiveTrendSummary.monthlyAverage)}</p>
             </div>
             <div className="group rounded-3xl bg-white/50 border border-slate-100/60 p-5 transition-all duration-500 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 transition-colors group-hover:text-slate-500">Total YTD</p>
                <p className="text-[22px] font-black text-slate-900 tracking-tight">{toUsd(executiveTrendSummary.totalPaid)}</p>
             </div>
             <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 shadow-[0_8px_20px_rgb(37,99,235,0.25)] transition-all duration-500 hover:shadow-[0_15px_30px_rgb(37,99,235,0.4)] hover:-translate-y-1">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-1.5">Growth</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-[22px] font-black text-white tracking-tight">{executiveTrendSummary.currentMonthGrowth.toFixed(1)}%</p>
                </div>
             </div>
          </div>
        </section>

        {/* Composition Circle */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl flex flex-col">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 text-center mt-2">Cost Distribution</p>
          
          <div className="relative mx-auto h-56 w-56 transition-transform hover:scale-105 duration-700 ease-out group/donut flex-1 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-2xl group-hover/donut:bg-blue-500/10 transition-colors duration-700" />
            <div className="h-full w-full rounded-full drop-shadow-2xl" style={{ background: executiveDonutBackground, clipPath: 'circle(50% at 50% 50%)' }} />
            <div className="absolute inset-[36px] rounded-full bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgb(0,0,0,0.05)] border border-slate-50">
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Top Dept</p>
               <p className="text-[17px] font-black text-slate-900 leading-tight px-3 tracking-tight">{leadingDepartment?.department}</p>
               <div className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[13px] font-black text-blue-600 shadow-sm border border-slate-100 group-hover/donut:-translate-y-0.5 transition-transform duration-500">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: leadingDepartment?.color }} />
                  {(leadingDepartment?.share ?? 1 * 100).toFixed(1)}%
               </div>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {executiveDepartmentShareRows.slice(0, 4).map((row, i) => (
              <div key={row.department} className="group cursor-default" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between text-[12px] font-bold mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: row.color }} />
                    <span className="text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{row.department}</span>
                  </div>
                  <span className="text-slate-500 font-extrabold group-hover:text-blue-600 transition-colors">{(row.share * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out relative" 
                    style={{ width: `${row.share * 100}%`, backgroundColor: row.color }} 
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Department Detail Cards ──────────────── */}
      <section className="pt-6">
         <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100">
               <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-[22px] font-black text-slate-800 tracking-tight">Departmental Cost Integrity</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-6" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executiveDepartmentRows.map((row, i) => (
              <div 
                key={row.department} 
                className="group relative overflow-hidden rounded-[2rem] border border-white bg-gradient-to-b from-white to-slate-50/40 p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] hover:border-blue-100/50"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                 <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110">
                    <div className="h-10 w-10 rounded-[14px] bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center shadow-sm border border-blue-100/30">
                       <Wallet className="h-4 w-4 text-blue-600" />
                    </div>
                 </div>
                 
                 <div className="mb-6 relative z-10">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 transition-colors group-hover:text-blue-500/70">Cost Center</p>
                    <h4 className="text-[22px] font-black text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight leading-none">{row.department}</h4>
                 </div>

                 <div className="grid grid-cols-2 gap-5 relative z-10">
                    <div className="space-y-1 bg-white/60 rounded-2xl p-3.5 border border-slate-50 transition-all duration-300 group-hover:bg-white group-hover:shadow-sm">
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Gross Payroll</p>
                       <p className="text-[18px] font-black text-slate-800 tabular-nums">{toUsd(row.gross)}</p>
                    </div>
                    <div className="space-y-1 bg-blue-50/30 rounded-2xl p-3.5 border border-blue-50/50 transition-all duration-300 group-hover:bg-blue-50/80 group-hover:border-blue-100">
                       <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Tax Burden</p>
                       <p className="text-[18px] font-black text-blue-700 tabular-nums">{toUsd(row.employerTaxes)}</p>
                    </div>
                 </div>

                 <div className="mt-6 flex items-center justify-between border-t border-slate-100/80 pt-6 relative z-10">
                    <div className="flex -space-x-2.5">
                       {[...Array(Math.min(row.employees, 4))].map((_, i) => (
                         <div key={i} className="h-8 w-8 rounded-full border-[2.5px] border-white bg-slate-100 flex items-center justify-center shadow-sm hover:-translate-y-1 transition-transform relative z-10 hover:z-20 cursor-default">
                           <div className="h-full w-full rounded-full bg-gradient-to-tr from-slate-200 to-slate-100" />
                         </div>
                       ))}
                       {row.employees > 4 && (
                         <div className="h-8 w-8 rounded-full border-[2.5px] border-white bg-slate-50 flex items-center justify-center shadow-sm relative z-0">
                            <span className="text-[10px] font-black text-slate-500">+{row.employees - 4}</span>
                         </div>
                       )}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-green-400 transition-colors" />
                      <p className="text-[11px] font-bold text-slate-600 tracking-tight">{row.employees} Active</p>
                    </div>
                 </div>

                 {/* Decorative background glow that appears on hover */}
                 <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-blue-400/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}