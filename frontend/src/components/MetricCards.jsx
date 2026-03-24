import React from 'react'

function MetricCard({ label, value, unit, status }) {
  const colors = {
    ok:   'text-green-400',
    warn: 'text-yellow-400',
    danger: 'text-red-400',
    default: 'text-slate-100',
  }
  return (
    <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${colors[status] || colors.default}`}>{value ?? '--'}</p>
      <p className="text-xs text-slate-500 mt-0.5">{unit}</p>
    </div>
  )
}

export default function MetricCards({ result }) {
  if (!result) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {['Max Speed','Harsh Brakes','Avg Jerk','Risk Score'].map(l => (
        <MetricCard key={l} label={l} value="--" unit="" />
      ))}
    </div>
  )

  const { maxSpeed, harshBrakes, avgJerk, riskScore } = result

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricCard label="Max Speed"    value={maxSpeed}    unit="km/h"
        status={maxSpeed > 80 ? 'danger' : maxSpeed > 60 ? 'warn' : 'ok'} />
      <MetricCard label="Harsh Brakes" value={harshBrakes} unit="events"
        status={harshBrakes > 2 ? 'danger' : harshBrakes > 0 ? 'warn' : 'ok'} />
      <MetricCard label="Avg Jerk"     value={avgJerk}     unit="m/s³"
        status={avgJerk > 1.5 ? 'danger' : avgJerk > 0.8 ? 'warn' : 'ok'} />
      <MetricCard label="Risk Score"   value={riskScore}   unit="raw × context"
        status={riskScore > 50 ? 'danger' : riskScore > 20 ? 'warn' : 'ok'} />
    </div>
  )
}
