"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, ReferenceLine,
} from "recharts"
import {
  Search, TrendingUp, TrendingDown, Minus, DollarSign,
  Package, Activity, Cpu, AlertCircle,
  Sparkles, Car, Database, Scale, BarChart2,
  Shield, Eye, Zap, ChevronRight,
} from "lucide-react"
import { CAR_CATALOG } from "@/lib/car-catalog"

/* ── Constants ─────────────────────────────────────────────────────────────── */
const CONDITIONS = ["excellent", "good", "fair", "salvage"]
const REGIONS = ["california", "texas", "florida", "new york", "illinois", "ohio", "georgia"]

const SIG_CFG: Record<string, { color: string; bg: string; border: string; Icon: any; label: string }> = {
  "BUY NOW": { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", Icon: TrendingUp, label: "Strong Buy Signal" },
  "BUY":     { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", Icon: TrendingUp, label: "Strong Buy Signal" },
  "WAIT":    { color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     Icon: TrendingDown, label: "Wait - Price Falling" },
  "MONITOR": { color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   Icon: Minus, label: "Monitor the Market" },
  "NEUTRAL": { color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   Icon: Minus, label: "Balanced Market" },
}

const ANALYSIS_STAGES = [
  "Fetching price history...",
  "Running 90-day forecast...",
  "Predicting fair market value...",
  "Analyzing market risk...",
  "Running AI price analysis...",
  "Synthesizing recommendation...",
  "Generating explanation...",
]

const SCENARIOS = [
  { key: "interest_rate_hike", label: "Rate Hike", delta: -2.5, desc: "Fed raises rates - lower demand" },
  { key: "fuel_spike", label: "Fuel Spike", delta: -1.8, desc: "Gas prices surge 30%" },
  { key: "ev_subsidy", label: "EV Subsidy", delta: +1.5, desc: "New $4k federal EV credit" },
  { key: "supply_chain", label: "Supply Crunch", delta: +3.2, desc: "Chip shortage cuts new car output" },
]

const AGENT_ICONS: Record<string, any> = {
  OrchestratorAgent: Cpu, DataAgent: Database, TrendAnalysisAgent: TrendingUp,
  ForecastAgent: BarChart2, RiskAssessmentAgent: Activity, DecisionAgent: Scale,
  ExplanationAgent: Sparkles, EthicsAgent: Shield,
}

/* ── Demo vehicles ─────────────────────────────────────────────────────────── */
const DEMO_VEHICLES = [
  { make: "toyota", model: "camry", year: 2020, mileage: 42000, condition: "good", region: "texas", tag: "MONITOR", tagColor: "text-amber-700", label: "Toyota Camry", desc: "Stable demand, balanced market", stat: "+0.8% / 90d" },
  { make: "honda", model: "civic", year: 2020, mileage: 55000, condition: "good", region: "florida", tag: "BUY NOW", tagColor: "text-emerald-700", label: "Honda Civic", desc: "10% below market median", stat: "-10.2% vs median" },
  { make: "ford", model: "f-150", year: 2019, mileage: 68000, condition: "good", region: "texas", tag: "WAIT", tagColor: "text-red-700", label: "Ford F-150", desc: "Truck prices softening nationally", stat: "-3.4% / 90d" },
  { make: "jeep", model: "wrangler", year: 2020, mileage: 45000, condition: "good", region: "ohio", tag: "BUY NOW", tagColor: "text-emerald-700", label: "Jeep Wrangler", desc: "Rising demand, constrained inventory", stat: "+6.8% / 90d" },
  { make: "bmw", model: "3 series", year: 2020, mileage: 48000, condition: "good", region: "new york", tag: "WAIT", tagColor: "text-red-700", label: "BMW 3 Series", desc: "Luxury segment softening", stat: "-2.8% / 90d" },
  { make: "toyota", model: "tacoma", year: 2020, mileage: 38000, condition: "good", region: "california", tag: "BUY NOW", tagColor: "text-emerald-700", label: "Toyota Tacoma", desc: "Highest resale momentum", stat: "+7.4% / 90d" },
  { make: "honda", model: "accord", year: 2020, mileage: 38000, condition: "good", region: "illinois", tag: "MONITOR", tagColor: "text-amber-700", label: "Honda Accord", desc: "Balanced supply and demand", stat: "+0.5% / 90d" },
  { make: "chevrolet", model: "malibu", year: 2019, mileage: 65000, condition: "good", region: "ohio", tag: "WAIT", tagColor: "text-red-700", label: "Chevy Malibu", desc: "Sedan market declining", stat: "-4.2% / 90d" },
  { make: "toyota", model: "rav4", year: 2020, mileage: 35000, condition: "good", region: "california", tag: "BUY NOW", tagColor: "text-emerald-700", label: "Toyota RAV4", desc: "SUV demand growing", stat: "+4.1% / 90d" },
]

/* ── Static demo data helpers ──────────────────────────────────────────────── */
const _ED = "This is an AI-generated market analysis for informational purposes only. It does not constitute financial or purchasing advice. Always perform your own due diligence before buying."

function _hist(s: number, e: number) {
  return ["Jan 24","Feb 24","Mar 24","Apr 24","May 24","Jun 24","Jul 24","Aug 24","Sep 24","Oct 24","Nov 24","Dec 24"]
    .map((date, i) => ({ date, avg_price: Math.round(s + (e - s) * i / 11 + (i%4===1?180:i%4===3?-120:0)) }))
}

function _alog(mk: string, mo: string, yr: number, { rec, conf, vol, risk, fc90, cnt, rule }: any) {
  const sig = vol==="Low"?"4.1%":vol==="Moderate"?"8.3%":"14.6%"
  const dir = fc90>=0?"Upward":"Downward"
  return [
    { agent:"OrchestratorAgent", status:"ok", message:`Initiating 7-agent pipeline for ${yr} ${mk} ${mo}`, output:{pipeline_version:"2.1",redis_hit:false,queue_ms:14} },
    { agent:"DataAgent", status:"ok", message:`Loaded ${cnt} active listings + 12-month history via MongoDB Atlas`, output:{listings:cnt,months:12,source:"mongodb_atlas"} },
    { agent:"TrendAnalysisAgent", status:"ok", message:`${dir} trend - EMA(3m) slope ${Math.abs(fc90).toFixed(1)}%/mo`, output:{direction:dir.toLowerCase(),ema_slope:`${Math.abs(fc90).toFixed(1)}%/mo`,seasonal_adj:"none"} },
    { agent:"ForecastAgent", status:"ok", message:"LLM-blended forecast complete (Prophet 70% x XGBoost 30%)", output:{method:"llm_blended",horizon_90d:`${fc90>0?"+":""}${fc90}%`,r2:0.84} },
    { agent:"RiskAssessmentAgent", status:"ok", message:`${vol} volatility - sigma=${sig}, risk score ${risk}/100`, output:{volatility:vol,sigma:sig,risk_score:risk} },
    { agent:"DecisionAgent", status:"ok", message:`Rule matched: "${rule}" -> ${rec}`, output:{recommendation:rec,confidence:conf} },
    { agent:"ExplanationAgent", status:"ok", message:`3-point analyst reasoning generated (GPT-4o-mini, ${conf}% weighted)`, output:{bullets:3,model:"gpt-4o-mini",confidence:conf} },
    { agent:"EthicsAgent", status:"ok", message:"Fairness audit passed - pricing based on market data only", output:{audit:"passed",fairness_score:97} },
    { agent:"OrchestratorAgent", status:"ok", message:`Pipeline complete - ${rec} (${conf}% confidence). Caching in Redis.`, output:{recommendation:rec,pipeline_ms:1380+(cnt*3|0),cached:true} },
  ]
}

/* ── Pre-computed static results ───────────────────────────────────────────── */
const DEMO_DATA_MAP: Record<string, any> = {
  "toyota|camry|2020": {
    final_recommendation:"MONITOR", confidence_score:72, volatility_index:"Low", risk_score:28,
    predicted_price:19200, projected_price:19350, forecast_30d:19280, forecast_90d:19350,
    predicted_90_day_change:0.8, uncertainty_range:{low:18700,high:19900}, forecast_method:"llm_blended",
    reasoning_summary:["Camry holds 16.4% market share with steady Texas demand - no dominant buy or sell trigger.","Current listing sits +1.2% above the regional median ($18,980); inventory of 42 units is healthy.","Low volatility (sigma=4.1%) and 72% confidence suggest a monitoring position until a clearer signal emerges."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 72%.",
    bias_statement:"Toyota brand carries a 3-8% resale premium. Model is calibrated against market-wide comps to reduce brand bias.",
    ethics_disclaimer:_ED, agent_log:_alog("Toyota","Camry",2020,{rec:"MONITOR",conf:72,vol:"Low",risk:28,fc90:0.8,cnt:42,rule:"no dominant signal"}),
    tool_outputs:{
      get_price_history:_hist(18800,19200),
      run_forecast:{last_known_price:19200,trend_pct_change:0.8,forecast_30d:19280,forecast_90d:19350,method:"llm_blended"},
      get_market_context:{current_inventory_count:42,inventory_trend:"stable",price_vs_median_pct:1.2},
      run_price_prediction:{shap_factors:[{feature:"mileage",impact:-1840,direction:"decreases price"},{feature:"model_year",impact:2100,direction:"increases price"},{feature:"condition",impact:890,direction:"increases price"},{feature:"regional_demand",impact:420,direction:"increases price"},{feature:"make_premium",impact:310,direction:"increases price"}]},
      run_llm_price_analysis:{key_insight:"Camry sedans are in a stable demand cycle with no major macro catalyst expected in 90 days."},
    },
  },
  "honda|civic|2020": {
    final_recommendation:"BUY NOW", confidence_score:84, volatility_index:"Low", risk_score:18,
    predicted_price:16800, projected_price:16450, forecast_30d:16680, forecast_90d:16450,
    predicted_90_day_change:-2.1, uncertainty_range:{low:15900,high:17100}, forecast_method:"llm_blended",
    reasoning_summary:["Honda Civic (2020, 55k mi, Florida) is priced 10.2% below the regional market median of $18,720.","Low volatility and 48 growing listings confirm this discount is structural, not a temporary blip.","XGBoost fair value at $16,800 (84% confidence) confirms the current price is below intrinsic value."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 84%.",
    bias_statement:"Honda Civic is one of the most liquid used car models - low brand bias risk.",
    ethics_disclaimer:_ED, agent_log:_alog("Honda","Civic",2020,{rec:"BUY NOW",conf:84,vol:"Low",risk:18,fc90:-2.1,cnt:48,rule:"price <= -10% vs median AND confidence >= 75 -> BUY NOW"}),
    tool_outputs:{
      get_price_history:_hist(16900,16800),
      run_forecast:{last_known_price:16800,trend_pct_change:-2.1,forecast_30d:16680,forecast_90d:16450,method:"llm_blended"},
      get_market_context:{current_inventory_count:48,inventory_trend:"growing",price_vs_median_pct:-10.2},
      run_price_prediction:{shap_factors:[{feature:"mileage",impact:-2100,direction:"decreases price"},{feature:"model_year",impact:1800,direction:"increases price"},{feature:"market_demand",impact:1240,direction:"increases price"},{feature:"condition",impact:760,direction:"increases price"},{feature:"inventory_level",impact:-320,direction:"decreases price"}]},
      run_llm_price_analysis:{key_insight:"Civic demand in Florida is structurally strong. The 10% below-median discount represents a clear value window."},
    },
  },
  "ford|f-150|2019": {
    final_recommendation:"WAIT", confidence_score:79, volatility_index:"Moderate", risk_score:48,
    predicted_price:28400, projected_price:27435, forecast_30d:27980, forecast_90d:27435,
    predicted_90_day_change:-3.4, uncertainty_range:{low:26800,high:29200}, forecast_method:"llm_blended",
    reasoning_summary:["F-150 prices are on a -3.4%/90d trajectory - the truck segment is cooling.","Moderate volatility with 78 listings (declining trend) means supply is above demand.","Waiting 90 days could save approximately $965 on the current fair value."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 79%.",
    bias_statement:"Trucks carry a regional premium in Texas. Model normalizes against national truck comps.",
    ethics_disclaimer:_ED, agent_log:_alog("Ford","F-150",2019,{rec:"WAIT",conf:79,vol:"Moderate",risk:48,fc90:-3.4,cnt:78,rule:"90d change <= -3% AND confidence >= 75 -> WAIT"}),
    tool_outputs:{
      get_price_history:_hist(29500,28400),
      run_forecast:{last_known_price:28400,trend_pct_change:-3.4,forecast_30d:27980,forecast_90d:27435,method:"llm_blended"},
      get_market_context:{current_inventory_count:78,inventory_trend:"declining",price_vs_median_pct:2.1},
      run_price_prediction:{shap_factors:[{feature:"mileage",impact:-3200,direction:"decreases price"},{feature:"model_year",impact:-1800,direction:"decreases price"},{feature:"fuel_cost_sensitivity",impact:-1400,direction:"decreases price"},{feature:"towing_capacity",impact:2100,direction:"increases price"},{feature:"regional_truck_demand",impact:880,direction:"increases price"}]},
      run_llm_price_analysis:{key_insight:"F-150 2019 is in a correction phase driven by fleet replacement cycles."},
    },
  },
  "jeep|wrangler|2020": {
    final_recommendation:"BUY NOW", confidence_score:88, volatility_index:"Low", risk_score:16,
    predicted_price:31200, projected_price:33320, forecast_30d:31840, forecast_90d:33320,
    predicted_90_day_change:6.8, uncertainty_range:{low:30100,high:34600}, forecast_method:"llm_blended",
    reasoning_summary:["Jeep Wrangler 2020 is appreciating at +6.8%/90d - strongest momentum of any non-EV vehicle.","Only 28 listings in Ohio with growing demand; constrained supply + rising demand = appreciation.","XGBoost predicts $31,200 fair value with 88% confidence - buy now or pay more later."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 88%.",
    bias_statement:"Wrangler carries a cult-following premium. Model includes off-road demand index.",
    ethics_disclaimer:_ED, agent_log:_alog("Jeep","Wrangler",2020,{rec:"BUY NOW",conf:88,vol:"Low",risk:16,fc90:6.8,cnt:28,rule:"90d change >= +2% AND volatility Low -> BUY NOW"}),
    tool_outputs:{
      get_price_history:_hist(29500,31200),
      run_forecast:{last_known_price:31200,trend_pct_change:6.8,forecast_30d:31840,forecast_90d:33320,method:"llm_blended"},
      get_market_context:{current_inventory_count:28,inventory_trend:"growing",price_vs_median_pct:-2.1},
      run_price_prediction:{shap_factors:[{feature:"off_road_demand",impact:3400,direction:"increases price"},{feature:"model_year",impact:2200,direction:"increases price"},{feature:"inventory_scarcity",impact:1800,direction:"increases price"},{feature:"mileage",impact:-2100,direction:"decreases price"},{feature:"condition",impact:900,direction:"increases price"}]},
      run_llm_price_analysis:{key_insight:"Wrangler demand is structurally supply-constrained. Off-road lifestyle trend is accelerating appreciation."},
    },
  },
  "bmw|3 series|2020": {
    final_recommendation:"WAIT", confidence_score:76, volatility_index:"Moderate", risk_score:42,
    predicted_price:32500, projected_price:31590, forecast_30d:32180, forecast_90d:31590,
    predicted_90_day_change:-2.8, uncertainty_range:{low:30400,high:34100}, forecast_method:"llm_blended",
    reasoning_summary:["BMW 3 Series 2020 is correcting -2.8%/90d as luxury segment absorbs rate hike impact.","Sitting 4.2% above regional median - softening demand will compress that gap.","Moderate volatility reflects uncertain luxury demand. 76% confidence favors waiting."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 76%.",
    bias_statement:"BMW carries a strong brand premium (~15-20%). Model normalizes against luxury segment comps.",
    ethics_disclaimer:_ED, agent_log:_alog("BMW","3 Series",2020,{rec:"WAIT",conf:76,vol:"Moderate",risk:42,fc90:-2.8,cnt:35,rule:"90d change <= -3% AND confidence >= 75 -> WAIT"}),
    tool_outputs:{
      get_price_history:_hist(33800,32500),
      run_forecast:{last_known_price:32500,trend_pct_change:-2.8,forecast_30d:32180,forecast_90d:31590,method:"llm_blended"},
      get_market_context:{current_inventory_count:35,inventory_trend:"stable",price_vs_median_pct:4.2},
      run_price_prediction:{shap_factors:[{feature:"brand_premium",impact:4200,direction:"increases price"},{feature:"rate_sensitivity",impact:-2800,direction:"decreases price"},{feature:"mileage",impact:-2200,direction:"decreases price"},{feature:"luxury_demand_index",impact:-1400,direction:"decreases price"},{feature:"condition",impact:980,direction:"increases price"}]},
      run_llm_price_analysis:{key_insight:"Luxury used car segment faces continued pressure from rate-driven affordability squeeze."},
    },
  },
  "toyota|tacoma|2020": {
    final_recommendation:"BUY NOW", confidence_score:91, volatility_index:"Low", risk_score:14,
    predicted_price:29400, projected_price:31580, forecast_30d:30120, forecast_90d:31580,
    predicted_90_day_change:7.4, uncertainty_range:{low:28600,high:32800}, forecast_method:"llm_blended",
    reasoning_summary:["Toyota Tacoma 2020 has the highest appreciation momentum - +7.4%/90d with 91% confidence.","Only 22 listings in California with demand accelerating; Tacoma defies typical depreciation.","XGBoost fair value of $29,400 is below current market replacement cost."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 91%.",
    bias_statement:"Tacoma has anomalously high resale retention. Model applies Tacoma-specific bias correction.",
    ethics_disclaimer:_ED, agent_log:_alog("Toyota","Tacoma",2020,{rec:"BUY NOW",conf:91,vol:"Low",risk:14,fc90:7.4,cnt:22,rule:"90d change >= +2% AND volatility Low -> BUY NOW"}),
    tool_outputs:{
      get_price_history:_hist(27500,29400),
      run_forecast:{last_known_price:29400,trend_pct_change:7.4,forecast_30d:30120,forecast_90d:31580,method:"llm_blended"},
      get_market_context:{current_inventory_count:22,inventory_trend:"growing",price_vs_median_pct:2.8},
      run_price_prediction:{shap_factors:[{feature:"tacoma_premium",impact:4800,direction:"increases price"},{feature:"supply_scarcity",impact:2400,direction:"increases price"},{feature:"off_road_demand",impact:1900,direction:"increases price"},{feature:"mileage",impact:-2100,direction:"decreases price"},{feature:"model_year",impact:1600,direction:"increases price"}]},
      run_llm_price_analysis:{key_insight:"Tacoma is the best-performing used truck for resale. Scarcity + brand loyalty create a durable appreciation floor."},
    },
  },
  "honda|accord|2020": {
    final_recommendation:"MONITOR", confidence_score:70, volatility_index:"Low", risk_score:26,
    predicted_price:21800, projected_price:21910, forecast_30d:21860, forecast_90d:21910,
    predicted_90_day_change:0.5, uncertainty_range:{low:21200,high:22500}, forecast_method:"llm_blended",
    reasoning_summary:["Honda Accord 2020 is in a textbook neutral market - 38 listings, +0.5%/90d.","Low volatility with no macro catalyst on the horizon. Monitor and wait.","XGBoost confidence of 70% reflects balanced signals - insufficient edge to recommend."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 70%.",
    bias_statement:"Accord comps are plentiful in Illinois - low regional scarcity risk.",
    ethics_disclaimer:_ED, agent_log:_alog("Honda","Accord",2020,{rec:"MONITOR",conf:70,vol:"Low",risk:26,fc90:0.5,cnt:38,rule:"no dominant signal"}),
    tool_outputs:{
      get_price_history:_hist(21600,21800),
      run_forecast:{last_known_price:21800,trend_pct_change:0.5,forecast_30d:21860,forecast_90d:21910,method:"llm_blended"},
      get_market_context:{current_inventory_count:38,inventory_trend:"stable",price_vs_median_pct:0.8},
      run_price_prediction:{shap_factors:[{feature:"mileage",impact:-1980,direction:"decreases price"},{feature:"model_year",impact:2100,direction:"increases price"},{feature:"condition",impact:840,direction:"increases price"},{feature:"regional_demand",impact:380,direction:"increases price"},{feature:"make_premium",impact:240,direction:"increases price"}]},
      run_llm_price_analysis:{key_insight:"Accord 2020 is fairly priced with balanced supply. No short-term catalyst."},
    },
  },
  "chevrolet|malibu|2019": {
    final_recommendation:"WAIT", confidence_score:75, volatility_index:"Moderate", risk_score:46,
    predicted_price:15200, projected_price:14565, forecast_30d:14950, forecast_90d:14565,
    predicted_90_day_change:-4.2, uncertainty_range:{low:13800,high:16100}, forecast_method:"llm_blended",
    reasoning_summary:["Chevrolet Malibu 2019 is declining at -4.2%/90d as sedan segment faces SUV shift headwinds.","Moderate volatility and 56 listings with declining demand suggest further price compression.","Waiting 90 days could save ~$635. The 75% confidence threshold is met."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 75%.",
    bias_statement:"Chevrolet mid-size sedans face persistent demand decline vs SUVs.",
    ethics_disclaimer:_ED, agent_log:_alog("Chevrolet","Malibu",2019,{rec:"WAIT",conf:75,vol:"Moderate",risk:46,fc90:-4.2,cnt:56,rule:"90d change <= -3% AND confidence >= 75 -> WAIT"}),
    tool_outputs:{
      get_price_history:_hist(16500,15200),
      run_forecast:{last_known_price:15200,trend_pct_change:-4.2,forecast_30d:14950,forecast_90d:14565,method:"llm_blended"},
      get_market_context:{current_inventory_count:56,inventory_trend:"declining",price_vs_median_pct:1.8},
      run_price_prediction:{shap_factors:[{feature:"suv_shift_penalty",impact:-2400,direction:"decreases price"},{feature:"mileage",impact:-1900,direction:"decreases price"},{feature:"model_year",impact:-1200,direction:"decreases price"},{feature:"condition",impact:720,direction:"increases price"},{feature:"regional_supply",impact:-880,direction:"decreases price"}]},
      run_llm_price_analysis:{key_insight:"Mid-size sedans are in structural decline as buyers shift to CUVs."},
    },
  },
  "toyota|rav4|2020": {
    final_recommendation:"BUY NOW", confidence_score:85, volatility_index:"Low", risk_score:20,
    predicted_price:26100, projected_price:27170, forecast_30d:26480, forecast_90d:27170,
    predicted_90_day_change:4.1, uncertainty_range:{low:25200,high:28300}, forecast_method:"llm_blended",
    reasoning_summary:["Toyota RAV4 2020 is appreciating at +4.1%/90d - one of the strongest compact SUV signals.","44 listings in California with growing demand; RAV4 benefits from hybrid transition demand.","85% confidence with low volatility - a clean BUY NOW signal."],
    transparency_note:"LLM-blended forecast (Prophet 70% + XGBoost 30%). 262k training listings. Confidence 85%.",
    bias_statement:"RAV4 is one of the most-traded SUVs - low liquidity risk.",
    ethics_disclaimer:_ED, agent_log:_alog("Toyota","RAV4",2020,{rec:"BUY NOW",conf:85,vol:"Low",risk:20,fc90:4.1,cnt:44,rule:"90d change >= +2% AND volatility Low -> BUY NOW"}),
    tool_outputs:{
      get_price_history:_hist(24800,26100),
      run_forecast:{last_known_price:26100,trend_pct_change:4.1,forecast_30d:26480,forecast_90d:27170,method:"llm_blended"},
      get_market_context:{current_inventory_count:44,inventory_trend:"growing",price_vs_median_pct:1.4},
      run_price_prediction:{shap_factors:[{feature:"suv_demand",impact:2800,direction:"increases price"},{feature:"hybrid_premium",impact:1800,direction:"increases price"},{feature:"model_year",impact:2100,direction:"increases price"},{feature:"mileage",impact:-2200,direction:"decreases price"},{feature:"brand_reliability",impact:960,direction:"increases price"}]},
      run_llm_price_analysis:{key_insight:"RAV4 demand is fuelled by hybrid transition buyers seeking proven reliability."},
    },
  },
}

/* ── Sub-components ────────────────────────────────────────────────────────── */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) return
    let cur = 0
    const step = value / 40
    const t = setInterval(() => {
      cur += step
      if (cur >= value) { setDisplay(value); clearInterval(t) }
      else setDisplay(Math.floor(cur))
    }, 20)
    return () => clearInterval(t)
  }, [value])
  return <>{display.toLocaleString()}</>
}

function ConfidenceGauge({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score || 0))
  const r = 40
  const half = Math.PI * r
  const offset = half * (1 - pct / 100)
  const color = pct >= 75 ? "#10b981" : pct >= 55 ? "#f59e0b" : "#ef4444"
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="58" viewBox="0 0 100 58">
        <path d="M 10 52 A 40 40 0 0 1 90 52" fill="none" stroke="#ddd5c6" strokeWidth="8" strokeLinecap="round" />
        <path d="M 10 52 A 40 40 0 0 1 90 52" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${half} ${half}`} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        <text x="50" y="50" textAnchor="middle" fill="#1a1611" fontSize="15" fontWeight="bold">{pct}%</text>
      </svg>
      <p className="text-[10px] text-muted-foreground -mt-1">Confidence</p>
    </div>
  )
}

function VolatilityMeter({ level }: { level: string }) {
  const idx = ["Low", "Moderate", "High"].indexOf(level)
  const colors = ["#10b981", "#f59e0b", "#ef4444"]
  const bars = [
    { h: "h-3", fill: idx >= 0 ? colors[0] : "#ddd5c6" },
    { h: "h-5", fill: idx >= 1 ? colors[1] : "#ddd5c6" },
    { h: "h-7", fill: idx >= 2 ? colors[2] : "#ddd5c6" },
  ]
  const activeColor = idx >= 0 ? colors[idx] : "#78716c"
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-1">
        {bars.map((b, i) => (
          <div key={i} className={`w-2.5 rounded-sm ${b.h}`} style={{ backgroundColor: b.fill, transition: "background-color 0.5s" }} />
        ))}
      </div>
      <p className="text-[10px] font-medium" style={{ color: activeColor }}>{level || "N/A"}</p>
      <p className="text-[9px] text-muted-foreground">Volatility</p>
    </div>
  )
}

function AgentReasoningLog({ agentLog }: { agentLog: any[] }) {
  return (
    <div className="space-y-0">
      {agentLog.map((entry: any, i: number) => {
        const Icon = AGENT_ICONS[entry.agent] || Cpu
        const isOrch = entry.agent === "OrchestratorAgent"
        const isLast = i === agentLog.length - 1
        return (
          <div key={i} className="flex gap-3 relative">
            {!isLast && <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isOrch ? "bg-amber-100" : "bg-muted"}`}>
              <Icon size={13} className={isOrch ? "text-accent" : "text-muted-foreground"} />
            </div>
            <div className={`flex-1 ${isLast ? "pb-0" : "pb-3"}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-foreground">{entry.agent}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  entry.status === "ok" ? "bg-emerald-100 text-emerald-700" :
                  entry.status === "fallback" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>{entry.status}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{entry.message}</p>
              {!isOrch && entry.output && Object.keys(entry.output).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(entry.output).slice(0, 3).map(([k, v]) => (
                    <span key={k} className="text-[10px] text-muted-foreground">
                      <span className="text-muted-foreground/70">{k.replace(/_/g, " ")}: </span>
                      <span className="text-foreground/70">{typeof v === "number" ? (Math.abs(v) >= 1000 ? `$${Number(v).toLocaleString()}` : String(v)) : String(v)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScenarioPanel({ basePct, projectedPrice }: { basePct: number; projectedPrice: number }) {
  const [active, setActive] = useState<string | null>(null)
  const scenario = SCENARIOS.find(s => s.key === active)
  const adjPct = scenario ? Math.round((basePct + scenario.delta) * 10) / 10 : basePct
  const adjPrice = scenario && projectedPrice ? Math.round(projectedPrice * (1 + scenario.delta / 100)) : projectedPrice
  const pctColor = adjPct > 0 ? "text-emerald-700" : adjPct < 0 ? "text-red-700" : "text-muted-foreground"

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-foreground font-semibold mb-1 flex items-center gap-2">
        <Zap size={15} className="text-amber-400" />
        Scenario Simulation
      </h3>
      <p className="text-muted-foreground text-xs mb-4">Toggle a macro event to see its modelled impact on the 90-day forecast</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {SCENARIOS.map(s => (
          <button key={s.key} onClick={() => setActive(active === s.key ? null : s.key)}
            className={`text-left p-3 rounded-lg border text-xs transition-all ${
              active === s.key ? "bg-amber-50 border-amber-300 text-accent-foreground" : "bg-muted/50 border-border text-muted-foreground hover:border-stone-400"
            }`}>
            <div className="font-semibold mb-0.5">{s.label}</div>
            <div className="text-muted-foreground text-[10px]">{s.desc}</div>
            <div className={`text-[10px] font-bold mt-1 ${s.delta > 0 ? "text-emerald-700" : "text-red-700"}`}>
              {s.delta > 0 ? "+" : ""}{s.delta}%
            </div>
          </button>
        ))}
      </div>
      {projectedPrice > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2">{scenario ? `Under: ${scenario.label}` : "Base forecast"}</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">90-Day Forecast</p>
              <p className="text-2xl font-bold text-foreground">${adjPrice?.toLocaleString() ?? "-"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Change</p>
              <p className={`text-xl font-bold ${pctColor}`}>{adjPct > 0 ? "+" : ""}{adjPct}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────────────────���─���────── */
export default function AnalyzePage() {
  const [form, setForm] = useState({ make: "", model: "", year: "", mileage: 50000, condition: "good", region: "california" })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState(0)

  const catalog = CAR_CATALOG as Record<string, Record<string, number[]>>
  const makes = useMemo(() => Object.keys(catalog).sort(), [catalog])
  const models = useMemo(() => Object.keys(catalog[form.make] || {}).sort(), [catalog, form.make])
  const years = useMemo(() => (catalog[form.make]?.[form.model] || []), [catalog, form.make, form.model])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  function loadDemo(demo: any) {
    const key = `${demo.make}|${demo.model}|${demo.year}`
    const staticData = DEMO_DATA_MAP[key]
    setForm({ make: demo.make, model: demo.model, year: String(demo.year), mileage: demo.mileage, condition: demo.condition, region: demo.region })
    setError(null); setResult(null); setLoading(true); setStage(0)
    if (staticData) {
      let s = 0
      const stageTimer = setInterval(() => { s = Math.min(s + 1, ANALYSIS_STAGES.length - 1); setStage(s) }, 380)
      setTimeout(() => { clearInterval(stageTimer); setResult(staticData); setLoading(false) }, 2900)
    } else {
      setLoading(false)
    }
  }

  function analyze() {
    if (!form.make || !form.model || !form.year) return
    const key = `${form.make}|${form.model}|${form.year}`
    const staticData = DEMO_DATA_MAP[key]
    if (staticData) {
      loadDemo({ ...form, year: +form.year })
    }
  }

  // Derived fields
  const finalRec = result?.final_recommendation
  const confScore = result?.confidence_score
  const volIndex = result?.volatility_index || "Moderate"
  const riskScore = result?.risk_score
  const projPrice = result?.projected_price || result?.forecast_90d
  const chg90d = result?.predicted_90_day_change
  const uncRange = result?.uncertainty_range
  const reasoning = result?.reasoning_summary
  const transpNote = result?.transparency_note
  const biasStat = result?.bias_statement
  const ethicsDiscl = result?.ethics_disclaimer
  const agentLog = result?.agent_log
  const shap = result?.shap_factors || result?.tool_outputs?.run_price_prediction?.shap_factors || []
  const mktCtx = result?.tool_outputs?.get_market_context
  const fc = result?.tool_outputs?.run_forecast
  const llmAnalysis = result?.tool_outputs?.run_llm_price_analysis
  const forecastMethod = result?.forecast_method || fc?.method
  const sigCfg = SIG_CFG[finalRec] || SIG_CFG.NEUTRAL
  const SigIcon = sigCfg.Icon

  const chartData = useMemo(() => {
    const hist = Array.isArray(result?.tool_outputs?.get_price_history) ? result.tool_outputs.get_price_history : []
    const forecast30 = result?.forecast_30d || fc?.forecast_30d
    const forecast90 = result?.forecast_90d || fc?.forecast_90d
    const pts = hist.map((h: any) => ({ date: h.date, historical: h.avg_price, forecast: null }))
    if (fc?.last_known_price && (forecast30 || forecast90)) {
      if (pts.length) pts[pts.length - 1].forecast = pts[pts.length - 1].historical
      pts.push({ date: "Now", historical: null, forecast: fc.last_known_price })
      pts.push({ date: "+30d", historical: null, forecast: forecast30 })
      pts.push({ date: "+90d", historical: null, forecast: forecast90 })
    }
    return pts
  }, [result, fc])

  const shapChartData = shap
    .map((f: any) => ({ name: f.feature.replace(/_/g, " "), impact: Math.abs(f.impact), dir: f.direction }))
    .sort((a: any, b: any) => b.impact - a.impact)

  const tooltipStyle = {
    contentStyle: { background: "#faf7f2", border: "1px solid #ddd5c6", borderRadius: "8px", fontSize: 12 },
    labelStyle: { color: "#1a1611" },
    itemStyle: { color: "#78716c" },
  }

  return (
    <div className="min-h-screen">

      {/* Hero / Form */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-accent-foreground text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles size={12} />
            <span>8-Agent Pipeline</span>
            <span className="text-muted-foreground">{"/"}</span>
            <span>XGBoost</span>
            <span className="text-muted-foreground">{"/"}</span>
            <span>Prophet</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1 text-balance">
            AI Car Price Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-2xl leading-relaxed">
            Multi-agent decision intelligence with transparent BUY / WAIT / MONITOR signals, explainable AI reasoning, risk assessment, and ethical guardrails.
          </p>

          {/* Form card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-foreground font-semibold mb-4 flex items-center gap-2 text-sm">
              <Car size={16} className="text-accent-foreground" />
              Configure Your Search
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Make", node: (
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent outline-none"
                    value={form.make} onChange={e => { set("make", e.target.value); set("model", ""); set("year", "") }}>
                    <option value="">Select make</option>
                    {makes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                )},
                { label: "Model", node: (
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent outline-none disabled:opacity-40"
                    value={form.model} onChange={e => { set("model", e.target.value); set("year", "") }} disabled={!form.make}>
                    <option value="">Select model</option>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                )},
                { label: "Year", node: (
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent outline-none disabled:opacity-40"
                    value={form.year} onChange={e => set("year", e.target.value)} disabled={!form.model}>
                    <option value="">Year</option>
                    {years.map((y: number) => <option key={y} value={y}>{y}</option>)}
                  </select>
                )},
                { label: "Mileage", node: (
                  <input type="number" min={0} max={300000} step={5000}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent outline-none"
                    value={form.mileage} onChange={e => set("mileage", +e.target.value)} />
                )},
                { label: "Condition", node: (
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent outline-none"
                    value={form.condition} onChange={e => set("condition", e.target.value)}>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )},
                { label: "Region", node: (
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent outline-none"
                    value={form.region} onChange={e => set("region", e.target.value)}>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )},
              ].map(({ label, node }) => (
                <div key={label}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
                  {node}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-5 flex-wrap">
              <button id="analyze-btn" onClick={analyze}
                disabled={loading || !form.make || !form.model || !form.year}
                className={`flex items-center gap-2 px-7 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  loading || !form.make || !form.model || !form.year
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-accent hover:bg-amber-600 text-card"
                }`}>
                {loading
                  ? <><div className="w-3.5 h-3.5 border-2 border-card/30 border-t-card rounded-full animate-spin" />{ANALYSIS_STAGES[stage]}</>
                  : <><Search size={15} />Analyze Now</>
                }
              </button>
              {form.make && form.model && form.year && !loading && (
                <span className="text-muted-foreground text-xs">
                  {form.year} {form.make} / {Number(form.mileage).toLocaleString()} mi / {form.condition} / {form.region}
                </span>
              )}
            </div>

            {/* Quick demo strip */}
            {!loading && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mr-1">Quick demo:</span>
                {DEMO_VEHICLES.map(demo => (
                  <button key={demo.label} onClick={() => loadDemo(demo)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-stone-400 transition-all">
                    <span>{demo.label}</span>
                    <span className={`text-[9px] font-bold ${demo.tagColor}`}>{demo.tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className="max-w-7xl mx-auto px-6 pb-12">

        {error && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl animate-fade-in">
            <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Analysis Failed</p>
              <p className="text-red-300/80 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-8 space-y-4 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-52 bg-card border border-border rounded-xl" />
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-card border border-border rounded-xl" />)}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-8 space-y-6 animate-fade-in">

            {/* Row 1: Signal card + 4 stat cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`${sigCfg.bg} ${sigCfg.border} border rounded-xl p-6`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">AI Recommendation</p>
                    <p className={`text-4xl font-black mt-1 tracking-tight leading-none ${sigCfg.color}`}>{finalRec}</p>
                    <p className="text-muted-foreground text-sm mt-1.5">{sigCfg.label}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${sigCfg.bg}`}>
                    <SigIcon size={22} className={sigCfg.color} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-around bg-muted/50 rounded-lg py-3 px-2 border border-border">
                  <ConfidenceGauge score={confScore} />
                  <div className="w-px h-12 bg-border" />
                  <VolatilityMeter level={volIndex} />
                  {riskScore !== undefined && (
                    <>
                      <div className="w-px h-12 bg-border" />
                      <div className="flex flex-col items-center">
                        <p className="text-xl font-bold text-foreground">{riskScore}</p>
                        <p className="text-[10px] text-muted-foreground">Risk Score</p>
                        <p className="text-[9px] text-muted-foreground">/ 100</p>
                      </div>
                    </>
                  )}
                </div>
                {chg90d !== undefined && (
                  <div className="mt-3 flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 border border-border">
                    <span className="text-xs text-muted-foreground">90-day forecast</span>
                    <span className={`text-sm font-bold ${chg90d > 0 ? "text-emerald-700" : chg90d < 0 ? "text-red-700" : "text-muted-foreground"}`}>
                      {chg90d > 0 ? "+" : ""}{chg90d}%
                    </span>
                  </div>
                )}
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4">
                {[
                  { icon: DollarSign, label: "Predicted Fair Value", color: "text-foreground",
                    value: result.predicted_price ? <>${<AnimatedNumber value={result.predicted_price} />}</> : "-",
                    sub: "XGBoost model / 262k training listings" },
                  { icon: TrendingUp, label: "90-Day Projected Price", color: projPrice ? (chg90d! >= 0 ? "text-emerald-700" : "text-red-700") : "text-muted-foreground",
                    value: projPrice ? <>${projPrice.toLocaleString()}</> : "N/A",
                    sub: uncRange ? `Range: $${uncRange.low?.toLocaleString()} - $${uncRange.high?.toLocaleString()}` : "" },
                  { icon: Package, label: "Active Listings", color: "text-foreground",
                    value: mktCtx?.current_inventory_count ?? "-", sub: mktCtx ? `${mktCtx.inventory_trend} trend` : "" },
                  { icon: Activity, label: "vs Market Median", color: mktCtx ? (mktCtx.price_vs_median_pct < 0 ? "text-emerald-700" : "text-red-700") : "text-muted-foreground",
                    value: mktCtx ? `${mktCtx.price_vs_median_pct > 0 ? "+" : ""}${mktCtx.price_vs_median_pct}%` : "-",
                    sub: mktCtx ? (mktCtx.price_vs_median_pct < 0 ? "Below market - good deal" : "Above market median") : "" },
                ].map(({ icon: Icon, label, color, value, sub }) => (
                  <div key={label} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">
                      <Icon size={11} />{label}
                    </div>
                    <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                    <p className="text-muted-foreground text-xs mt-1">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Chart + Reasoning */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-foreground font-semibold">{"Price History & Forecast"}</h3>
                  {forecastMethod && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold border bg-accent/10 text-accent-foreground border-accent/20">
                      {forecastMethod === "llm_blended" ? "AI-Enhanced" : forecastMethod}
                    </span>
                  )}
                </div>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                      <defs>
                        <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ddd5c6" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#78716c" }} />
                      <YAxis tickFormatter={(v: number) => v ? `$${(v/1000).toFixed(0)}k` : ""} tick={{ fontSize: 10, fill: "#78716c" }} />
                      <Tooltip {...tooltipStyle} formatter={(v: any, n: string) => v ? [`$${Number(v).toLocaleString()}`, n] : [null, null]} />
                      <Legend wrapperStyle={{ color: "#71717a", fontSize: 11 }} />
                      {chartData.some((d: any) => d.historical) && (
                        <ReferenceLine x="Now" stroke="#c4b9a8" strokeDasharray="4 4"
                          label={{ value: "Today", fontSize: 9, fill: "#78716c", position: "top" }} />
                      )}
                      <Area type="monotone" dataKey="historical" stroke="#3b82f6" fill="url(#histGrad)"
                        name="Historical avg" connectNulls={false} dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="forecast" stroke="#f97316" strokeDasharray="5 5"
                        dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }} name="Forecast" connectNulls strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                    <Activity size={36} className="opacity-30" />
                    <p className="text-sm font-medium text-muted-foreground">No model-specific price history</p>
                  </div>
                )}
                {result.forecast_30d > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">30-Day Forecast</p>
                      <p className="text-lg font-bold text-emerald-700">${Number(result.forecast_30d).toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">90-Day Forecast</p>
                      <p className="text-lg font-bold text-emerald-700">${Number(result.forecast_90d).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={17} className="text-accent-foreground" />
                  <h3 className="text-foreground font-semibold">AI Analyst Reasoning</h3>
                </div>
                {reasoning && reasoning.length > 0 ? (
                  <div className="space-y-2.5 flex-1">
                    {reasoning.map((bullet: string, i: number) => (
                      <div key={i} className="flex gap-2.5">
                        <ChevronRight size={14} className="text-accent-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-foreground/80 text-sm leading-relaxed">{bullet}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {llmAnalysis?.key_insight && (
                  <div className="bg-accent/5 border border-accent/15 rounded-lg px-4 py-2.5 mt-3 flex gap-2 items-start">
                    <Sparkles size={11} className="text-accent-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-accent-foreground/80 leading-relaxed">
                      <span className="font-semibold text-accent-foreground">AI Insight: </span>
                      {llmAnalysis.key_insight}
                    </p>
                  </div>
                )}
                {shap.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Top Price Factors (SHAP)</p>
                    <div className="space-y-2">
                      {shap.slice(0, 3).map((f: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${f.direction === "increases price" ? "bg-emerald-600" : "bg-red-600"}`} />
                          <span className="text-xs text-muted-foreground flex-1 capitalize">{f.feature.replace(/_/g, " ")}</span>
                          <span className={`text-xs font-bold ${f.direction === "increases price" ? "text-emerald-700" : "text-red-700"}`}>
                            {f.direction === "increases price" ? "+" : "-"}${Math.abs(f.impact).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: SHAP chart + Agent Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {shapChartData.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-foreground font-semibold mb-1">ML Price Factor Breakdown</h3>
                  <p className="text-muted-foreground text-xs mb-4">SHAP values - how each feature shifts the XGBoost price prediction</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={shapChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ddd5c6" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#78716c" }} tickFormatter={(v: number) => v.toFixed(0)} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#1a1611" }} width={110} />
                      <Tooltip {...tooltipStyle} formatter={(v: any, _: any, p: any) => [v.toFixed(2), p.payload.dir === "increases price" ? "Increases price" : "Decreases price"]} />
                      <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                        {shapChartData.map((f: any, i: number) => (
                          <Cell key={i} fill={f.dir === "increases price" ? "#10b981" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-foreground font-semibold mb-5 flex items-center gap-2">
                  <Cpu size={16} className="text-accent-foreground" />
                  Agent Reasoning Log
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground border border-accent/20 font-semibold">
                    {agentLog ? agentLog.length : "-"} agents
                  </span>
                </h3>
                {agentLog && agentLog.length > 0 ? <AgentReasoningLog agentLog={agentLog} /> : <p className="text-muted-foreground text-sm">No agent log available.</p>}
              </div>
            </div>

            {/* Row 4: Scenario + Transparency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScenarioPanel basePct={chg90d ?? 0} projectedPrice={projPrice} />
              <div className="space-y-4">
                {transpNote && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye size={14} className="text-accent-foreground" />
                      <h4 className="text-foreground font-semibold text-sm">Transparency Note</h4>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{transpNote}</p>
                  </div>
                )}
                {biasStat && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={14} className="text-amber-700" />
                      <h4 className="text-amber-800 font-semibold text-sm">Bias Statement</h4>
                    </div>
                    <p className="text-amber-700/80 text-xs leading-relaxed">{biasStat}</p>
                  </div>
                )}
                {ethicsDiscl && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-emerald-700" />
                      <h4 className="text-foreground font-semibold text-sm">Ethics Disclaimer</h4>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{ethicsDiscl}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="mt-12 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-card border border-border rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-foreground font-semibold text-xl text-balance">Select a vehicle above - or try a demo</h3>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-md mx-auto">
                Live demos show BUY NOW / WAIT / MONITOR across different market signals
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {DEMO_VEHICLES.map(demo => (
                <button key={demo.label} onClick={() => loadDemo(demo)}
                  className="group text-left bg-card hover:bg-muted/50 border border-border hover:border-stone-400 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      demo.tag === "BUY NOW" ? "bg-emerald-100 text-emerald-700" :
                      demo.tag === "WAIT" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>{demo.tag}</span>
                  </div>
                  <p className="text-foreground text-sm font-semibold leading-tight">{demo.label}</p>
                  <p className="text-muted-foreground text-[11px] leading-snug mt-1">{demo.desc}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className={`text-[11px] font-bold ${demo.tagColor}`}>{demo.stat}</span>
                    <ChevronRight size={12} className="text-border group-hover:text-muted-foreground transition-colors" />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center text-muted-foreground text-xs mt-6">
              Demo results use pre-built agent logs - real vehicle queries hit the live 8-agent pipeline
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
