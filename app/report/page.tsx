"use client"

import { useState } from "react"
import {
  FileText, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, XCircle,
  TrendingUp, TrendingDown, Minus, Shield, Brain, BarChart3, Target, Clock,
  DollarSign, Activity, ArrowUpRight, ArrowDownRight, Gauge
} from "lucide-react"

/* ── Demo Report Data ────────────────────────────────────────── */
const DEMO_REPORT = {
  vehicle: { year: 2020, make: "Honda", model: "Civic", mileage: 55000, condition: "Good", region: "Florida" },
  signal: "BUY NOW",
  confidence: 87,
  estimated_price: 18200,
  forecast_30d: 18800,
  forecast_90d: 19400,
  risk_score: 28,
  reasoning: [
    "Honda Civic 2020 is priced 10.2% below market median for this make/model/year combination in Florida.",
    "Demand-supply ratio of 1.34 indicates seller\'s market conditions, but current listing is underpriced relative to peers.",
    "Historical depreciation curve suggests this model has passed its steepest decline phase — stable value retention expected.",
    "Regional analysis shows Florida has 12% higher inventory turnover for compact sedans, indicating strong buyer interest.",
    "Ethics agent confirms no discriminatory pricing patterns detected for this vehicle category and region.",
  ],
  agents: [
    { name: "Data Agent", status: "ok", finding: "Valid pricing data from 2,847 comparable listings" },
    { name: "Forecast Agent", status: "ok", finding: "30d: +$600 | 90d: +$1,200 based on seasonal demand patterns" },
    { name: "Risk Agent", status: "ok", finding: "Risk score 28/100 — low volatility, strong fundamentals" },
    { name: "Trend Agent", status: "ok", finding: "Compact sedan segment showing +2.1% quarterly momentum" },
    { name: "Ethics Agent", status: "ok", finding: "No bias flags — pricing consistent across demographics" },
    { name: "Explanation Agent", status: "ok", finding: "5 interpretable factors identified via SHAP analysis" },
    { name: "Decision Agent", status: "ok", finding: "BUY NOW at 87% confidence — underpriced with strong outlook" },
  ],
  factors: [
    { feature: "Model Year", impact: 2840, direction: "increases" },
    { feature: "Brand (Honda)", impact: 1920, direction: "increases" },
    { feature: "Mileage (55k)", impact: -1340, direction: "decreases" },
    { feature: "Region (FL)", impact: 680, direction: "increases" },
    { feature: "Condition (Good)", impact: 540, direction: "increases" },
  ],
}

const signalConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  "BUY NOW": { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: TrendingUp },
  "WAIT": { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: TrendingDown },
  "MONITOR": { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Minus },
}

/* ── Collapsible Section ─────────────────────────────────────── */
function Section({ title, icon: Icon, defaultOpen = true, children }: {
  title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/50 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon size={15} className="text-accent" />
        </div>
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        {open ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export default function ReportPage() {
  const r = DEMO_REPORT
  const sig = signalConfig[r.signal] ?? signalConfig["MONITOR"]
  const SigIcon = sig.icon
  const chg30d = ((r.forecast_30d - r.estimated_price) / r.estimated_price * 100).toFixed(1)
  const chg90d = ((r.forecast_90d - r.estimated_price) / r.estimated_price * 100).toFixed(1)

  return (
    <main className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <FileText size={14} /> Decision Report
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}
          </h1>
          <p className="text-muted-foreground text-sm">
            {Number(r.vehicle.mileage).toLocaleString()} miles &middot; {r.vehicle.condition} condition &middot; {r.vehicle.region}
          </p>
        </header>

        {/* Signal Banner */}
        <div className={`${sig.bg} ${sig.border} border rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${sig.bg} border ${sig.border} flex items-center justify-center`}>
              <SigIcon size={20} className={sig.color} />
            </div>
            <div>
              <p className={`text-lg font-bold ${sig.color}`}>{r.signal}</p>
              <p className="text-xs text-muted-foreground">AI-generated recommendation</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Confidence</p>
              <p className={`text-xl font-bold ${sig.color}`}>{r.confidence}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Risk</p>
              <p className="text-xl font-bold text-foreground">{r.risk_score}<span className="text-xs text-muted-foreground">/100</span></p>
            </div>
          </div>
        </div>

        {/* Price Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Estimated Value", value: `$${r.estimated_price.toLocaleString()}`, icon: DollarSign, sub: null },
            { label: "30-Day Forecast", value: `$${r.forecast_30d.toLocaleString()}`, icon: TrendingUp, sub: `+${chg30d}%` },
            { label: "90-Day Forecast", value: `$${r.forecast_90d.toLocaleString()}`, icon: Target, sub: `+${chg90d}%` },
            { label: "Risk Score", value: `${r.risk_score}/100`, icon: Gauge, sub: "Low Risk" },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className="text-accent" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              {stat.sub && <p className="text-xs text-emerald-700 font-medium mt-0.5">{stat.sub}</p>}
            </div>
          ))}
        </div>

        {/* Reasoning */}
        <Section title="AI Reasoning" icon={Brain}>
          <div className="space-y-3">
            {r.reasoning.map((bullet, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-accent">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Agent Pipeline */}
        <Section title="Agent Pipeline Status" icon={Activity} defaultOpen={false}>
          <div className="space-y-2">
            {r.agents.map((agent, i) => {
              const statusCfg: Record<string, { icon: any; color: string; bg: string }> = {
                ok: { icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100" },
                fallback: { icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-100" },
                error: { icon: XCircle, color: "text-red-700", bg: "bg-red-100" },
              }
              const cfg = statusCfg[agent.status] ?? statusCfg.ok
              const StatusIcon = cfg.icon
              return (
                <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3 border border-border">
                  <div className={`w-6 h-6 rounded-md ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <StatusIcon size={12} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{agent.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cfg.bg} ${cfg.color}`}>{agent.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{agent.finding}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* SHAP Factors */}
        <Section title="Key Price Factors (SHAP)" icon={BarChart3} defaultOpen={false}>
          <div className="space-y-3">
            {r.factors.map((f, i) => {
              const maxImpact = Math.max(...r.factors.map(x => Math.abs(x.impact)))
              const pct = Math.abs(f.impact) / maxImpact * 100
              const isPositive = f.direction === "increases"
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground capitalize">{f.feature}</span>
                    <span className={`font-bold ${isPositive ? "text-emerald-700" : "text-red-700"}`}>
                      {isPositive ? "+" : "-"}${Math.abs(f.impact).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isPositive ? "bg-emerald-600" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Ethics */}
        <Section title="Ethics & Fairness" icon={Shield} defaultOpen={false}>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-emerald-700" />
              <span className="text-sm font-semibold text-emerald-800">No Bias Detected</span>
            </div>
            <p className="text-xs text-emerald-700/80 leading-relaxed">
              The ethics agent analyzed pricing patterns across all demographic and geographic segments for this vehicle category.
              No discriminatory pricing disparities were identified. The recommendation is consistent regardless of buyer profile.
            </p>
          </div>
        </Section>

        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This is a demo report generated with static data. In production, the multi-agent pipeline processes real-time market data
            from 2.8M+ listings. Recommendations are AI-generated and should not be the sole basis for purchasing decisions.
          </p>
        </div>
      </div>
    </main>
  )
}
