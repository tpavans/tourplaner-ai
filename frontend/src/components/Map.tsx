import React, { useState } from 'react'
import { MapPin, Navigation, Compass, Layers, User } from 'lucide-react'

interface MapPinData {
  id: number
  name: string
  lat: number
  lng: number
  type: 'HOTEL' | 'RESTAURANT' | 'EVENT' | 'ATTRACTION' | 'MALL' | 'CINEMA'
}

interface MapProps {
  pins?: MapPinData[]
  drawRoute?: boolean
  userCoords?: { lat: number; lng: number } | null
  nearbyPlaces?: MapPinData[]
  onSelectPlace?: (place: MapPinData) => void
}

export default function Map({ 
  pins = [], 
  drawRoute = false, 
  userCoords = null, 
  nearbyPlaces = [], 
  onSelectPlace 
}: MapProps) {
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null)
  const [showNearby, setShowNearby] = useState(true)

  // Default coordinate bounding box for Goa
  const minLat = 15.45
  const maxLat = 15.65
  const minLng = 73.70
  const maxLng = 73.85

  // Map latitude/longitude to SVG coordinate space (500x500)
  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 500
    const y = 500 - ((lat - minLat) / (maxLat - minLat)) * 500
    return { x, y }
  }

  // Pin colors based on category
  const getPinColor = (type: string) => {
    switch (type) {
      case 'HOTEL': return 'text-indigo-600 dark:text-brand-400 fill-indigo-600 dark:fill-brand-400'
      case 'RESTAURANT': return 'text-amber-500 fill-amber-500'
      case 'EVENT': return 'text-purple-500 fill-purple-500'
      case 'MALL': return 'text-sky-500 fill-sky-500'
      case 'CINEMA': return 'text-rose-500 fill-rose-500'
      default: return 'text-teal-500 fill-teal-500'
    }
  }

  // Draw full route starting from user live location to activities
  const getRoutePath = () => {
    const pathPoints: { x: number; y: number }[] = []
    
    if (userCoords) {
      pathPoints.push(getCoordinates(userCoords.lat, userCoords.lng))
    }

    pins.forEach(pin => {
      pathPoints.push(getCoordinates(pin.lat, pin.lng))
    })

    if (pathPoints.length < 2) return ''
    return pathPoints.map((pt, index) => `${index === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')
  }

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-100 dark:bg-zinc-950 border border-gray-250 dark:border-darkBorder rounded-2xl overflow-hidden flex flex-col shadow-inner">
      
      {/* Map Control Buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white/95 dark:bg-zinc-900/95 shadow-md px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-200 dark:border-darkBorder">
          <Compass size={14} className="animate-spin text-indigo-600 dark:text-brand-400" />
          <span>Goa Live Radar Map</span>
        </div>
        
        {userCoords && (
          <div className="bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            Live Location Active
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={() => setShowNearby(!showNearby)}
          className={`shadow-md p-2.5 rounded-lg border border-gray-250 dark:border-darkBorder transition-colors ${
            showNearby 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-white/95 dark:bg-zinc-900/95 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
          title="Toggle Nearby suggestions (Malls, Movies, Dining)"
        >
          <Layers size={14} />
        </button>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="flex-1 w-full relative flex items-center justify-center p-4">
        <svg viewBox="0 0 500 500" className="w-full h-full max-h-[500px]">
          {/* Simulated land roads */}
          <path d="M 50,50 L 450,450" stroke="rgba(99,102,241,0.08)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 50,450 L 450,50" stroke="rgba(99,102,241,0.08)" strokeWidth="4" strokeLinecap="round" />
          <path d="M 250,50 L 250,450" stroke="rgba(99,102,241,0.08)" strokeWidth="5" strokeLinecap="round" />
          <path d="M 50,250 L 450,250" stroke="rgba(99,102,241,0.08)" strokeWidth="5" strokeLinecap="round" />

          {/* Route path */}
          {drawRoute && (
            <path
              d={getRoutePath()}
              fill="none"
              stroke="#6366f1"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8,4"
              className="animate-pulse-subtle"
            />
          )}

          {/* Render User Current Location Dot */}
          {userCoords && (() => {
            const { x, y } = getCoordinates(userCoords.lat, userCoords.lng)
            return (
              <g className="cursor-pointer">
                {/* Glowing pulse ring */}
                <circle cx={x} cy={y} r="16" className="fill-indigo-500/20 stroke-indigo-500/40 animate-ping" />
                <circle cx={x} cy={y} r="10" className="fill-indigo-600 dark:fill-brand-400 stroke-white dark:stroke-darkBg" strokeWidth="2.5" />
                <circle cx={x} cy={y} r="4" className="fill-white" />
              </g>
            )
          })()}

          {/* Render Schedule Pins */}
          {pins.map((pin, i) => {
            const { x, y } = getCoordinates(pin.lat, pin.lng)
            return (
              <g 
                key={`pin-${pin.id}-${i}`}
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedPin(pin)
                  if (onSelectPlace) onSelectPlace(pin)
                }}
              >
                <circle cx={x} cy={y} r="14" className={`fill-current opacity-15 group-hover:scale-125 transition-transform ${getPinColor(pin.type)}`} />
                <circle cx={x} cy={y} r="5" className={`fill-current ${getPinColor(pin.type)}`} />
                
                {/* Marker Index Label */}
                <text x={x} y={y - 12} className="fill-indigo-600 dark:fill-brand-400 font-sans font-black text-[9px] text-center" textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            )
          })}

          {/* Render Nearby Places Pins (Malls, Movies, Restaurants) */}
          {showNearby && nearbyPlaces.map((place) => {
            const { x, y } = getCoordinates(place.lat, place.lng)
            return (
              <g
                key={`nearby-${place.id}-${place.type}`}
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedPin(place)
                  if (onSelectPlace) onSelectPlace(place)
                }}
              >
                <circle cx={x} cy={y} r="10" className={`fill-current opacity-10 group-hover:scale-125 transition-transform ${getPinColor(place.type)}`} />
                <circle cx={x} cy={y} r="3" className={`fill-current ${getPinColor(place.type)}`} />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected Pin Details Drawer */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 dark:bg-zinc-900/95 border border-gray-200/80 dark:border-darkBorder shadow-xl rounded-xl p-4 animate-slide-up">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-start">
              <div className="bg-indigo-50 dark:bg-brand-950 p-2.5 rounded-xl text-indigo-600 dark:text-brand-300">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm">{selectedPin.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {selectedPin.type.toLowerCase()} • Coordinate GPS: {selectedPin.lat.toFixed(4)}, {selectedPin.lng.toFixed(4)}
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
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
              <Navigation size={12} />
              Go to Location (Directions Active)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
