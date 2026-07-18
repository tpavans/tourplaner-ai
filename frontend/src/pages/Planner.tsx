import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Timeline from '../components/Timeline'
import Map from '../components/Map'
import API from '../services/api'
import { Calendar, Plus, Compass } from 'lucide-react'

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
  scheduledTime: string // time string like '09:00:00'
  activityName: string
  activityType: string
  status: string
}

export default function Planner() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [schedules, setSchedules] = useState<ScheduleActivity[]>([])
  const [activeDay, setActiveDay] = useState(1)

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
        // Fallback dummy trip if database is empty/unconnected
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

  useEffect(() => {
    if (!selectedTrip) return
    API.get(`/trips/${selectedTrip.id}`)
      .then((res) => {
        setSchedules(res.data.schedules)
      })
      .catch(() => {
        // Fallback schedules
        setSchedules([
          { id: 1, dayNumber: 1, scheduledTime: '09:00 AM', activityName: 'Breakfast at The Sea View Resort', activityType: 'HOTEL', status: 'Confirmed' },
          { id: 2, dayNumber: 1, scheduledTime: '10:30 AM', activityName: 'Visit Fort Aguada Lighthouse', activityType: 'ATTRACTION', status: 'Confirmed' },
          { id: 3, dayNumber: 1, scheduledTime: '01:00 PM', activityName: 'Lunch at Fisherman\'s Wharf', activityType: 'RESTAURANT', status: 'Confirmed' },
          { id: 4, dayNumber: 1, scheduledTime: '03:30 PM', activityName: 'Spice Plantation Tasting Tour', activityType: 'ATTRACTION', status: 'Confirmed' },
          { id: 5, dayNumber: 1, scheduledTime: '06:30 PM', activityName: 'Coastal Sunset Cruise', activityType: 'EVENT', status: 'Confirmed' },
          { id: 6, dayNumber: 1, scheduledTime: '08:30 PM', activityName: 'Dinner at Seaside Grill', activityType: 'RESTAURANT', status: 'Confirmed' }
        ] as any)
      })
  }, [selectedTrip])

  // Filter activities by active day selection
  const dayActivities = schedules.filter((s) => s.dayNumber === activeDay)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      
      {/* Title & Selector Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Travel Planner</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Map route and hourly timeline itinerary</p>
        </div>

        <div className="flex gap-2">
          {trips.length > 0 && (
            <select
              value={selectedTrip?.id}
              onChange={(e) => {
                const trip = trips.find((t) => t.id === Number(e.target.value))
                if (trip) setSelectedTrip(trip)
              }}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm">
            <Plus size={14} />
            Create Trip
          </button>
        </div>
      </div>

      {/* Main Trip Specs Banner */}
      {selectedTrip && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-brand-950/50 p-4 rounded-2xl text-indigo-600 dark:text-brand-300">
              <Calendar size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{selectedTrip.title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Destination: {selectedTrip.destination} • {selectedTrip.startDate} to {selectedTrip.endDate}
              </p>
            </div>
          </div>

          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-gray-100 dark:border-darkBorder pt-4 md:pt-0 md:pl-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Budget Limit</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">${selectedTrip.budgetLimit}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Spent Budget</span>
              <span className="text-sm font-bold text-red-500">${selectedTrip.budgetSpent}</span>
            </div>
          </div>
        </div>
      )}

      {/* Day Selection Tabs */}
      <div className="flex gap-2 border-b border-gray-250 dark:border-darkBorder pb-px">
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

      {/* Grid Layout: Timeline List (Left) vs Map Visualizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Timeline Column */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-sm">Schedule Timeline</h3>
            <button className="text-xs text-indigo-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1">
              Edit Timeline
            </button>
          </div>

          {dayActivities.length > 0 ? (
            <Timeline activities={dayActivities as any} />
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-8 text-center text-xs text-gray-400">
              No schedules mapped for Day {activeDay}. Ask the AI Concierge to recommend and add activities!
            </div>
          )}
        </div>

        {/* Map Visualizer Column */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-sm">Itinerary Map</h3>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Compass size={12} className="text-indigo-600 dark:text-brand-400" />
              Route paths display active
            </span>
          </div>
          
          <Map drawRoute={dayActivities.length > 1} />
        </div>

      </div>

    </motion.div>
  )
}
