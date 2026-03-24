import React from 'react'

const dotColor = { ok: 'bg-green-400', warn: 'bg-yellow-400', danger: 'bg-red-400' }

export default function AlertsPanel({ alerts }) {
  return (
    <div className="bg-[#161b27] border border-slate-700/50 rounded-xl p-4 h-full">
      <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-widest">Event Alerts</p>
      <div className="space-y-2">
        {(alerts || []).map((a, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/40 last:border-0">
            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor[a.type] || 'bg-slate-400'}`} />
            <div>
              <p className="text-sm text-slate-200">{a.msg}</p>
              <p className="text-xs text-slate-500">{a.time}</p>
            </div>
          </div>
        ))}
        {!alerts?.length && (
          <p className="text-sm text-slate-500">No data yet — run an analysis.</p>
        )}
      </div>
    </div>
  )
}
