import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceDot, ResponsiveContainer, Legend,
} from 'recharts'
import { TIME_LABELS } from '../data/scenarios'

function buildChartData(speed, acceleration) {
  return speed.map((s, i) => ({
    t: TIME_LABELS[i] || `${i * 2}s`,
    speed: s,
    accel: acceleration[i] ?? 0,
  }))
}

function CustomDot({ cx, cy, value, threshold, color, warnColor }) {
  const isWarning = Math.abs(value) > threshold
  return (
    <circle
      cx={cx} cy={cy}
      r={isWarning ? 5 : 3}
      fill={isWarning ? warnColor : color}
      stroke="none"
    />
  )
}

export default function RideCharts({ speed, acceleration }) {
  if (!speed || !acceleration) return null
  const data = buildChartData(speed, acceleration)

  const axisStyle = { fill: '#64748b', fontSize: 11 }
  const gridColor = 'rgba(255,255,255,0.05)'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Speed Chart */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-medium text-slate-400 mb-3">Speed vs Time (km/h)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="t" tick={axisStyle} interval={4} />
            <YAxis tick={axisStyle} />
            <Tooltip
              contentStyle={{ background: '#1e2430', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#38bdf8' }}
            />
            <Line
              type="monotone" dataKey="speed"
              stroke="#378add" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: '#378add' }}
            />
            {data.map((d, i) =>
              d.speed > 80 ? (
                <ReferenceDot key={i} x={d.t} y={d.speed} r={5} fill="#ef4444" stroke="none" />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-1">● Red dots = overspeed events (&gt;80 km/h)</p>
      </div>

      {/* Acceleration Chart */}
      <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-medium text-slate-400 mb-3">Acceleration vs Time (m/s²)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="t" tick={axisStyle} interval={4} />
            <YAxis tick={axisStyle} />
            <Tooltip
              contentStyle={{ background: '#1e2430', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#1D9E75' }}
            />
            <Line
              type="monotone" dataKey="accel"
              stroke="#1D9E75" strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: '#1D9E75' }}
            />
            {data.map((d, i) =>
              d.accel < -2.5 || d.accel > 2.5 ? (
                <ReferenceDot key={i} x={d.t} y={d.accel} r={5} fill="#ef4444" stroke="none" />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-500 mt-1">● Red dots = harsh events (&gt;2.5 or &lt;-2.5 m/s²)</p>
      </div>
    </div>
  )
}
