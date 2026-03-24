import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE, timeout: 5000 })

export async function analyzeRide(payload) {
  const { data } = await api.post('/analyze', payload)
  return data
}

export async function fetchSampleData(scenario = 'moderate') {
  const { data } = await api.get(`/sample-data?scenario=${scenario}`)
  return data
}

export async function fetchInsights() {
  const { data } = await api.get('/insights')
  return data
}

export async function healthCheck() {
  try {
    const { data } = await api.get('/health')
    return data.status === 'ok'
  } catch {
    return false
  }
}
