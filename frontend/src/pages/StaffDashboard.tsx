import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building, Users, Calendar, ArrowUpRight, BedDouble, CheckCircle } from 'lucide-react'
import API from '../services/api'

interface StaffStats {
  totalReservations: number
  pendingRequests: number
  occupancyRate: number
  localStaffRevenue: number
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<StaffStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/dashboard/staff?hotelId=1')
      .then((res) => {
        setStats(res.data)
      })
      .catch(() => {
        // Fallback
        setStats({
          totalReservations: 18,
          pendingRequests: 3,
          occupancyRate: 82.4,
          localStaffRevenue: 14580.00
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const mockReservationsList = [
    { guest: 'Anusri Kommana', room: 'Ocean View Deluxe', checkIn: '2026-07-20', checkOut: '2026-07-25', status: 'CONFIRMED' },
    { guest: 'Kiran Kumar', room: 'Garden Suite', checkIn: '2026-07-21', checkOut: '2026-07-23', status: 'PENDING' },
    { guest: 'Priya Sharma', room: 'Presidential Suite', checkIn: '2026-07-24', checkOut: '2026-07-28', status: 'CONFIRMED' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Management Panel</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Track room stays, occupancies, and guest arrivals</p>
      </div>

      {loading ? (
        <div className="h-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl animate-pulse"></div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Total Bookings</span>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-extrabold">{stats.totalReservations}</span>
                  <div className="bg-indigo-50 dark:bg-brand-950 p-2 rounded-lg text-indigo-600 dark:text-brand-300">
                    <BedDouble size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Pending Requests</span>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-extrabold">{stats.pendingRequests}</span>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-lg text-yellow-600">
                    <Calendar size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Occupancy Rate</span>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-extrabold">{stats.occupancyRate}%</span>
                  <div className="bg-green-50 dark:bg-green-950/25 p-2 rounded-lg text-green-600">
                    <Building size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Local Revenue</span>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-extrabold">${stats.localStaffRevenue}</span>
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded-lg text-purple-600">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings log table */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold">Room Reservations Queue</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-darkBorder text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Room Type</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReservationsList.map((res, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4 font-semibold">{res.guest}</td>
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">{res.room}</td>
                      <td className="py-3.5 px-4 text-gray-400">{res.checkIn} to {res.checkOut}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {res.status === 'PENDING' ? (
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold px-3 py-1 rounded-lg">
                            Approve
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                            <CheckCircle size={12} className="text-green-500" />
                            Confirmed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </motion.div>
  )
}
