import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, ShieldAlert, Sparkles, Utensils, BedDouble, AlertCircle } from 'lucide-react'
import API from '../services/api'

interface HotelBooking {
  id: number
  room: {
    roomType: string
    hotel: {
      name: string
    }
  }
  checkIn: string
  checkOut: string
  status: string
  totalAmount: number
}

interface RestaurantReservation {
  id: number
  restaurant: {
    name: string
    cuisineType: string
  }
  reservationTime: string
  partySize: number
  status: string
}

interface EventTicket {
  id: number
  event: {
    name: string
    dateTime: string
    price: number
  }
  quantity: number
  status: string
}

export default function Bookings() {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING')
  
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([])
  const [reservations, setReservations] = useState<RestaurantReservation[]>([])
  const [tickets, setTickets] = useState<EventTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadAllBookings = () => {
    setLoading(true)
    Promise.all([
      API.get('/bookings/hotel'),
      API.get('/bookings/restaurant'),
      API.get('/bookings/event')
    ])
      .then(([hotelRes, restRes, eventRes]) => {
        setHotelBookings(hotelRes.data)
        setReservations(restRes.data)
        setTickets(eventRes.data)
      })
      .catch(() => {
        // Fallbacks
        setHotelBookings([])
        setReservations([])
        setTickets([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadAllBookings()
  }, [])

  const handleCancelBooking = (id: number, type: 'hotel' | 'restaurant' | 'event') => {
    setMessage('')
    API.delete(`/bookings/${type}/${id}`)
      .then(() => {
        setMessage('Cancellation processed successfully.')
        loadAllBookings()
      })
      .catch(() => {
        setMessage('Failed to process cancellation.')
      })
  }

  const filterBookings = (list: any[]) => {
    return list.filter((item) => {
      const isCancelled = item.status === 'CANCELLED'
      if (activeTab === 'CANCELLED') return isCancelled
      // Simple toggle logic: treat as PAST if date is in past (simulated), else UPCOMING
      if (activeTab === 'UPCOMING') return !isCancelled
      return false // pasture check
    })
  }

  const filteredHotels = filterBookings(hotelBookings)
  const filteredReservations = filterBookings(reservations)
  const filteredTickets = filterBookings(tickets)

  const hasItems = filteredHotels.length > 0 || filteredReservations.length > 0 || filteredTickets.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">View upcoming and past reservation details</p>
      </div>

      {message && (
        <div className="bg-indigo-50 dark:bg-brand-950/50 border border-indigo-200 dark:border-brand-900 text-indigo-700 dark:text-brand-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-darkBorder pb-px">
        {(['UPCOMING', 'PAST', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 dark:border-brand-400 dark:text-brand-300'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 h-24 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          
          {!hasItems && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-12 text-center text-xs text-gray-400">
              No bookings found in this category.
            </div>
          )}

          {/* Hotel Stays */}
          {filteredHotels.map((h) => (
            <div key={h.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
              <div className="flex gap-4 items-start">
                <div className="bg-indigo-50 dark:bg-brand-950/50 p-3 rounded-xl text-indigo-600 dark:text-brand-300">
                  <BedDouble size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{h.room.hotel.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{h.room.roomType}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Check-in: {h.checkIn} • Check-out: {h.checkOut}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end gap-2 justify-between border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">${h.totalAmount}</span>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    h.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {h.status}
                  </span>
                  {h.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(h.id, 'hotel')}
                      className="text-[10px] font-semibold text-red-500 hover:underline"
                    >
                      Cancel stay
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Restaurant Reservations */}
          {filteredReservations.map((r) => (
            <div key={r.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
              <div className="flex gap-4 items-start">
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl text-amber-600 dark:text-amber-400">
                  <Utensils size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{r.restaurant.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.restaurant.cuisineType} Cuisine</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Reservation: {new Date(r.reservationTime).toLocaleString()} • Guests: {r.partySize}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end gap-2 justify-between border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {r.status}
                  </span>
                  {r.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(r.id, 'restaurant')}
                      className="text-[10px] font-semibold text-red-500 hover:underline"
                    >
                      Cancel table
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Event Tickets */}
          {filteredTickets.map((t) => (
            <div key={t.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
              <div className="flex gap-4 items-start">
                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-xl text-purple-600 dark:text-purple-400">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{t.event.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Date: {new Date(t.event.dateTime).toLocaleString()} • Tickets purchased: {t.quantity}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end gap-2 justify-between border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">${t.event.price * t.quantity}</span>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    t.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {t.status}
                  </span>
                  {t.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancelBooking(t.id, 'event')}
                      className="text-[10px] font-semibold text-red-500 hover:underline"
                    >
                      Cancel tickets
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>
      )}

    </motion.div>
  )
}
