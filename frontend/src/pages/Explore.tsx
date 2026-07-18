import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Compass, Search, Star, MapPin, Tag } from 'lucide-react'
import API from '../services/api'

interface Hotel {
  id: number
  name: string
  address: string
  rating: number
  imageUrls: string[]
}

interface Restaurant {
  id: number
  name: string
  cuisineType: string
  averagePrice: number
  rating: number
  imageUrl: string
}

interface Event {
  id: number
  name: string
  category: string
  dateTime: string
  price: number
  imageUrl: string
}

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'HOTELS' | 'RESTAURANTS' | 'EVENTS'>('ALL')
  const [cityQuery, setCityQuery] = useState('Goa')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)

  const fetchExploreData = () => {
    setLoading(true)
    API.get(`/explore?city=${cityQuery}`)
      .then((res) => {
        setHotels(res.data.hotels || [])
        setRestaurants(res.data.restaurants || [])
        setEvents(res.data.events || [])
      })
      .catch(() => {
        // Fallbacks
        setHotels([])
        setRestaurants([])
        setEvents([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchExploreData()
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchExploreData()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Explore places</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Discover hot spots, dining spots, and cultural events</p>
      </div>

      {/* Search Input bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl w-full">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search city (e.g. Goa)"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 rounded-xl shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Category Selection Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1.5">
        {(['ALL', 'HOTELS', 'RESTAURANTS', 'EVENTS'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl h-64 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Hotels Results */}
          {(activeCategory === 'ALL' || activeCategory === 'HOTELS') && hotels.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <Compass size={18} className="text-indigo-600 dark:text-brand-400" />
                Attractions & Hotels
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((h) => (
                  <div key={h.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-44 overflow-hidden relative">
                      <img src={h.imageUrls[0]} alt={h.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-0.5">
                        <Star size={10} className="fill-amber-400 stroke-amber-400" />
                        {h.rating}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <h4 className="font-bold text-sm">{h.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin size={12} />
                        {h.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restaurants Results */}
          {(activeCategory === 'ALL' || activeCategory === 'RESTAURANTS') && restaurants.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <Tag size={18} className="text-amber-500" />
                Seaside Dining & Cafes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((r) => (
                  <div key={r.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-44 overflow-hidden relative">
                      <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-0.5">
                        <Star size={10} className="fill-amber-400 stroke-amber-400" />
                        {r.rating}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm">{r.name}</h4>
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{r.cuisineType}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Average cost: ${r.averagePrice} per plate</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Results */}
          {(activeCategory === 'ALL' || activeCategory === 'EVENTS') && events.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <Compass size={18} className="text-purple-500" />
                Local Activities & Festivals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((e) => (
                  <div key={e.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-44 overflow-hidden relative">
                      <img src={e.imageUrl} alt={e.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                        {e.category}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <h4 className="font-bold text-sm">{e.name}</h4>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Date: {new Date(e.dateTime).toLocaleDateString()}</span>
                        <span className="font-bold text-indigo-600 dark:text-brand-400">${e.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </motion.div>
  )
}
