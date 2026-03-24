import React, { useEffect, useRef } from 'react'
import { scoreColor } from '../utils/scoring'

const CIRCUMFERENCE = 2 * Math.PI * 54  // r=54

export default function ScoreRing({ score, riskLevel }) {
  const fillRef = useRef(null)

  useEffect(() => {
    if (!fillRef.current) return
    const offset = CIRCUMFERENCE * (1 - (score || 0) / 100)
    fillRef.current.style.stroke = scoreColor(score || 0)
    fillRef.current.style.strokeDashoffset = offset
  }, [score])

  const levelColors = {
    Safe:     'bg-green-900/40 text-green-400 border border-green-700/50',
    Moderate: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50',
    Risky:    'bg-red-900/40 text-red-400 border border-red-700/50',
  }

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest">CARS Score</p>
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 130 130">
          <circle className="ring-track" cx="65" cy="65" r="54" />
          <circle
            ref={fillRef}
            className="ring-fill"
            cx="65" cy="65" r="54"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold">{score ?? '--'}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      {riskLevel && (
        <span className={`mt-3 text-xs font-medium px-3 py-1 rounded-full ${levelColors[riskLevel] || ''}`}>
          {riskLevel}
        </span>
      )}
    </div>
  )
}
