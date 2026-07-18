import React from 'react'
import { Sun, CloudRain, Cloud, Wind, Droplets } from 'lucide-react'

interface WeatherWidgetProps {
  city?: string
}

export default function WeatherWidget({ city = 'Goa' }: WeatherWidgetProps) {
  // Mock weather data matching Goa
  const weather = {
    temp: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    wind: 12,
    alerts: 'No rain alerts for next 6 hours.'
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
      <div className="absolute right-[-10px] top-[-10px] opacity-10">
        <Sun size={150} />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-75">Current Weather</span>
          <h3 className="text-xl font-bold tracking-tight">{city}, India</h3>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-5xl font-extrabold tracking-tighter">{weather.temp}°C</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{weather.condition}</span>
            <span className="text-xs opacity-75">H: 31° L: 24°</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="opacity-75" />
            <span>Humidity: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={16} className="opacity-75" />
            <span>Wind: {weather.wind} km/h</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-2.5 text-xs border border-white/10 mt-1">
          <span className="font-semibold">Concierge Note:</span> {weather.alerts}
        </div>
      </div>
    </div>
  )
}
