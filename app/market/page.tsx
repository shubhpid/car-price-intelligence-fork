"use client"

import { useState, useCallback } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, Cell, ResponsiveContainer,
} from "recharts"
import { MapPin, BarChart2, Info } from "lucide-react"

/* ── US State Market Data (static fallback - replace with API fetch when backend is ready) ── */
const US_STATE_DATA: Record<string, { name: string; avg_price: number; total_listings: number; top_make: string; top_model: string; yoy_change: number }> = {
  AL: { name: "Alabama", avg_price: 24800, total_listings: 3420, top_make: "Ford", top_model: "F-150", yoy_change: -2.1 },
  AK: { name: "Alaska", avg_price: 29100, total_listings: 620, top_make: "Toyota", top_model: "Tacoma", yoy_change: 1.4 },
  AZ: { name: "Arizona", avg_price: 27300, total_listings: 7850, top_make: "Toyota", top_model: "RAV4", yoy_change: -0.8 },
  AR: { name: "Arkansas", avg_price: 23900, total_listings: 2180, top_make: "Chevrolet", top_model: "Silverado", yoy_change: -1.5 },
  CA: { name: "California", avg_price: 31200, total_listings: 42100, top_make: "Toyota", top_model: "Camry", yoy_change: -1.2 },
  CO: { name: "Colorado", avg_price: 29800, total_listings: 6200, top_make: "Subaru", top_model: "Outback", yoy_change: 0.5 },
  CT: { name: "Connecticut", avg_price: 28400, total_listings: 3100, top_make: "Honda", top_model: "CR-V", yoy_change: -0.3 },
  DE: { name: "Delaware", avg_price: 26700, total_listings: 980, top_make: "Toyota", top_model: "Camry", yoy_change: -1.0 },
  FL: { name: "Florida", avg_price: 27800, total_listings: 24500, top_make: "Toyota", top_model: "Camry", yoy_change: -1.8 },
  GA: { name: "Georgia", avg_price: 26100, total_listings: 11200, top_make: "Ford", top_model: "F-150", yoy_change: -2.4 },
  HI: { name: "Hawaii", avg_price: 30500, total_listings: 1050, top_make: "Toyota", top_model: "Tacoma", yoy_change: 0.9 },
  ID: { name: "Idaho", avg_price: 27200, total_listings: 1800, top_make: "Ford", top_model: "F-150", yoy_change: 0.2 },
  IL: { name: "Illinois", avg_price: 25900, total_listings: 12800, top_make: "Chevrolet", top_model: "Equinox", yoy_change: -1.6 },
  IN: { name: "Indiana", avg_price: 24600, total_listings: 6100, top_make: "Chevrolet", top_model: "Silverado", yoy_change: -2.0 },
  IA: { name: "Iowa", avg_price: 24200, total_listings: 2900, top_make: "Ford", top_model: "F-150", yoy_change: -1.1 },
  KS: { name: "Kansas", avg_price: 24800, total_listings: 2600, top_make: "Chevrolet", top_model: "Silverado", yoy_change: -1.3 },
  KY: { name: "Kentucky", avg_price: 24100, total_listings: 3500, top_make: "Ford", top_model: "F-150", yoy_change: -1.9 },
  LA: { name: "Louisiana", avg_price: 25300, total_listings: 3800, top_make: "Chevrolet", top_model: "Silverado", yoy_change: -2.3 },
  ME: { name: "Maine", avg_price: 26800, total_listings: 1200, top_make: "Subaru", top_model: "Forester", yoy_change: 0.4 },
  MD: { name: "Maryland", avg_price: 27500, total_listings: 5400, top_make: "Toyota", top_model: "RAV4", yoy_change: -0.7 },
  MA: { name: "Massachusetts", avg_price: 28900, total_listings: 5800, top_make: "Honda", top_model: "CR-V", yoy_change: -0.5 },
  MI: { name: "Michigan", avg_price: 25200, total_listings: 9800, top_make: "Ford", top_model: "F-150", yoy_change: -2.2 },
  MN: { name: "Minnesota", avg_price: 26100, total_listings: 4900, top_make: "Ford", top_model: "F-150", yoy_change: -0.9 },
  MS: { name: "Mississippi", avg_price: 23500, total_listings: 2100, top_make: "Nissan", top_model: "Altima", yoy_change: -2.6 },
  MO: { name: "Missouri", avg_price: 24900, total_listings: 5600, top_make: "Ford", top_model: "F-150", yoy_change: -1.4 },
  MT: { name: "Montana", avg_price: 28100, total_listings: 1100, top_make: "Ford", top_model: "F-150", yoy_change: 0.3 },
  NE: { name: "Nebraska", avg_price: 25000, total_listings: 1800, top_make: "Ford", top_model: "F-150", yoy_change: -1.0 },
  NV: { name: "Nevada", avg_price: 28200, total_listings: 3200, top_make: "Toyota", top_model: "Camry", yoy_change: -1.5 },
  NH: { name: "New Hampshire", avg_price: 27600, total_listings: 1400, top_make: "Subaru", top_model: "Outback", yoy_change: 0.1 },
  NJ: { name: "New Jersey", avg_price: 28800, total_listings: 8200, top_make: "Honda", top_model: "Accord", yoy_change: -0.6 },
  NM: { name: "New Mexico", avg_price: 26400, total_listings: 1500, top_make: "Ford", top_model: "F-150", yoy_change: -0.4 },
  NY: { name: "New York", avg_price: 29400, total_listings: 16800, top_make: "Toyota", top_model: "RAV4", yoy_change: -1.1 },
  NC: { name: "North Carolina", avg_price: 26300, total_listings: 9600, top_make: "Ford", top_model: "F-150", yoy_change: -1.7 },
  ND: { name: "North Dakota", avg_price: 26800, total_listings: 780, top_make: "Chevrolet", top_model: "Silverado", yoy_change: 0.6 },
  OH: { name: "Ohio", avg_price: 24700, total_listings: 10200, top_make: "Chevrolet", top_model: "Equinox", yoy_change: -1.8 },
  OK: { name: "Oklahoma", avg_price: 25100, total_listings: 3200, top_make: "Ford", top_model: "F-150", yoy_change: -1.6 },
  OR: { name: "Oregon", avg_price: 28600, total_listings: 4100, top_make: "Subaru", top_model: "Outback", yoy_change: 0.2 },
  PA: { name: "Pennsylvania", avg_price: 26200, total_listings: 11400, top_make: "Ford", top_model: "F-150", yoy_change: -1.3 },
  RI: { name: "Rhode Island", avg_price: 27100, total_listings: 920, top_make: "Honda", top_model: "Civic", yoy_change: -0.8 },
  SC: { name: "South Carolina", avg_price: 25800, total_listings: 4800, top_make: "Ford", top_model: "F-150", yoy_change: -2.0 },
  SD: { name: "South Dakota", avg_price: 26100, total_listings: 850, top_make: "Chevrolet", top_model: "Silverado", yoy_change: 0.4 },
  TN: { name: "Tennessee", avg_price: 25500, total_listings: 6400, top_make: "Nissan", top_model: "Rogue", yoy_change: -1.9 },
  TX: { name: "Texas", avg_price: 27600, total_listings: 32400, top_make: "Ford", top_model: "F-150", yoy_change: -2.5 },
  UT: { name: "Utah", avg_price: 28400, total_listings: 3400, top_make: "Toyota", top_model: "4Runner", yoy_change: 0.1 },
  VT: { name: "Vermont", avg_price: 27200, total_listings: 680, top_make: "Subaru", top_model: "Outback", yoy_change: 0.7 },
  VA: { name: "Virginia", avg_price: 27000, total_listings: 7800, top_make: "Toyota", top_model: "Camry", yoy_change: -1.2 },
  WA: { name: "Washington", avg_price: 29500, total_listings: 7200, top_make: "Subaru", top_model: "Crosstrek", yoy_change: 0.3 },
  WV: { name: "West Virginia", avg_price: 24300, total_listings: 1400, top_make: "Chevrolet", top_model: "Silverado", yoy_change: -1.7 },
  WI: { name: "Wisconsin", avg_price: 25400, total_listings: 4600, top_make: "Ford", top_model: "F-150", yoy_change: -1.0 },
  WY: { name: "Wyoming", avg_price: 28900, total_listings: 520, top_make: "Ford", top_model: "F-150", yoy_change: 0.8 },
}

