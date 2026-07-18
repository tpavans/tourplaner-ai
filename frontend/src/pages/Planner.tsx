import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Timeline from '../components/Timeline'
import Map from '../components/Map'
import API from '../services/api'
import { Calendar, Plus, Compass, Navigation, ShoppingBag, Clapperboard, Utensils, AlertCircle } from 'lucide-react'

interface Trip {
  id: number
  title: string
  destination: string
  startDate: string
  endDate: string
  budgetLimit: number
  budgetSpent: number
}

interface ScheduleActivity {
  id: number
  dayNumber: number
  scheduledTime: string
  activityName: string
  activityType: string
  status: string
}

interface MapPinData {
  id: number
  name: string
  lat: number
  lng: number
  type: 'HOTEL' | 'RESTAURANT' | 'EVENT' | 'ATTRACTION' | 'MALL' | 'CINEMA' | 'HOSPITAL'
}

export default function Planner() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [schedules, setSchedules] = useState<ScheduleActivity[]>([])
  const [activeDay, setActiveDay] = useState(1)
  
  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState('')

  // Seeded coordinates for standard activities in Goa (matching database seeder)
  const activityCoordinates: Record<string, { lat: number; lng: number }> = {
    'Breakfast at The Sea View Resort': { lat: 15.5992, lng: 73.7431 },
    'Visit Fort Aguada Lighthouse': { lat: 15.5562, lng: 73.7512 },
    'Lunch at Fisherman\'s Wharf': { lat: 15.4909, lng: 73.8122 },
    'Spice Plantation Tasting Tour': { lat: 15.5540, lng: 73.7562 },
    'Coastal Sunset Cruise': { lat: 15.5560, lng: 73.7510 },
    'Dinner at Seaside Grill': { lat: 15.5562, lng: 73.7512 }
  }

  // Seeded nearby options to display based on location queries
  const nearbyPlaces: MapPinData[] = [
    { id: 101, name: 'Mall de Goa (Shopping & Food Court)', lat: 15.5255, lng: 73.8210, type: 'MALL' },
    { id: 102, name: 'Caculo Mall Panaji', lat: 15.4912, lng: 73.8120, type: 'MALL' },
    { id: 103, name: 'INOX Cinemas Panaji', lat: 15.4950, lng: 73.8115, type: 'CINEMA' },
    { id: 104, name: 'PVR Cinemas Mall de Goa', lat: 15.5250, lng: 73.8212, type: 'CINEMA' },
    { id: 105, name: 'Fisherman\'s Wharf Restaurant', lat: 15.4909, lng: 73.8122, type: 'RESTAURANT' },
    { id: 106, name: 'Seaside Grill & Cafe', lat: 15.5562, lng: 73.7512, type: 'RESTAURANT' }
  ]

  // Track browser live location
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      // Fallback coordinate near Vagator, Goa
      setUserCoords({ lat: 15.5892, lng: 73.7381 })
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setGeoError('')
      },
      (error) => {
        setGeoError('Location permission denied or unavailable. Using default Goa location.')
        // Fallback default coordinate near Vagator, Goa
        setUserCoords({ lat: 15.5892, lng: 73.7381 })
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  useEffect(() => {
    // Load trips
    API.get('/trips')
      .then((res) => {
        setTrips(res.data)
        if (res.data.length > 0) {
          setSelectedTrip(res.data[0])
        }
      })
      .catch(() => {
        const dummy = {
          id: 1,
          title: 'Summer Getaway in Goa',
          destination: 'Goa, India',
          startDate: '2026-07-20',
          endDate: '2026-07-24',
          budgetLimit: 500,
          budgetSpent: 120,
        }
        setTrips([dummy])
        setSelectedTrip(dummy)
      })
  }, [])

  const loadSchedules = () => {
    if (!selectedTrip) return
    API.get(`/trips/${selectedTrip.id}`)
      .then((res) => {
        setSchedules(res.data.schedules)
      })
      .catch(() => {
        setSchedules([
          { id: 1, dayNumber: 1, scheduledTime: '09:00 AM', activityName: 'Breakfast at The Sea View Resort', activityType: 'HOTEL', status: 'Confirmed' },
          { id: 2, dayNumber: 1, scheduledTime: '10:30 AM', activityName: 'Visit Fort Aguada Lighthouse', activityType: 'ATTRACTION', status: 'Confirmed' },
          { id: 3, dayNumber: 1, scheduledTime: '01:00 PM', activityName: 'Lunch at Fisherman\'s Wharf', activityType: 'RESTAURANT', status: 'Confirmed' },
          { id: 4, dayNumber: 1, scheduledTime: '03:30 PM', activityName: 'Spice Plantation Tasting Tour', activityType: 'ATTRACTION', status: 'Confirmed' },
          { id: 5, dayNumber: 1, scheduledTime: '06:30 PM', activityName: 'Coastal Sunset Cruise', activityType: 'EVENT', status: 'Confirmed' },
          { id: 6, dayNumber: 1, scheduledTime: '08:30 PM', activityName: 'Dinner at Seaside Grill', activityType: 'RESTAURANT', status: 'Confirmed' }
        ] as any)
      })
  }

  useEffect(() => {
    loadSchedules()
  }, [selectedTrip])

  // Filter activities by active day selection
  const dayActivities = schedules.filter((s) => s.dayNumber === activeDay)

  // Convert timeline activities to Map pins
  const getMapPins = (): MapPinData[] => {
    return dayActivities.map((act) => {
      const coords = activityCoordinates[act.activityName] || { lat: 15.55, lng: 73.75 }
      return {
        id: act.id,
        name: act.activityName,
        lat: coords.lat,
        lng: coords.lng,
        type: act.activityType as any
      }
    })
  }

  // Calculate distances & driving times dynamically between path stops
  const calculateRouteLegs = () => {
    const legs: { from: string; to: string; distance: string; duration: string }[] = []
    const pins = getMapPins()

    let prevPoint: { name: string; lat: number; lng: number } | null = null

    if (userCoords) {
      prevPoint = { name: 'Your Live Location', lat: userCoords.lat, lng: userCoords.lng }
    }

    pins.forEach((pin) => {
      if (prevPoint) {
        // Calculate rough Euclidean distance (lat/lng degrees to km conversion ~111km)
        const dLat = pin.lat - prevPoint.lat
        const dLng = pin.lng - prevPoint.lng
        const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111
        const durationMin = Math.round(distance * 2) // assuming ~30km/h average city drive speed (2 min per km)
        
        legs.push({
          from: prevPoint.name,
          to: pin.name,
          distance: `${distance.toFixed(1)} km`,
          duration: `${durationMin} min drive`
        })
      }
      prevPoint = { name: pin.name, lat: pin.lat, lng: pin.lng }
    })

    return legs
  }

  // Add custom nearby place (Mall, Cinema, Restaurant) straight to database timeline
  const addPlaceToItinerary = (place: MapPinData) => {
    if (!selectedTrip) return
    
    // Auto calculate next time slots (e.g. 05:00 PM)
    const nextSlot = schedules.length > 0 ? '05:00 PM' : '10:00 AM'
    
    API.post(`/trips/${selectedTrip.id}/schedules`, {
      dayNumber: activeDay,
      scheduledTime: nextSlot,
      activityName: place.name,
      activityType: place.type,
      activityId: place.id,
      status: 'PLANNED'
    })
      .then(() => {
        // Reload list
        loadSchedules()
      })
      .catch(() => {
        // Fallback local update
        setSchedules((prev) => [...prev, {
          id: place.id,
          dayNumber: activeDay,
          scheduledTime: nextSlot,
          activityName: place.name,
          activityType: place.type,
          status: 'Confirmed'
        }])
      })
  }

  const legs = calculateRouteLegs()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Real-Time Travel Planner</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track live position and calculate travel times between itinerary legs</p>
        </div>

        <div className="flex gap-2">
          {trips.length > 0 && (
            <select
              value={selectedTrip?.id}
              onChange={(e) => {
                const trip = trips.find((t) => t.id === Number(e.target.value))
                if (trip) setSelectedTrip(trip)
              }}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Geolocation warning display if denied */}
      {geoError && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{geoError}</span>
        </div>
      )}

      {/* Day Selector */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-darkBorder pb-px">
        {[1, 2, 3, 4].map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeDay === day
                ? 'border-indigo-600 text-indigo-600 dark:border-brand-400 dark:text-brand-300'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Day {day}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Column (Timeline + Distances) & Right Column (Map + Nearby suggestion list) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Timeline list (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-sm">Hourly Itinerary</h3>
          </div>

          {dayActivities.length > 0 ? (
            <Timeline activities={dayActivities as any} />
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-8 text-center text-xs text-gray-400">
              No schedules mapped for Day {activeDay}. Use suggestion buttons to add activities!
            </div>
          )}

          {/* Drive & Distance calculations timeline legs */}
          {legs.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation size={14} className="text-indigo-600 dark:text-brand-400" />
                Travel time & Directions summary
              </h4>
              <div className="space-y-3 pt-1">
                {legs.map((leg, index) => (
                  <div key={index} className="flex justify-between items-start text-xs border-l-2 border-indigo-100 dark:border-brand-950 pl-3 ml-1">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200 text-[11px]">{leg.from}</p>
                      <p className="text-[10px] text-gray-400">to {leg.to}</p>
                    </div>
                    <div className="text-right text-[11px] font-bold text-indigo-600 dark:text-brand-400">
                      <span>{leg.distance}</span>
                      <span className="block text-[9px] text-gray-400 font-normal">{leg.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Map + Nearby suggestion controls (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-sm">Interactive Live Map</h3>
          </div>
          
          <Map 
            drawRoute={dayActivities.length > 0} 
            userCoords={userCoords}
            pins={getMapPins()}
            nearbyPlaces={nearbyPlaces}
          />

          {/* Nearby Suggestions Selector List */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-sm">Nearby Discovery</h4>
              <p className="text-xs text-gray-400 mt-0.5">Discovered matching spots near your active coordinates</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyPlaces.map((place) => (
                <div 
                  key={place.id} 
                  className="border border-gray-150 dark:border-zinc-800 rounded-xl p-3 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50 hover:border-indigo-400 transition-colors"
                >
                  <div className="flex gap-2.5 items-center">
                    <div className={`p-2 rounded-lg ${
                      place.type === 'MALL' ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-500' :
                      place.type === 'CINEMA' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' :
                      'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
                    }`}>
                      {place.type === 'MALL' ? <ShoppingBag size={16} /> :
                       place.type === 'CINEMA' ? <Clapperboard size={16} /> :
                       <Utensils size={16} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs max-w-[150px] truncate">{place.name}</h5>
                      <span className="text-[9px] uppercase font-bold text-gray-400">{place.type.toLowerCase()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => addPlaceToItinerary(place)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  )
}
