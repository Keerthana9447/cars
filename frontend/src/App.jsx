import React, { useState, useEffect, useCallback } from 'react'
import ScoreRing from './components/ScoreRing'
import RideCharts from './components/RideCharts'
import MetricCards from './components/MetricCards'
import AlertsPanel from './components/AlertsPanel'
import FeedbackPanel from './components/FeedbackPanel'
import { SCENARIOS, ROAD_FACTORS, WEATHER_FACTORS, ROAD_LABELS, WEATHER_LABELS } from './data/scenarios'
import { computeScore } from './utils/scoring'
import { analyzeRide, healthCheck } from './utils/api'

const ROAD_OPTIONS    = ['highway', 'city', 'traffic']
const WEATHER_OPTIONS = ['clear', 'rain', 'fog']

export default function App() {
  const [roadType,   setRoadType]   = useState('city')
  const [weather,    setWeather]    = useState('clear')
  const [scenario,   setScenario]   = useState('moderate')
  const [rideData,   setRideData]   = useState(SCENARIOS.moderate)
  const [result,     setResult]     = useState(null)
  const [backendUp,  setBackendUp]  = useState(false)
  const [usingAPI,   setUsingAPI]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [livePulse,  setLivePulse]  = useState(true)

  // Ping backend on mount
  useEffect(() => {
    healthCheck().then(ok => setBackendUp(ok))
  }, [])

  // Blink live indicator
  useEffect(() => {
    const id = setInterval(() => setLivePulse(p => !p), 700)
    return () => clearInterval(id)
  }, [])

  const runAnalysis = useCallback(async (data, road, wthr) => {
    setLoading(true)
    try {
      if (backendUp) {
        const res = await analyzeRide({
          speed: data.speed,
          acceleration: data.acceleration,
          road_type: road,
          weather: wthr,
        })
        // Map backend response to frontend shape
        setResult({
          finalScore:       res.final_score,
          riskScore:        Math.round(res.risk_score),
          riskLevel:        res.risk_level,
          ctxFactor:        res.context_factor,
          maxSpeed:         res.max_speed,
          harshBrakes:      res.harsh_brake_count,
          aggressiveAccel:  res.aggressive_accel_count,
          avgJerk:          res.avg_jerk,
          alerts:           res.alerts.map(msg => ({ type: msg.toLowerCase().includes('crash') || msg.toLowerCase().includes('harsh') ? 'danger' : msg.includes('No sig') ? 'ok' : 'warn', msg, time: '' })),
          insights:         res.insights.map(text => ({ cls: text.includes('Excellent') || text.includes('Model') ? 'pos' : text.includes('too') || text.includes('Frequent') ? 'neg' : 'warn', text })),
          badge:            { label: res.badge },
        })
        setUsingAPI(true)
      } else {
        // Offline fallback
        const r = computeScore(data.speed, data.acceleration, road, wthr)
        setResult(r)
        setUsingAPI(false)
      }
    } catch (err) {
      console.warn('API error, falling back to local scoring:', err)
      const r = computeScore(data.speed, data.acceleration, road, wthr)
      setResult(r)
      setUsingAPI(false)
    } finally {
      setLoading(false)
    }
  }, [backendUp])

  // Auto-run when selections change
  useEffect(() => {
    runAnalysis(rideData, roadType, weather)
  }, [rideData, roadType, weather])

  function handleScenario(s) {
    const d = { ...SCENARIOS[s], road_type: roadType, weather }
    setScenario(s)
    setRideData(d)
  }

  const ctxFactor = ((ROAD_FACTORS[roadType] || 1.2) * (WEATHER_FACTORS[weather] || 1.0)).toFixed(2)

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-blue-600/30 border border-blue-500/50 rounded-lg flex items-center justify-center text-lg">🏍</div>
          <div>
            <h1 className="text-base font-semibold leading-tight">Context-Aware Riding Score</h1>
            <p className="text-xs text-slate-400">AI-powered two-wheeler behavior analysis</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {/* API status */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${backendUp ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-xs text-slate-400">{backendUp ? 'API connected' : 'Offline mode'}</span>
            </div>
            {/* Live pulse */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-green-400 transition-opacity duration-300 ${livePulse ? 'opacity-100' : 'opacity-30'}`} />
              <span className="text-xs text-slate-400">Live simulation</span>
            </div>
          </div>
        </div>

        {/* ── Top Row: Score + Context ── */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 mb-4">

          {/* Score Card */}
          <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5 flex flex-col items-center justify-center">
            <ScoreRing score={result?.finalScore} riskLevel={result?.riskLevel} />
            <p className="text-xs text-slate-500 mt-3">
              Context ×{result?.ctxFactor ?? ctxFactor}
            </p>
          </div>

          {/* Context Panel */}
          <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">Context & Environment</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Road Type</label>
                <select
                  value={roadType}
                  onChange={e => setRoadType(e.target.value)}
                  className="w-full bg-[#0f1117] border border-slate-600/60 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {ROAD_OPTIONS.map(r => (
                    <option key={r} value={r}>
                      {ROAD_LABELS[r]} (×{ROAD_FACTORS[r]})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Weather</label>
                <select
                  value={weather}
                  onChange={e => setWeather(e.target.value)}
                  className="w-full bg-[#0f1117] border border-slate-600/60 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  {WEATHER_OPTIONS.map(w => (
                    <option key={w} value={w}>
                      {WEATHER_LABELS[w]} (×{WEATHER_FACTORS[w]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scenario Buttons */}
            <p className="text-xs text-slate-400 mb-2">Load Ride Scenario</p>
            <div className="flex gap-2 mb-4">
              {['safe', 'moderate', 'risky'].map(s => (
                <button
                  key={s}
                  onClick={() => handleScenario(s)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize
                    ${scenario === s
                      ? s === 'safe'     ? 'bg-green-700/40 border-green-600/60 text-green-300'
                      : s === 'moderate' ? 'bg-yellow-700/40 border-yellow-600/60 text-yellow-300'
                                         : 'bg-red-700/40 border-red-600/60 text-red-300'
                      : 'bg-transparent border-slate-600/40 text-slate-400 hover:bg-slate-700/30'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Context tags */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-blue-900/30 text-blue-400 border border-blue-700/40">
                {ROAD_LABELS[roadType]}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-purple-900/30 text-purple-400 border border-purple-700/40">
                {WEATHER_LABELS[weather]}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-700/40 text-slate-400 border border-slate-600/40">
                Context ×{ctxFactor}
              </span>
              {usingAPI && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-green-900/30 text-green-400 border border-green-700/40">
                  FastAPI
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div className="mb-4">
          <MetricCards result={result} />
        </div>

        {/* ── Charts ── */}
        <div className="mb-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
              Analyzing ride data...
            </div>
          ) : (
            <RideCharts speed={rideData?.speed} acceleration={rideData?.acceleration} />
          )}
        </div>

        {/* ── Alerts + Feedback ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AlertsPanel alerts={result?.alerts} />
          <FeedbackPanel result={result} />
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-700/40 pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            CARS v1.0 · Rule-based scoring · ML-ready architecture
          </p>
          <p className="text-xs text-slate-500">
            Future: GPS tracking · Mobile app · Insurance scoring
          </p>
        </div>

      </div>
    </div>
  )
}
