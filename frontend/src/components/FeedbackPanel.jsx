import React from 'react'

const insightBg = {
  pos:  'border-l-2 border-green-500 bg-green-900/20 text-green-300',
  neg:  'border-l-2 border-red-500 bg-red-900/20 text-red-300',
  warn: 'border-l-2 border-yellow-500 bg-yellow-900/20 text-yellow-300',
}

export default function FeedbackPanel({ result }) {
  const { badge, insights, finalScore, avgJerk } = result || {}

  const badges = [
    { label: '🛡 Safe Rider',    earned: finalScore >= 80 },
    { label: '🌿 Smooth Rider',  earned: avgJerk < 0.8 && finalScore >= 70 },
    { label: '⚠ Risky Rider',   earned: finalScore < 50, danger: true },
  ]

  return (
    <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4 h-full">
      <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-widest">Rider Feedback & Badges</p>

      {/* Gamification badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {badges.filter(b => b.earned).map((b, i) => (
          <span key={i} className={`text-xs px-3 py-1.5 rounded-full font-medium
            ${b.danger
              ? 'bg-red-900/40 text-red-400 border border-red-700/50'
              : 'bg-green-900/40 text-green-400 border border-green-700/50'}`}>
            {b.label}
          </span>
        ))}
        {!badges.some(b => b.earned) && (
          <span className="text-xs text-slate-500 italic">Run an analysis to earn badges</span>
        )}
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {(insights || []).map((tip, i) => (
          <div key={i} className={`text-xs px-3 py-2 rounded-lg ${insightBg[tip.cls] || ''}`}>
            {tip.text}
          </div>
        ))}
      </div>
    </div>
  )
}