const MAKE_COLORS: Record<string, string> = {
  ford: "#3b82f6", chevrolet: "#ef4444", toyota: "#10b981", honda: "#f97316",
  gmc: "#eab308", ram: "#8b5cf6", nissan: "#06b6d4", jeep: "#f59e0b",
  subaru: "#6366f1", hyundai: "#ec4899", dodge: "#84cc16", kia: "#14b8a6",
  bmw: "#a78bfa", default: "#78716c",
}
const makeColor = (make: string) => MAKE_COLORS[(make || "").toLowerCase()] || MAKE_COLORS.default

const stateData = US_STATE_DATA as Record<string, any>
const nameToAbbr: Record<string, string> = Object.entries(stateData).reduce((acc: Record<string, string>, [abbr, d]: [string, any]) => {
  acc[d.name] = abbr
  return acc
}, {})

const TOP_MAKES = [...new Set(Object.values(stateData).map((d: any) => d.top_make))].sort() as string[]

const tooltipStyle = {
  contentStyle: { background: "#faf7f2", border: "1px solid #ddd5c6", borderRadius: "8px", fontSize: 12 },
  labelStyle: { color: "#1a1611" },
}

// National summary stats
const totalListings = Object.values(stateData).reduce((s: number, d: any) => s + d.total_listings, 0)
const avgPriceNational = Math.round(Object.values(stateData).reduce((s: number, d: any) => s + d.avg_price * d.total_listings, 0) / totalListings)

