import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Check, Heart, ShieldCheck, HelpCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { user, getPreferences, updatePreferences } = useAuth()

  const [interests, setInterests] = useState<string[]>([])
  const [foodPreferences, setFoodPreferences] = useState<string[]>([])
  const [accommodationPreferences, setAccommodationPreferences] = useState<string[]>([])
  const [budgetTier, setBudgetTier] = useState('MEDIUM')
  const [mobilityLevel, setMobilityLevel] = useState('STANDARD')
  const [message, setMessage] = useState('')

  useEffect(() => {
    getPreferences()
      .then((data) => {
        setInterests(data.interests || [])
        setFoodPreferences(data.foodPreferences || [])
        setAccommodationPreferences(data.accommodationPreferences || [])
        setBudgetTier(data.budgetTier || 'MEDIUM')
        setMobilityLevel(data.mobilityLevel || 'STANDARD')
      })
      .catch(() => {})
  }, [])

  const handleToggle = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item))
    } else {
      setList([...list, item])
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    try {
      await updatePreferences({
        interests,
        foodPreferences,
        accommodationPreferences,
        budgetTier,
        mobilityLevel,
      })
      setMessage('Preferences saved successfully.')
    } catch {
      setMessage('Failed to update preferences.')
    }
  }

  const travelInterestsOptions = ['BEACHES', 'WATER_SPORTS', 'CULTURAL_SIGHTS', 'ADVENTURE', 'FOOD_TOURS', 'NIGHTLIFE']
  const diningOptions = ['VEGETARIAN', 'SEAFOOD', 'VEGAN', 'GLUTEN_FREE']
  const hotelStyleOptions = ['LUXURY', 'BEACHFRONT', 'BOUTIQUE', 'BUDGET']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto flex flex-col gap-6"
    >
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personal Profile</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage traveler profiles and AI personalization context</p>
      </div>

      {message && (
        <div className="bg-indigo-50 dark:bg-brand-950/50 border border-indigo-200 dark:border-brand-900 text-indigo-700 dark:text-brand-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <ShieldCheck size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Account Info Details */}
      {user && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-brand-950 border border-indigo-200 dark:border-brand-900 flex items-center justify-center text-indigo-600 dark:text-brand-300 font-extrabold text-2xl capitalize">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.fullName}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            <span className="inline-block bg-indigo-50 dark:bg-brand-950/50 text-indigo-600 dark:text-brand-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-2">
              Role: {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Preference Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Travel Interests Checkboxes */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <Heart size={16} className="text-red-500" />
            Travel Interests
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {travelInterestsOptions.map((opt) => {
              const active = interests.includes(opt)
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleToggle(opt, interests, setInterests)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:border-brand-500 dark:bg-brand-950/30 dark:text-brand-300'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800/55'
                  }`}
                >
                  <span className="capitalize">{opt.toLowerCase().replace('_', ' ')}</span>
                  {active && <Check size={14} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Food Preferences Checkboxes */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <Heart size={16} className="text-amber-500" />
            Dining & Dietary Preferences
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {diningOptions.map((opt) => {
              const active = foodPreferences.includes(opt)
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => handleToggle(opt, foodPreferences, setFoodPreferences)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'border-amber-500 bg-amber-50/30 text-amber-600 dark:border-amber-550 dark:bg-amber-950/20 dark:text-amber-300'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800/55'
                  }`}
                >
                  <span className="capitalize">{opt.toLowerCase().replace('_', ' ')}</span>
                  {active && <Check size={14} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Style & Budget Configs */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400">Budget Tier</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="LOW">Low Budget (Cost-focused)</option>
              <option value="MEDIUM">Medium Budget (Standard Comfort)</option>
              <option value="HIGH">High Budget (Luxury & Fine Dining)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400">Mobility & Accessibility</label>
            <select
              value={mobilityLevel}
              onChange={(e) => setMobilityLevel(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="STANDARD">Standard Mobility</option>
              <option value="REDUCED">Reduced Mobility (Accessible Routes)</option>
            </select>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-md transition-colors"
          >
            Save preferences
          </button>
        </div>

      </form>

    </motion.div>
  )
}
