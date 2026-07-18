import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Download, Printer, X, BedDouble, Utensils, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
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
  
  // Ticket download modal state
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)

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

  // Dynamic filter classifying bookings into UPCOMING or PAST history
  const filterBookings = (list: any[]) => {
    return list.filter((item) => {
      const isCancelled = item.status === 'CANCELLED'
      if (activeTab === 'CANCELLED') return isCancelled

      const targetDateStr = item.checkOut || item.reservationTime || item.event?.dateTime || ""
      const isPastDate = targetDateStr ? new Date(targetDateStr) < new Date() : false

      if (activeTab === 'PAST') return !isCancelled && isPastDate
      if (activeTab === 'UPCOMING') return !isCancelled && !isPastDate
      return false
    })
  }

  const filteredHotels = filterBookings(hotelBookings)
  const filteredReservations = filterBookings(reservations)
  const filteredTickets = filterBookings(tickets)

  const hasItems = filteredHotels.length > 0 || filteredReservations.length > 0 || filteredTickets.length > 0

  const triggerDownloadTicket = (item: any, type: string) => {
    setSelectedTicket({ ...item, ticketType: type })
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
        <h1 className="text-2xl font-bold tracking-tight">My Reservations</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">View upcoming bookings, past history, and download print tickets</p>
      </div>

      {message && (
        <div className="bg-indigo-50 dark:bg-brand-950/50 border border-indigo-250 dark:border-brand-900 text-indigo-700 dark:text-brand-300 p-4 rounded-xl text-xs flex items-center gap-2">
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

              <div className="flex sm:flex-col items-end gap-3 justify-between border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200">${h.totalAmount}</span>
                </div>
                
                <div className="flex gap-2 items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    h.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {h.status}
                  </span>

                  {h.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => triggerDownloadTicket(h, 'HOTEL')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-brand-400 rounded-lg text-xs"
                        title="Download Ticket"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleCancelBooking(h.id, 'hotel')}
                        className="text-[10px] font-semibold text-red-500 hover:underline"
                      >
                        Cancel stay
                      </button>
                    </>
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
                    Time: {new Date(r.reservationTime).toLocaleString()} • Guests: {r.partySize}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-end gap-3 justify-between border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex gap-2 items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {r.status}
                  </span>
                  
                  {r.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => triggerDownloadTicket(r, 'RESTAURANT')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-brand-400 rounded-lg text-xs"
                        title="Download Booking Details"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleCancelBooking(r.id, 'restaurant')}
                        className="text-[10px] font-semibold text-red-500 hover:underline"
                      >
                        Cancel table
                      </button>
                    </>
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

              <div className="flex sm:flex-col items-end gap-3 justify-between border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200">${t.event.price * t.quantity}</span>
                </div>

                <div className="flex gap-2 items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    t.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {t.status}
                  </span>
                  
                  {t.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => triggerDownloadTicket(t, 'EVENT')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-brand-400 rounded-lg text-xs"
                        title="Download Ticket"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleCancelBooking(t.id, 'event')}
                        className="text-[10px] font-semibold text-red-500 hover:underline"
                      >
                        Cancel tickets
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Ticket Download / Print Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col p-6 animate-slide-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <CheckCircle size={16} className="text-green-500" />
                Voucher Ticket Details
              </h3>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Voucher Card Container */}
            <div id="print-area" className="border border-dashed border-gray-250 dark:border-zinc-700 rounded-xl p-5 my-4 bg-gray-50/50 dark:bg-zinc-900/50 flex flex-col gap-4 text-xs">
              <div className="text-center pb-2 border-b border-gray-200/50">
                <h4 className="font-black text-sm uppercase tracking-wide text-indigo-700 dark:text-brand-400">ConciergeIQ Voucher</h4>
                <p className="text-[10px] text-gray-400">Booking Reference: CONF-32A{selectedTicket.id}K9</p>
              </div>

              <div className="space-y-2.5">
                {selectedTicket.ticketType === 'HOTEL' && (
                  <>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Hotel Stay:</span>
                      <strong className="text-gray-800 dark:text-gray-200 text-right">{selectedTicket.room.hotel.name}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Room Type:</span>
                      <span>{selectedTicket.room.roomType}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Check In:</span>
                      <span>{selectedTicket.checkIn}</span>
                    </p>
                  </>
                )}

                {selectedTicket.ticketType === 'RESTAURANT' && (
                  <>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Restaurant:</span>
                      <strong className="text-gray-800 dark:text-gray-200 text-right">{selectedTicket.restaurant.name}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Cuisine:</span>
                      <span>{selectedTicket.restaurant.cuisineType}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span>{new Date(selectedTicket.reservationTime).toLocaleString()}</span>
                    </p>
                  </>
                )}

                {selectedTicket.ticketType === 'EVENT' && (
                  <>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Event Name:</span>
                      <strong className="text-gray-800 dark:text-gray-200 text-right">{selectedTicket.event.name}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Date & Time:</span>
                      <span>{new Date(selectedTicket.event.dateTime).toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Quantity:</span>
                      <span>{selectedTicket.quantity} Ticket(s)</span>
                    </p>
                  </>
                )}

                <p className="flex justify-between border-t border-gray-200/50 pt-2 mt-2 font-bold text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-green-600">CONFIRMED</span>
                </p>
              </div>

              {/* Barcode representation */}
              <div className="flex flex-col items-center gap-1.5 pt-3 border-t border-gray-200/50">
                <div className="h-10 w-full bg-gradient-to-r from-zinc-900 via-transparent to-zinc-900 flex justify-between px-4 dark:from-zinc-100">
                  {[...Array(24)].map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-full bg-zinc-800 dark:bg-zinc-200`} 
                      style={{ width: `${(idx % 3 === 0 ? 3 : 1)}px` }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono tracking-widest text-gray-400">890204739502</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer size={14} />
                Print Voucher
              </button>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center text-gray-700 dark:text-gray-200"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </motion.div>
  )
}
