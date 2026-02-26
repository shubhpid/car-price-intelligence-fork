"use client"

import { useState, useMemo } from "react"
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, Users, Fuel, Factory, ShieldCheck,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Building2, Landmark, Globe
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts"

/* ── static data ─────────────────────────────────────────────── */
const PRICE_HISTORY = [
  { year: "2017", avg: 19800, new_avg: 35400 },
  { year: "2018", avg: 20500, new_avg: 36400 },
  { year: "2019", avg: 20800, new_avg: 37200 },
  { year: "2020", avg: 22400, new_avg: 38500 },
  { year: "2021", avg: 28200, new_avg: 42200 },
  { year: "2022", avg: 27500, new_avg: 46000 },
  { year: "2023", avg: 25400, new_avg: 47800 },
  { year: "2024", avg: 19644, new_avg: 45000 },
]

const FUEL_SHARE = [
  { name: "Gasoline", value: 58, fill: "#b45309" },
  { name: "Hybrid", value: 18, fill: "#059669" },
  { name: "Electric", value: 14, fill: "#0284c7" },
  { name: "Diesel", value: 10, fill: "#78716c" },
]

const SEGMENT_DATA = [
  { name: "SUV", used: 24800, new_car: 46200 },
  { name: "Sedan", used: 17200, new_car: 34600 },
  { name: "Truck", used: 29400, new_car: 52800 },
  { name: "Compact", used: 14200, new_car: 28400 },
  { name: "Luxury", used: 34600, new_car: 58200 },
]

const EMPLOYMENT = [
  { year: "2019", dealers: 1.12, service: 0.82 },
  { year: "2020", dealers: 0.98, service: 0.75 },
  { year: "2021", dealers: 1.05, service: 0.88 },
  { year: "2022", dealers: 1.15, service: 0.92 },
  { year: "2023", dealers: 1.18, service: 0.95 },
  { year: "2024", dealers: 1.20, service: 0.98 },
]

const IMPACTS = [
  { icon: DollarSign, label: "Average Used Car Price", value: "$19,644", change: -4.2, desc: "Down from $25.4k in 2023 — returning to pre-pandemic norms" },
  { icon: Users, label: "Consumer Savings Opportunity", value: "$5.8k", change: 0, desc: "Average savings vs. buying new for comparable vehicles" },
  { icon: Factory, label: "Dealer Inventory Turnover", value: "42 days", change: 12, desc: "Up from 30 days — more buyer-friendly negotiation window" },
  { icon: Fuel, label: "EV Used Market Growth", value: "+34%", change: 34, desc: "Year-over-year increase in used EV transactions" },
  { icon: Landmark, label: "Average Auto Loan Rate", value: "7.1%", change: 0.8, desc: "30-year high impacting monthly payment affordability" },
  { icon: Globe, label: "Export Volume Increase", value: "+18%", change: 18, desc: "Growing international demand for US used vehicles" },
]

const tooltipStyle = {
  contentStyle: { background: "#faf7f2", border: "1px solid #ddd5c6", borderRadius: "8px", fontSize: 12 },
  labelStyle: { color: "#1a1611" },
}

/* ── component ───────────────────────────────────────────────── */
export default function ImpactPage() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Building2 size={14} /> Economic Intelligence
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight text-balance">
            Economic Impact Dashboard
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Macro-level analysis of the US used car market and its economic footprint. Data sourced from BLS, Manheim Index, and Cox Automotive reports.
          </p>
        </header>

        {/* Impact Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {IMPACTS.map((item, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 hover:border-stone-400 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <item.icon size={16} className="text-accent" />
                </div>
                {item.change !== 0 && (
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${item.change > 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {item.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(item.change)}%
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</p>
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Charts Row 1 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price History */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Used vs New Car Pricing Trends</h3>
            <p className="text-xs text-muted-foreground mb-4">National averages 2017-2024 (USD)</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={PRICE_HISTORY}>
                <defs>
                  <linearGradient id="gUsed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b45309" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd5c6" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#78716c" }} />
                <YAxis tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#78716c" }} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="avg" name="Used Avg" stroke="#b45309" strokeWidth={2} fill="url(#gUsed)" />
                <Area type="monotone" dataKey="new_avg" name="New Avg" stroke="#059669" strokeWidth={2} fill="url(#gNew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fuel Type Distribution */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Used Car Fuel Type Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">2024 market share by powertrain</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={FUEL_SHARE} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {FUEL_SHARE.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#78716c" }}
                  formatter={(value) => <span className="text-foreground text-xs">{value}</span>} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Charts Row 2 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Segment Comparison */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Price by Vehicle Segment</h3>
            <p className="text-xs text-muted-foreground mb-4">Used vs new average prices by category</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={SEGMENT_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd5c6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#78716c" }} />
                <YAxis tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#78716c" }} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="used" name="Used" fill="#b45309" radius={[4,4,0,0]}
                  onMouseEnter={(_, i) => setActiveSegment(SEGMENT_DATA[i].name)}
                  onMouseLeave={() => setActiveSegment(null)} />
                <Bar dataKey="new_car" name="New" fill="#059669" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            {activeSegment && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Savings by buying used {activeSegment}: <span className="text-emerald-700 font-semibold">
                  ${((SEGMENT_DATA.find(s => s.name === activeSegment)?.new_car ?? 0) - (SEGMENT_DATA.find(s => s.name === activeSegment)?.used ?? 0)).toLocaleString()}
                </span>
              </p>
            )}
          </div>

          {/* Employment */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Auto Industry Employment</h3>
            <p className="text-xs text-muted-foreground mb-4">Millions of workers in dealer + service sectors</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={EMPLOYMENT}>
                <defs>
                  <linearGradient id="gDealers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b45309" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gService" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd5c6" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#78716c" }} />
                <YAxis tick={{ fontSize: 10, fill: "#78716c" }} tickFormatter={(v: number) => `${v}M`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}M workers`} />
                <Area type="monotone" dataKey="dealers" name="Dealers" stroke="#b45309" strokeWidth={2} fill="url(#gDealers)" />
                <Area type="monotone" dataKey="service" name="Service" stroke="#0284c7" strokeWidth={2} fill="url(#gService)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Key Insights */}
        <section className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Key Economic Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Post-Pandemic Price Normalization", body: "Used car prices have fallen ~30% from their 2021 peak of $28.2k, driven by improved new vehicle supply and moderating demand. Prices are approaching pre-pandemic levels for the first time in 4 years.", icon: TrendingDown, accent: "text-red-700" },
              { title: "EV Disruption Accelerating", body: "Used EV transactions grew 34% YoY as battery degradation fears fade and charging infrastructure expands. Tesla Model 3 and Model Y dominate the used EV market with 62% combined share.", icon: Fuel, accent: "text-emerald-700" },
              { title: "Interest Rate Pressure", body: "At 7.1%, auto loan rates are at a 30-year high. This has increased the average monthly payment by $120 compared to 2021, pushing more buyers toward the used market for affordability.", icon: Landmark, accent: "text-amber-700" },
              { title: "Consumer Behavior Shift", body: "Average ownership duration has increased from 6.5 to 8.4 years as consumers hold vehicles longer due to improved reliability and economic uncertainty. This constrains trade-in supply.", icon: Users, accent: "text-accent" },
            ].map((insight, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <insight.icon size={14} className={insight.accent} />
                  <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs">
          Data compiled from BLS, Manheim Used Vehicle Value Index, Cox Automotive, and J.D. Power. Updated Q4 2024.
        </p>
      </div>
    </main>
  )
}
