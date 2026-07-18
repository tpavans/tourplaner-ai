import React from 'react'
import { MapPin, Utensils, Sparkles, BedDouble, Calendar, ArrowRight } from 'lucide-react'

interface Activity {
  id?: number
  time: string
  name: string
  type: string // 'HOTEL' | 'RESTAURANT' | 'EVENT' | 'ATTRACTION' | 'LEISURE'
  status?: string
}

interface TimelineProps {
  activities?: Activity[]
}

export default function Timeline({ activities = [] }: TimelineProps) {

  const getActivityIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'HOTEL': return <BedDouble size={16} />
      case 'RESTAURANT': return <Utensils size={16} />
      case 'EVENT': return <Sparkles size={16} />
      case 'ATTRACTION': return <MapPin size={16} />
      default: return <Calendar size={16} />
    }
  }

  const getThemeColors = (type: string) => {
    switch (type.toUpperCase()) {
      case 'HOTEL': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
      case 'RESTAURANT': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      case 'EVENT': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      case 'ATTRACTION': return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      default: return 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
    }
  }

  const defaultActivities: Activity[] = [
    { time: '09:00 AM', name: 'Breakfast at The Sea View Resort', type: 'HOTEL', status: 'Confirmed' },
    { time: '10:30 AM', name: 'Explore Fort Aguada Lighthouse', type: 'ATTRACTION', status: 'Confirmed' },
    { time: '01:00 PM', name: 'Seafood Lunch at Fisherman\'s Wharf', type: 'RESTAURANT', status: 'Confirmed' },
    { time: '03:30 PM', name: 'Spice Garden Walk & Tasting Tour', type: 'ATTRACTION', status: 'Confirmed' },
    { time: '06:30 PM', name: 'Coastal Sunset Cruise Party', type: 'EVENT', status: 'Confirmed' },
    { time: '08:30 PM', name: 'Candlelight Dinner at Seaside Grill', type: 'RESTAURANT', status: 'Confirmed' }
  ]

  const items = activities.length > 0 ? activities : defaultActivities

  return (
    <div className="relative border-l border-gray-200 dark:border-darkBorder ml-4 pl-6 space-y-8 py-2">
      {items.map((activity, index) => (
        <div key={index} className="relative group">
          {/* Bullet Pin */}
          <div className={`absolute left-[-35px] top-1.5 p-2 rounded-full border border-white dark:border-darkBg shadow-md flex items-center justify-center transition-transform group-hover:scale-110 ${getThemeColors(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>

          {/* Time & Title Container */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-darkBorder p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-brand-400 tracking-wider">
                {activity.time}
              </span>
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                {activity.name}
              </h4>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-65">
                {activity.type.toLowerCase()}
              </span>
            </div>

            <div className="flex gap-2 self-end sm:self-center">
              {activity.status && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                  {activity.status}
                </span>
              )}
              <button className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
