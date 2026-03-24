import { ROAD_FACTORS, WEATHER_FACTORS, ROAD_LABELS, WEATHER_LABELS } from '../data/scenarios'

export function computeScore(speed, acceleration, road_type, weather) {
  const maxSpeed       = Math.max(...speed)
  const harshBrakes    = acceleration.filter(a => a < -2.5).length
  const aggressiveAccel = acceleration.filter(a => a > 2.5).length
  const overSpeedCount = speed.filter(s => s > 80).length

  const jerkVals = acceleration.slice(1).map((a, i) => Math.abs(a - acceleration[i]))
  const avgJerk  = jerkVals.reduce((s, v) => s + v, 0) / (jerkVals.length || 1)
  const minDecel = Math.min(...acceleration)

  let rawRisk = 0
  rawRisk += (maxSpeed / 120) * 30
  rawRisk += harshBrakes * 8
  rawRisk += aggressiveAccel * 5
  rawRisk += Math.min(avgJerk * 8, 20)
  rawRisk += overSpeedCount * 3
  rawRisk = Math.min(rawRisk, 100)

  const ctxFactor  = parseFloat(((ROAD_FACTORS[road_type] || 1.2) * (WEATHER_FACTORS[weather] || 1.0)).toFixed(2))
  const riskScore  = Math.min(rawRisk * ctxFactor, 100)
  const finalScore = Math.max(0, Math.round(100 - riskScore))

  const riskLevel = finalScore >= 80 ? 'Safe' : finalScore >= 50 ? 'Moderate' : 'Risky'

  const alerts = []
  if (harshBrakes > 0)      alerts.push({ type: 'danger', msg: `Harsh braking detected (${harshBrakes} events)`, time: 'Multiple timestamps' })
  if (overSpeedCount > 0)   alerts.push({ type: 'warn',   msg: `Overspeeding in ${ROAD_LABELS[road_type]} zone`, time: 'Exceeded 80 km/h' })
  if (aggressiveAccel > 0)  alerts.push({ type: 'warn',   msg: `Aggressive acceleration (${aggressiveAccel} events)`, time: 'Multiple timestamps' })
  if (minDecel < -4.0)      alerts.push({ type: 'danger', msg: `Crash risk: sudden deceleration (${minDecel.toFixed(1)} m/s²)`, time: 'Critical event' })
  if (weather !== 'clear')  alerts.push({ type: 'warn',   msg: `${WEATHER_LABELS[weather]} conditions — caution`, time: 'Entire ride' })
  if (!alerts.length)        alerts.push({ type: 'ok',     msg: 'No significant events — great riding!', time: 'All clear' })

  const insights = []
  if (harshBrakes > 2)       insights.push({ cls: 'neg',  text: 'You brake too aggressively. Increase following distance.' })
  else if (harshBrakes > 0)  insights.push({ cls: 'warn', text: 'Occasional hard braking. Try anticipating stops earlier.' })
  if (overSpeedCount > 3)    insights.push({ cls: 'neg',  text: 'Frequent overspeeding. Stay within context speed limits.' })
  if (aggressiveAccel > 2)   insights.push({ cls: 'warn', text: 'Throttle control needs improvement — ease into acceleration.' })
  if (weather !== 'clear')   insights.push({ cls: 'warn', text: `${WEATHER_LABELS[weather]} conditions detected — extra caution.` })
  if (finalScore >= 80)      insights.push({ cls: 'pos',  text: 'Excellent smooth control throughout. Keep it up!' })
  if (!insights.length)      insights.push({ cls: 'pos',  text: 'Smooth, context-aware riding. Model rider!' })

  const badge =
    finalScore >= 80 ? { label: '🛡 Safe Rider',      cls: 'safe' } :
    finalScore >= 50 ? { label: '⚡ Developing Rider', cls: 'moderate' } :
                       { label: '⚠ Risky Rider',       cls: 'risky' }

  return {
    finalScore, riskScore: Math.round(riskScore), riskLevel,
    ctxFactor, maxSpeed, harshBrakes, aggressiveAccel,
    avgJerk: parseFloat(avgJerk.toFixed(2)), overSpeedCount,
    alerts, insights, badge,
  }
}

export function scoreColor(score) {
  if (score >= 80) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}
