import React, { useState, useEffect } from 'react'
import { Sun, CloudRain, Cloud, Wind, Droplets, CloudSun } from 'lucide-react'
import axios from 'axios'

interface WeatherWidgetProps {
  city?: string
}

export default function WeatherWidget({ city = 'Rajahmundry' }: WeatherWidgetProps) {
  const [temp, setTemp] = useState(28)
  const [condition, setCondition] = useState('Partly Cloudy')
  const [humidity, setHumidity] = useState(65)
  const [wind, setWind] = useState(12)
  const [highTemp, setHighTemp] = useState(31)
  const [lowTemp, setLowTemp] = useState(24)
  const [alerts, setAlerts] = useState('No rain alerts for next 6 hours.')

  useEffect(() => {
    const apiKey = (import.meta as any).env.VITE_OPENWEATHER_API_KEY || 'c54ae8e21c2805eb17bdb6a4e34a2940'
    const cleanCity = city.replace(', India', '').trim()
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cleanCity}&units=metric&appid=${apiKey}`

    axios.get(url)
      .then((res) => {
        const data = res.data
        if (data && data.main) {
          setTemp(Math.round(data.main.temp))
          setHumidity(data.main.humidity)
          setWind(Math.round(data.wind.speed * 3.6)) // convert m/s to km/h
          setHighTemp(Math.round(data.main.temp_max))
          setLowTemp(Math.round(data.main.temp_min))
          
          if (data.weather && data.weather.length > 0) {
            const cond = data.weather[0].main
            const desc = data.weather[0].description
            setCondition(cond + " (" + desc + ")")
            
            if (cond.toLowerCase().includes("rain") || cond.toLowerCase().includes("drizzle")) {
              setAlerts("Possibility of showers. Carrying an umbrella is advised.")
            } else {
              setAlerts("Clear skies. Perfect conditions for outdoor plans.")
            }
          }
        }
      })
      .catch(() => {
        // Fallback defaults on rate limits/offline
        if (cleanCity.toLowerCase() === 'goa') {
          setTemp(28)
          setCondition('Partly Cloudy')
          setHumidity(65)
          setWind(12)
          setHighTemp(31)
          setLowTemp(24)
        } else {
          setTemp(32)
          setCondition('Clear Sky')
          setHumidity(55)
          setWind(8)
          setHighTemp(35)
          setLowTemp(27)
        }
      })
  }, [city])

  const getWeatherIcon = () => {
    const condLower = condition.toLowerCase()
    if (condLower.includes('rain') || condLower.includes('drizzle')) return <CloudRain size={36} />
    if (condLower.includes('cloud')) return <CloudSun size={36} />
    return <Sun size={36} />
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg h-full flex flex-col justify-between">
      <div className="absolute right-[-10px] top-[-10px] opacity-10">
        <Sun size={150} />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Live Weather</span>
          <h3 className="text-lg font-bold tracking-tight">{city}</h3>
        </div>

        <div className="flex items-center gap-5">
          <div className="p-2 bg-white/10 rounded-xl">
            {getWeatherIcon()}
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-extrabold tracking-tighter">{temp}°C</span>
            <span className="text-xs opacity-75">{condition}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 text-xs">
          <div className="flex items-center gap-2">
            <Droplets size={14} className="opacity-75" />
            <span>Humidity: {humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={14} className="opacity-75" />
            <span>Wind: {wind} km/h</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-2.5 text-[10px] border border-white/10 mt-1">
          <span className="font-semibold">Concierge Note:</span> {alerts}
        </div>
      </div>
    </div>
  )
}
