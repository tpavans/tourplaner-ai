import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Compass, Layers } from 'lucide-react'

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

declare global {
  interface Window {
    L: any
  }
}

export default function Map({
  pins = [],
  drawRoute = false,
  userCoords = null,
  nearbyPlaces = [],
  onSelectPlace
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routePolylineRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null)

  // Dynamically load Leaflet CDN files
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true)
      return
    }

    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    cssLink.integrity = 'sha255-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    cssLink.crossOrigin = ''
    document.head.appendChild(cssLink)

    const jsScript = document.createElement('script')
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    jsScript.integrity = 'sha255-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    jsScript.crossOrigin = ''
    jsScript.onload = () => setLeafletLoaded(true)
    document.head.appendChild(jsScript)

    return () => {
      // Clean up scripts if needed
    }
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return

    // Clean up previous map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Default center (Goa)
    let centerLat = 15.5562
    let centerLng = 73.7512

    if (pins.length > 0) {
      centerLat = pins[0].lat
      centerLng = pins[0].lng
    } else if (userCoords) {
      centerLat = userCoords.lat
      centerLng = userCoords.lng
    }

    // Instantiate Leaflet Map
    const L = window.L
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([centerLat, centerLng], 13)

    // Load Voyager clean street map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map)

    // Add Zoom controls to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded])

  // Update Markers and Routes
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return

    const L = window.L
    const map = mapInstanceRef.current

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    if (routePolylineRef.current) {
      routePolylineRef.current.remove()
      routePolylineRef.current = null
    }

    const bounds: any[] = []

    // Define custom icon generators
    const createCustomIcon = (type: string, numberLabel?: number) => {
      let color = '#4f46e5' // default indigo
      if (type === 'RESTAURANT') color = '#f59e0b' // amber
      if (type === 'EVENT') color = '#8b5cf6' // purple
      if (type === 'MALL') color = '#0ea5e9' // sky
      if (type === 'CINEMA') color = '#f43f5e' // rose
      if (type === 'USER') color = '#22c55e' // green (glowing)

      const html = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.2; transform: scale(1.4); animation: pulse 2s infinite;"></div>
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: ${color}; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
            ${numberLabel !== undefined ? `<span style="color: white; font-size: 10px; font-weight: 900;">${numberLabel}</span>` : ''}
          </div>
        </div>
      `
      return L.divIcon({
        html,
        className: 'custom-leaflet-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }

    // Plot User Location Marker
    if (userCoords) {
      const userMarker = L.marker([userCoords.lat, userCoords.lng], {
        icon: createCustomIcon('USER')
      }).addTo(map)
      userMarker.bindTooltip('Your Live Location', { permanent: false, direction: 'top' })
      markersRef.current.push(userMarker)
      bounds.push([userCoords.lat, userCoords.lng])
    }

    // Plot Schedule Pins
    pins.forEach((pin, i) => {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: createCustomIcon(pin.type, i + 1)
      }).addTo(map)
      
      marker.bindTooltip(`<b>${i + 1}. ${pin.name}</b><br><span style="text-transform: capitalize; font-size: 10px;">${pin.type.toLowerCase()}</span>`, { 
        permanent: false, 
        direction: 'top' 
      })

      marker.on('click', () => {
        setSelectedPin(pin)
        if (onSelectPlace) onSelectPlace(pin)
      })

      markersRef.current.push(marker)
      bounds.push([pin.lat, pin.lng])
    })

    // Plot Nearby discovery places
    nearbyPlaces.forEach(place => {
      const marker = L.marker([place.lat, place.lng], {
        icon: createCustomIcon(place.type)
      }).addTo(map)

      marker.bindTooltip(`<b>${place.name}</b><br><span style="text-transform: capitalize; font-size: 10px; color: #4f46e5;">Suggested ${place.type.toLowerCase()}</span>`, {
        permanent: false,
        direction: 'top'
      })

      marker.on('click', () => {
        setSelectedPin(place)
        if (onSelectPlace) onSelectPlace(place)
      })

      markersRef.current.push(marker)
      bounds.push([place.lat, place.lng])
    })

    // Draw routing Polyline
    if (drawRoute && pins.length > 0) {
      const pathCoords: any[] = []
      
      if (userCoords) {
        pathCoords.push([userCoords.lat, userCoords.lng])
      }
      
      pins.forEach(pin => {
        pathCoords.push([pin.lat, pin.lng])
      })

      if (pathCoords.length >= 2) {
        const polyline = L.polyline(pathCoords, {
          color: '#4f46e5',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 6',
          lineJoin: 'round'
        }).addTo(map)
        
        routePolylineRef.current = polyline
      }
    }

    // Auto-fit bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      })
    }

  }, [leafletLoaded, pins, userCoords, nearbyPlaces, drawRoute])

  return (
    <div className="relative w-full h-full min-h-[300px] bg-slate-100 dark:bg-zinc-950 border border-gray-250 dark:border-darkBorder rounded-2xl overflow-hidden flex flex-col shadow-inner">
      
      {/* Map Control Buttons */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/95 dark:bg-zinc-900/95 shadow-md px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-200 dark:border-darkBorder">
          <Compass size={14} className="animate-spin text-indigo-600 dark:text-brand-400" />
          <span>Real-Time Live Map</span>
        </div>
      </div>

      {/* Map Target Canvas */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[300px]" style={{ zIndex: 1 }} />

      {/* Selected Marker Details Drawer */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 dark:bg-zinc-900/95 border border-gray-200/80 dark:border-darkBorder shadow-xl rounded-xl p-4 animate-slide-up">
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-start">
              <div className="bg-indigo-50 dark:bg-brand-950 p-2.5 rounded-xl text-indigo-600 dark:text-brand-300">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm">{selectedPin.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {selectedPin.type.toLowerCase()} • GPS: {selectedPin.lat.toFixed(4)}, {selectedPin.lng.toFixed(4)}
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
        </div>
      )}
    </div>
  )
}
