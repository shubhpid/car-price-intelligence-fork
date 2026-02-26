"use client"

import {
  Cpu, BarChart2, Scale, Layers, Zap, AlertTriangle, BookOpen
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts"
import MicroserviceFlowDiagram from "@/components/microservice-flow-diagram"

const STATIC_SHAP = [
  { feature: "log_odometer", importance: 0.3812, direction: "negative" },
  { feature: "car_age", importance: 0.2941, direction: "negative" },
  { feature: "model", importance: 0.1203, direction: "positive" },
  { feature: "make", importance: 0.0987, direction: "positive" },
  { feature: "condition", importance: 0.0734, direction: "positive" },
  { feature: "fuel", importance: 0.0521, direction: "positive" },
  { feature: "type", importance: 0.0418, direction: "positive" },
  { feature: "state", importance: 0.0312, direction: "positive" },
  { feature: "cylinders", importance: 0.0284, direction: "positive" },
  { feature: "drive", importance: 0.0198, direction: "positive" },
]

const DECISION_RULES = [
  { cond: "change \u2264 \u22123% AND confidence \u2265 75", result: "WAIT", badge: "bg-red-100 text-red-700 border-red-200", desc: "Price declining with high confidence." },
  { cond: "change \u2265 +2% AND volatility = Low", result: "BUY NOW", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", desc: "Rising prices with stable market." },
  { cond: "price \u2264 \u221210% vs median AND conf \u2265 75", result: "BUY NOW", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", desc: "Strong below-market deal." },
  { cond: "All other scenarios", result: "MONITOR", badge: "bg-amber-100 text-amber-700 border-amber-200", desc: "No strong signal \u2014 keep watching." },
]

const MODEL_ROWS = [
  { label: "Algorithm", value: "XGBoost Regressor" },
  { label: "Target", value: "log1p(price) \u2192 expm1 at inference" },
  { label: "Training data", value: "~262k listings (80% chronological split)" },
  { label: "Test data", value: "~66k listings (most recent 20% by date)" },
  { label: "Split method", value: "Chronological \u2014 zero data leakage" },
  { label: "Features", value: "19 total (car_age, log_odometer, make, model\u2026)" },
]

const DATA_SOURCES = [
  { color: "#0369a1", label: "Craigslist Dataset", detail: "Kaggle \u00b7 ~426k listings \u00b7 26 columns", tag: "Primary" },
  { color: "#047857", label: "Cleaning Pipeline", detail: "Colab T4 \u00b7 5-step clean \u2192 328k rows", tag: "Processed" },
  { color: "#7e22ce", label: "MongoDB Atlas", detail: "carmarket DB \u00b7 listings + price_snapshots \u00b7 175 MB", tag: "Storage" },
  { color: "#b45309", label: "OpenAI GPT-4o-mini", detail: "ExplanationAgent + ForecastAgent LLM blend", tag: "LLM" },
  { color: "#be185d", label: "Facebook Prophet", detail: "30/90-day price forecasting \u00b7 yearly seasonality", tag: "Forecast" },
  { color: "#92400e", label: "Multi-Agent Orchestrator", detail: "7 modular Python agents \u00b7 deterministic pipeline", tag: "Architecture" },
  { color: "#047857", label: "EthicsAgent", detail: "Transparency notes \u00b7 bias audit \u00b7 principled AI layer", tag: "Ethics" },
  { color: "#78716c", label: "Dataset Snapshot", detail: "Jan 2024 \u00b7 Static for demo \u00b7 update on demand", tag: "Freshness" },
]

const tooltipStyle = {
  contentStyle: { background: "#faf7f2", border: "1px solid #ddd5c6", borderRadius: "8px", fontSize: 12 },
  labelStyle: { color: "#1a1611" },
}

export default function TechPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
          <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-widest mb-3">
            <Layers size={12} />
            Principled AI &middot; Multi-Agent Architecture
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">
            System <span className="text-accent">Architecture</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            A modular 7-agent decision intelligence pipeline. Deterministic Python orchestration
            with GPT-4o-mini used only where human-level reasoning adds value —
            never for routing or decision-making.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8 pb-12">
        {/* Flow Diagram */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Layers size={18} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Microservice Architecture</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-semibold ml-1">Animated</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-semibold">Pub/Sub</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-semibold">Circuit Breaker</span>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            End-to-end request flow: API Gateway &rarr; Rate Limiter &rarr; Orchestrator &rarr; Pub/Sub event bus &rarr;
            sequential &amp; parallel agent phases &rarr; MongoDB + Redis &rarr; Structured Intel Report.
          </p>
          <MicroserviceFlowDiagram />
        </div>

        {/* Decision Rules */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Scale size={18} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Decision Rules</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold ml-1">
              Deterministic &middot; Auditable
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-5">
            DecisionAgent applies three ordered rules in pure Python — no LLM, no randomness.
            Every recommendation traces to exact numerical thresholds.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DECISION_RULES.map((r, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                    Rule {i + 1 <= 3 ? i + 1 : "\u2217"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border font-bold ${r.badge}`}>{r.result}</span>
                </div>
                <p className="text-foreground text-xs font-mono mb-1.5 leading-relaxed">{r.cond}</p>
                <p className="text-muted-foreground text-xs">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SHAP + Model Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 size={18} className="text-accent" />
              <h2 className="text-xl font-bold text-foreground">What Drives Car Prices?</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Global SHAP importance from 500 held-out test listings.{" "}
              <span className="text-emerald-700">Green</span> = increases price &middot;{" "}
              <span className="text-sky-700">Blue</span> = decreases price
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={STATIC_SHAP} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd5c6" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => v.toFixed(3)} tick={{ fontSize: 10, fill: "#78716c" }} />
                <YAxis type="category" dataKey="feature" width={130}
                  tickFormatter={(v: string) => v.replace(/_/g, " ")} tick={{ fontSize: 11, fill: "#1a1611" }} />
                <Tooltip {...tooltipStyle}
                  formatter={(v: number, _: any, p: any) => [v.toFixed(4), p.payload.direction === "positive" ? "Increases price" : "Decreases price"]} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {STATIC_SHAP.map((f, i) => (
                    <Cell key={i} fill={f.direction === "positive" ? "#047857" : "#0369a1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={18} className="text-accent" />
              <h2 className="text-xl font-bold text-foreground">Model Card</h2>
            </div>
            <div className="space-y-3 mb-6">
              {MODEL_ROWS.map(r => (
                <div key={r.label} className="flex gap-3 text-sm border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <span className="text-muted-foreground w-36 flex-shrink-0 font-medium">{r.label}</span>
                  <span className="text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap size={13} className="text-emerald-700" />
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Predicts well</p>
                </div>
                <ul className="text-xs text-emerald-700/80 space-y-1">
                  <li>&middot; Common makes (toyota, ford, honda, chevrolet...)</li>
                  <li>&middot; Cars with complete odometer + year data</li>
                  <li>&middot; Price ranges $1k - $50k</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={13} className="text-amber-700" />
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Limitations</p>
                </div>
                <ul className="text-xs text-amber-700/80 space-y-1">
                  <li>&middot; Rare/luxury vehicles — limited training samples</li>
                  <li>&middot; Condition is self-reported by sellers</li>
                  <li>&middot; Static snapshot — real prices drift over time</li>
                  <li>&middot; No accident history or trim-level detail</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-accent" />
            <h2 className="text-xl font-bold text-foreground">Data Sources &amp; Stack</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DATA_SOURCES.map(s => (
              <div key={s.label}
                className="bg-muted/50 border border-border rounded-xl p-4 flex items-start gap-3 hover:border-stone-400 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: s.color }} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground text-sm font-semibold">{s.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{s.tag}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
