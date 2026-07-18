import React from 'react'
import { motion } from 'framer-motion'
import WeatherWidget from '../components/WeatherWidget'
import { useAuth } from '../hooks/useAuth'
import { Compass, Calendar, ArrowRight, Star, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()

  const highlights = [
    { name: 'Baga Beach', time: '10:00 AM', rating: 4.8, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Spice Garden Walk', time: '02:00 PM', rating: 4.6, img: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sunset Cruise', time: '06:30 PM', rating: 4.9, img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80' },
  ]

  const upcomingBookings = [
    { title: 'Seaside Grill Restaurant', time: 'Today, 07:30 PM', status: 'Confirmed' },
    { title: 'Sunset Cruise', time: 'Today, 06:30 PM', status: 'Confirmed' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Welcome Banner */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Hello, {user?.fullName || 'Guest'} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <MapPin size={16} className="text-indigo-600 dark:text-brand-400" />
          Enjoy your stay in <span className="font-semibold text-gray-800 dark:text-white">Goa, India</span>
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weather Column */}
        <div className="lg:col-span-1">
          <WeatherWidget city="Goa" />
        </div>

        {/* AI Quick Prompt CTA */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex flex-col gap-2 relative z-10">
            <span className="text-xs font-bold text-indigo-600 dark:text-brand-400 uppercase tracking-widest">AI Agent Ready</span>
            <h3 className="text-xl font-bold">Ask AI Concierge for recommendations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              "Suggest a relaxing afternoon itinerary with seaside seafood dining and beach sunset slots."
            </p>
          </div>
          <div className="mt-6 flex justify-end z-10">
            <Link 
              to="/chat" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              Start Chat
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* Highlights Section */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold tracking-tight">Today's Highlights</h3>
          <Link to="/explore" className="text-xs font-semibold text-indigo-600 dark:text-brand-400 hover:underline flex items-center gap-0.5">
            View All Explore
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map((item) => (
            <div key={item.name} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="h-40 overflow-hidden relative">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 stroke-amber-400" />
                  {item.rating}
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1.5">
                <h4 className="font-bold text-sm">{item.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.time} • Local Spotlight</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings Overview Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold tracking-tight">Upcoming Bookings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingBookings.map((booking) => (
            <div key={booking.title} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-4 flex justify-between items-center shadow-sm">
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold text-sm">{booking.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {booking.time}
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300">
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  )
}
