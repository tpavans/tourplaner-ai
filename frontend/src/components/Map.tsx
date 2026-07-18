import React, { useState } from 'react'
import { MapPin, Navigation, Compass, Layers } from 'lucide-react'

interface MapPinData {
  id: number
  name: string
  lat: number
  lng: number
  type: 'HOTEL' | 'RESTAURANT' | 'EVENT' | 'ATTRACTION'
}

interface MapProps {
  pins?: MapPinData[]
  drawRoute?: boolean
}

export default function Map({ pins = [], drawRoute = false }: MapProps) {
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null)

  // Default coordinate bounding box for Goa
  const minLat = 15.45
  const maxLat = 15.65
  const minLng = 73.70
  const maxLng = 73.85

  // Map latitude/longitude to SVG coordinate space (500x500)
  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 500
    // SVG y=0 is at the top, so we invert latitude
    const y = 500 - ((lat - minLat) / (maxLat - minLat)) * 500
    return { x, y }
  }

  // Set default pins if none provided
  const activePins = pins.length > 0 ? pins : [
    { id: 1, name: 'The Sea View Resort', lat: 15.5992, lng: 73.7431, type: 'HOTEL' },
    { id: 2, name: 'Seaside Grill Restaurant', lat: 15.5562, lng: 73.7512, type: 'RESTAURANT' },
    { id: 3, name: 'Heritage Boutique Villa', lat: 15.4989, lng: 73.8278, type: 'HOTEL' },
    { id: 4, name: 'Goa Food Festival Ground', lat: 15.5540, lng: 73.7562, type: 'EVENT' }
  ] as MapPinData[]

  // Generate SVG path for route lines
  const getRoutePath = () => {
    if (activePins.length < 2) return ''
    return activePins.map((pin, index) => {
      const { x, y } = getCoordinates(pin.lat, pin.lng)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  const getPinColor = (type: string) => {
    switch (type) {
      case 'HOTEL': return 'text-indigo-600 dark:text-brand-400'
      case 'RESTAURANT': return 'text-amber-500'
      case 'EVENT': return 'text-purple-500'
      default: return 'text-rose-500'
    }
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-100 dark:bg-zinc-950 border border-gray-200 dark:border-darkBorder rounded-2xl overflow-hidden flex flex-col">
      {/* Map Actions Header */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-white/95 dark:bg-zinc-900/95 shadow-md px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-200 dark:border-darkBorder">
          <Compass size={14} className="animate-spin" />
          <span>Interactive Map (Goa)</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button className="bg-white/95 dark:bg-zinc-900/95 shadow-md p-2 rounded-lg border border-gray-200 dark:border-darkBorder hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200">
          <Layers size={14} />
        </button>
      </div>

      {/* SVG Map Canvas */}
      <div className="flex-1 w-full relative flex items-center justify-center p-4">
        <svg viewBox="0 0 500 500" className="w-full h-full max-h-[500px]">
          {/* Simulated Land/Roads Grid */}
          <path d="M 50,50 L 450,450 M 50,450 L 450,50 M 250,50 L 250,450" stroke="rgba(100,116,139,0.08)" strokeWidth="4" />
          <path d="M 100,250 C 150,150 350,150 400,250" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="2" strokeDasharray="5,5" />

          {/* Route path line */}
          {drawRoute && (
            <path
              d={getRoutePath()}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse-subtle"
            />
          )}

          {/* Map Pins */}
          {activePins.map((pin) => {
            const { x, y } = getCoordinates(pin.lat, pin.lng)
            return (
              <g 
                key={pin.id} 
                className="cursor-pointer group"
                onClick={() => setSelectedPin(pin)}
              >
                {/* Ping animation effect */}
                <circle cx={x} cy={y} r="12" className={`fill-current opacity-20 scale-100 group-hover:scale-125 transition-transform ${getPinColor(pin.type)}`} />
                <circle cx={x} cy={y} r="4" className={`fill-current ${getPinColor(pin.type)}`} />

                {/* Hover label */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <rect x={x - 60} y={y - 35} width="120" height="24" rx="4" className="fill-zinc-900 stroke-zinc-700" strokeWidth="1" />
                  <text x={x} y={y - 20} className="fill-white font-sans font-semibold text-[9px] text-center" textAnchor="middle">{pin.name}</text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Floating Info Drawer */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 dark:bg-zinc-900/95 border border-gray-200 dark:border-darkBorder shadow-lg rounded-xl p-4 animate-slide-up">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-start">
              <div className="bg-indigo-50 dark:bg-brand-950 p-2 rounded-lg text-indigo-600 dark:text-brand-300">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">{selectedPin.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {selectedPin.type.toLowerCase()} • Lat: {selectedPin.lat.toFixed(4)}, Lng: {selectedPin.lng.toFixed(4)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedPin(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-semibold px-2 py-1"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm">
              <Navigation size={12} />
              Get Directions (18 km)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