/* ── US Map Component ──────────────────────────────────────────────────────── */
function USManufacturerMap({ onStateSelect, selectedState }: { onStateSelect: (s: string | null) => void; selectedState: string | null }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, abbr: null as string | null })

  const handleMouseEnter = useCallback((geo: any, evt: React.MouseEvent) => {
    const abbr = nameToAbbr[geo.properties.name]
    if (!abbr) return
    setTooltip({ visible: true, x: evt.clientX, y: evt.clientY, abbr })
  }, [])
  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    setTooltip(t => ({ ...t, x: evt.clientX, y: evt.clientY }))
  }, [])
  const handleMouseLeave = useCallback(() => {
    setTooltip(t => ({ ...t, visible: false }))
  }, [])
  const handleClick = useCallback((geo: any) => {
    const abbr = nameToAbbr[geo.properties.name]
    if (abbr) onStateSelect(abbr === selectedState ? null : abbr)
  }, [onStateSelect, selectedState])

  const ttData = tooltip.abbr ? stateData[tooltip.abbr] : null

  return (
    <div className="relative select-none">
      <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "auto" }}>
        <Geographies geography="/states-10m.json">
          {({ geographies }: any) =>
            geographies.map((geo: any) => {
              const abbr = nameToAbbr[geo.properties.name]
              const st = abbr ? stateData[abbr] : null
              const topMake = st?.top_make
              const color = topMake ? makeColor(topMake) : "#ddd5c6"
              const isSelected = abbr === selectedState
              return (
                <Geography key={geo.rsmKey} geography={geo}
                  fill={isSelected ? "#1a1611" : color} fillOpacity={isSelected ? 1 : 0.75}
                  stroke={isSelected ? "#1a1611" : "#f5f0e8"} strokeWidth={isSelected ? 2 : 0.5}
                  style={{
                    default: { outline: "none", cursor: "pointer" },
                    hover: { outline: "none", fillOpacity: 1, strokeWidth: 1.5, stroke: "#78716c" },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={(e: any) => handleMouseEnter(geo, e)}
                  onMouseMove={handleMouseMove as any}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(geo)}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip.visible && ttData && (
        <div className="fixed z-50 pointer-events-none bg-card border border-border rounded-xl shadow-2xl p-3 text-xs min-w-44"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10, transform: "translateY(-100%)" }}>
          <p className="font-bold text-foreground text-sm mb-1">{ttData.name}</p>
          <p className="text-muted-foreground mb-2">
            Avg price: <span className="text-accent-foreground font-semibold">${ttData.avg_price.toLocaleString()}</span>
            <span className="text-muted-foreground/70 ml-2">{"/"}</span>
            <span className="text-muted-foreground ml-2">{ttData.total_listings.toLocaleString()} listings</span>
          </p>
          <p className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wide mb-1">Top Manufacturers</p>
          {ttData.top3.map((m: any, i: number) => (
            <div key={i} className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: makeColor(m.make) }} />
              <span className="capitalize text-foreground flex-1">{m.make}</span>
              <span className="text-muted-foreground">{m.count.toLocaleString()}</span>
              <span className="text-border">{"/"}</span>
              <span className="text-foreground/70">${m.avg_price.toLocaleString()}</span>
            </div>
          ))}
          <p className="text-muted-foreground text-[10px] mt-2">Click to explore in playground</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {TOP_MAKES.map((make: string) => (
          <div key={make} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: makeColor(make) }} />
            <span className="text-xs text-muted-foreground capitalize">{make}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── State Playground ──────────────────────────────────────────────────────── */
function StatePlayground({ initialState }: { initialState: string | null }) {
  const [selState, setSelState] = useState(initialState || "")
  const [selMake, setSelMake] = useState("")

  // Sync with parent map clicks
  const prevInitial = useState(initialState)[0]
  if (initialState !== prevInitial && initialState) {
    setSelState(initialState)
    setSelMake("")
  }

  const sortedStates = Object.entries(stateData).sort((a: any, b: any) => a[1].name.localeCompare(b[1].name))
  const sd = selState ? stateData[selState] : null
  const top3 = sd?.top3 || []
  const makes = top3.map((m: any) => m.make)
  const priceData = top3.map((m: any) => ({
    name: m.make.charAt(0).toUpperCase() + m.make.slice(1),
    avg_price: m.avg_price, listings: m.count, fill: makeColor(m.make),
  }))

  return (
    <div className="space-y-5">
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            <MapPin size={10} className="inline mr-1" />State
          </label>
          <select value={selState} onChange={e => { setSelState(e.target.value); setSelMake("") }}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent outline-none">
            <option value="">Select a state...</option>
            {sortedStates.map(([abbr, d]: any) => <option key={abbr} value={abbr}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-44">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            <BarChart2 size={10} className="inline mr-1" />Manufacturer
          </label>
          <select value={selMake} onChange={e => setSelMake(e.target.value)} disabled={!selState}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent outline-none disabled:opacity-40">
            <option value="">All top 3</option>
            {makes.map((m: string) => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {!sd && (
        <div className="flex flex-col items-center justify-center h-52 text-muted-foreground/70 gap-3">
          <MapPin size={36} className="opacity-20" />
          <p className="text-sm">Select a state or click the map to explore</p>
        </div>
      )}

      {sd && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "State", value: sd.name, sub: selState.toUpperCase() },
              { label: "Avg Price", value: `$${sd.avg_price.toLocaleString()}`, sub: "All makes avg" },
              { label: "Total Listings", value: sd.total_listings.toLocaleString(), sub: "Active inventory" },
              { label: "Top Manufacturer", value: sd.top_make.charAt(0).toUpperCase() + sd.top_make.slice(1), sub: "Most listings" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-muted/50 border border-border rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Avg Price by Manufacturer</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priceData} margin={{ left: 8, right: 8, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd5c6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#78716c" }} />
                  <YAxis tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#78716c" }} />
                  <ReTooltip {...tooltipStyle} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Avg Price"]} />
                  <Bar dataKey="avg_price" radius={[5, 5, 0, 0]}>
                    {priceData.map((d: any, i: number) => (
                      <Cell key={i} fill={d.fill} fillOpacity={!selMake || d.name.toLowerCase() === selMake ? 1 : 0.25} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Listing Count by Manufacturer</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priceData} margin={{ left: 8, right: 8, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd5c6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#78716c" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#78716c" }} />
                  <ReTooltip {...tooltipStyle} formatter={(v: any) => [Number(v).toLocaleString(), "Listings"]} />
                  <Bar dataKey="listings" radius={[5, 5, 0, 0]}>
                    {priceData.map((d: any, i: number) => (
                      <Cell key={i} fill={d.fill} fillOpacity={!selMake || d.name.toLowerCase() === selMake ? 0.8 : 0.2} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3.map((m: any, i: number) => {
              const pct = sd.total_listings > 0 ? Math.round((m.count / sd.total_listings) * 100) : 0
              const isFiltered = selMake && m.make !== selMake
              return (
                <div key={m.make} onClick={() => setSelMake(selMake === m.make ? "" : m.make)}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    selMake === m.make ? "border-accent/40 bg-accent/5" : "border-border bg-muted/30"
                  } ${isFiltered ? "opacity-30" : ""}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: makeColor(m.make) }} />
                    <span className="text-sm font-bold text-foreground capitalize">#{i+1} {m.make}</span>
                  </div>
                  <p className="text-xl font-extrabold text-foreground">${m.avg_price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.count.toLocaleString()} listings / {pct}% of state</p>
                  <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: makeColor(m.make) }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────────────────────── */
export default function MarketPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2 text-balance">
            Market Overview
          </h1>
          <p className="text-muted-foreground text-sm mb-6 max-w-2xl leading-relaxed">
            Interactive US car market map with state-level manufacturer breakdown, pricing data, and inventory counts across 328k+ listings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">National Avg Price</p>
              <p className="text-3xl font-bold text-foreground">${avgPriceNational.toLocaleString()}</p>
              <p className="text-muted-foreground text-xs mt-1">Across all 50 states</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total Listings</p>
              <p className="text-3xl font-bold text-foreground">{totalListings.toLocaleString()}</p>
              <p className="text-muted-foreground text-xs mt-1">Active inventory nationwide</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">States Covered</p>
              <p className="text-3xl font-bold text-foreground">{Object.keys(stateData).length}</p>
              <p className="text-muted-foreground text-xs mt-1">Full US coverage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8 pb-12">
        {/* US Map */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin size={18} className="text-accent-foreground" />
                Top Manufacturer by State
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                States colored by most-listed manufacturer. Hover for details, click to explore.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
              <Info size={11} />
              {Object.keys(stateData).length} states / {(totalListings / 1000).toFixed(0)}k+ listings
            </div>
          </div>
          <div className="mt-4">
            <USManufacturerMap onStateSelect={setSelectedState} selectedState={selectedState} />
          </div>
        </div>

        {/* State Playground */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BarChart2 size={18} className="text-emerald-400" />
                State Market Playground
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Select a state or click the map above to explore top manufacturers, prices, and inventory.
              </p>
            </div>
          </div>
          <StatePlayground initialState={selectedState} />
        </div>
      </div>
    </div>
  )
}
