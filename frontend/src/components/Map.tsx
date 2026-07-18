import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Compass } from 'lucide-react'

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
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routePolylineRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null)

  // Dynamically load Leaflet CDN files
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(cssLink)

    const jsScript = document.createElement('script')
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    jsScript.onload = () => setLeafletLoaded(true)
    document.head.appendChild(jsScript)
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    let centerLat = 15.5562
    let centerLng = 73.7512

    if (pins.length > 0) {
      centerLat = pins[0].lat
      centerLng = pins[0].lng
    } else if (userCoords) {
      centerLat = userCoords.lat
      centerLng = userCoords.lng
    }

    const L = (window as any).L
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([centerLat, centerLng], 13)

    // Load official Google Maps standard road tiles
    L.tileLayer('https://mt1.googleusercontent.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map)

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

  // Update Markers, Route Tracing, and Google-style Midpoint Labels
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return

    const L = (window as any).L
    const map = mapInstanceRef.current

    // Clear old markers/popups
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    if (routePolylineRef.current) {
      routePolylineRef.current.remove()
      routePolylineRef.current = null
    }

    const bounds: any[] = []

    const createCustomIcon = (type: string, numberLabel?: number) => {
      let color = '#3b82f6' // Blue (Google Maps Primary)
      if (type === 'RESTAURANT') color = '#ef4444' // Red (Dining)
      if (type === 'EVENT') color = '#a855f7' // Purple (Leisure/Events)
      if (type === 'MALL' || type === 'CINEMA') color = '#eab308' // Gold (Shopping/Entertainment)
      if (type === 'USER') color = '#10b981' // Green (Live location)

      const html = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.15; transform: scale(1.4); animation: pulse 2s infinite;"></div>
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            ${numberLabel !== undefined ? `<span style="color: white; font-size: 11px; font-weight: 800;">${numberLabel}</span>` : ''}
          </div>
        </div>
      `
      return L.divIcon({
        html,
        className: 'google-maps-marker-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }

    // Add Live User Location
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
      
      marker.bindTooltip(`<b>${i + 1}. ${pin.name}</b><br><span style="text-transform: capitalize; font-size: 10px; color: #4b5563;">${pin.type.toLowerCase()}</span>`, { 
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

    // Draw Google-style route tracing and midpoint drive time bubbles
    if (drawRoute && pins.length > 0) {
      const pathCoords: any[] = []
      
      if (userCoords) {
        pathCoords.push([userCoords.lat, userCoords.lng])
      }
      
      pins.forEach(pin => {
        pathCoords.push([pin.lat, pin.lng])
      })

      // Return back to user starting coordinates (Round-trip Closed Loop)
      if (userCoords) {
        pathCoords.push([userCoords.lat, userCoords.lng])
      }

      if (pathCoords.length >= 2) {
        // Draw routing line
        const polyline = L.polyline(pathCoords, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round'
        }).addTo(map)
        
        routePolylineRef.current = polyline

        // Calculate and add Google Maps drive time bubbles at the midpoint of each segment
        for (let i = 0; i < pathCoords.length - 1; i++) {
          const p1 = pathCoords[i]
          const p2 = pathCoords[i + 1]
          
          const midLat = (p1[0] + p2[0]) / 2
          const midLng = (p1[1] + p2[1]) / 2
          
          const dLat = p2[0] - p1[0]
          const dLng = p2[1] - p1[1]
          const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111
          const durationMin = Math.round(distance * 2.5) // realistic traffic timing multiplier

          const labelIcon = L.divIcon({
            html: `<div style="background-color: white; border: 1.5px solid #3b82f6; border-radius: 8px; padding: 3px 7px; font-size: 9px; font-weight: 800; color: #1e3a8a; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 4px;">
                     <span>🚗</span>
                     <span>${durationMin} min</span>
                   </div>`,
            className: 'route-duration-bubble',
            iconSize: [50, 20],
            iconAnchor: [25, 10]
          })

          const labelMarker = L.marker([midLat, midLng], { icon: labelIcon }).addTo(map)
          markersRef.current.push(labelMarker)
        }
      }
    }

    // Auto-fit coordinates bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15
      })
    }

  }, [leafletLoaded, pins, userCoords, nearbyPlaces, drawRoute])

  return (
    <div className="relative w-full h-full min-h-[300px] bg-slate-100 dark:bg-zinc-950 border border-gray-250 dark:border-darkBorder rounded-2xl overflow-hidden flex flex-col shadow-inner">
      
      {/* Map Control Buttons */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/95 dark:bg-zinc-900/95 shadow-md px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-200 dark:border-darkBorder">
          <Compass size={14} className="text-blue-500 animate-spin" />
          <span className="text-gray-800 dark:text-gray-200">Google Maps Service</span>
        </div>
      </div>

      {/* Map target div */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[300px]" style={{ zIndex: 1 }} />

      {/* Selected Marker Drawer */}
      {selectedPin && (() => {
        let distStr = '2.4 km'
        let timeStr = '12 min'
        if (userCoords) {
          const dLat = selectedPin.lat - userCoords.lat
          const dLng = selectedPin.lng - userCoords.lng
          const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111
          distStr = `${distance.toFixed(1)} km`
          timeStr = `${Math.round(distance * 2.5)} min`
        }

        return (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 dark:bg-zinc-900/95 border border-gray-200/80 dark:border-darkBorder shadow-xl rounded-2xl p-4 animate-slide-up flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-2.5 rounded-xl text-blue-600">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{selectedPin.name}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">{selectedPin.type.toLowerCase()}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {timeStr} ({distStr})
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
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
              Directions
            </button>
          </div>
        )
      })()}
    </div>
  )
}
