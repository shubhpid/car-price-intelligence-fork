import { createContext, useContext, useState } from 'react'
import AnalyzeTab      from './components/AnalyzeTab'
import MarketOverview  from './components/MarketOverview'
import HowItWorks      from './components/HowItWorks'

export const AppContext = createContext()
export const useApp = () => useContext(AppContext)

const TABS = ['Analyze', 'Market Overview', 'How It Works']

export default function App() {
  const [activeTab,  setActiveTab]  = useState(0)
  const [pendingCar, setPendingCar] = useState(null)   // set by MarketOverview, consumed by AnalyzeTab

  return (
    <AppContext.Provider value={{ pendingCar, setPendingCar, setActiveTab }}>
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-3 shadow-lg">
          <span className="text-2xl">🚗</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Car Price Intelligence</h1>
            <p className="text-slate-400 text-xs">AI-powered buy / wait signals · Powered by GPT-4o-mini + XGBoost</p>
          </div>
        </header>

        {/* Tab bar */}
        <nav className="bg-white border-b border-slate-200 px-6 flex gap-1 shadow-sm">
          {TABS.map((label, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {activeTab === 0 && <AnalyzeTab />}
          {activeTab === 1 && <MarketOverview />}
          {activeTab === 2 && <HowItWorks />}
        </main>
      </div>
    </AppContext.Provider>
  )
}
