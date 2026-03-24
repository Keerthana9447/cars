export const SCENARIOS = {
  safe: {
    speed: [20,28,35,40,42,45,43,40,38,35,30,25,22,20,18,20,25,28,30,28,25,20,18,15,12,10,8,5,0],
    acceleration: [1.2,1.4,1.1,0.8,0.3,0.1,-0.2,-0.5,-0.4,-0.6,-0.7,-0.8,-0.5,-0.3,-0.4,0.5,1.1,0.8,0.5,0,-0.5,-0.7,-0.5,-0.4,-0.5,-0.3,-0.4,-0.5,-0.8],
    road_type: 'city',
    weather: 'clear',
  },
  moderate: {
    speed: [30,42,55,68,72,75,70,65,55,45,30,20,28,40,58,65,60,55,48,40,35,28,20,15,10,8,5,3,0],
    acceleration: [1.8,2.1,2.0,1.9,0.5,0.1,-0.8,-1.3,-2.1,-2.4,-2.8,-2.0,1.2,2.3,2.8,0.9,-0.8,-1.2,-1.8,-2.1,-1.1,-1.3,-1.5,-1.0,-0.8,-0.5,-0.6,-0.4,-0.8],
    road_type: 'city',
    weather: 'clear',
  },
  risky: {
    speed: [40,58,75,90,95,100,102,95,80,50,30,20,45,70,95,100,98,90,75,50,30,20,15,10,8,6,4,2,0],
    acceleration: [2.8,3.1,3.0,2.8,0.8,0.2,-1.5,-3.2,-4.5,-5.1,-4.8,-3.5,2.8,3.5,3.8,0.5,-1.2,-2.8,-4.2,-4.8,-3.5,-2.0,-1.5,-1.0,-0.6,-0.5,-0.5,-0.4,-1.0],
    road_type: 'traffic',
    weather: 'rain',
  },
}

export const ROAD_FACTORS   = { highway: 0.8, city: 1.2, traffic: 1.5 }
export const WEATHER_FACTORS = { clear: 1.0, rain: 1.4, fog: 1.2 }

export const ROAD_LABELS    = { highway: 'Highway', city: 'City Road', traffic: 'Heavy Traffic' }
export const WEATHER_LABELS  = { clear: 'Clear', rain: 'Rain', fog: 'Fog' }

export const TIME_LABELS = Array.from({ length: 29 }, (_, i) => `${i * 2}s`)
