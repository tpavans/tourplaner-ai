import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Check, Heart, ShieldCheck, ChevronRight, ArrowLeft, Bell, 
  Settings as SettingsIcon, LogOut, Globe, DollarSign, Eye, ShieldAlert 
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { user, getPreferences, updatePreferences, logout } = useAuth()
  
  // Navigation states
  const [subView, setSubView] = useState<'MENU' | 'PERSONAL_INFO' | 'PREFERENCES' | 'NOTIFICATIONS' | 'SETTINGS'>('MENU')

  // Personal Info Form State
  const [fullName, setFullName] = useState(user?.fullName || 'Anusri Kommana')
  const [email, setEmail] = useState(user?.email || 'anusri@example.com')
  const [phone, setPhone] = useState('+91 98765 43210')

  // Travel Preferences State
  const [interests, setInterests] = useState<string[]>([])
  const [foodPreferences, setFoodPreferences] = useState<string[]>([])
  const [accommodationPreferences, setAccommodationPreferences] = useState<string[]>([])
  const [budgetTier, setBudgetTier] = useState('MEDIUM')
  const [mobilityLevel, setMobilityLevel] = useState('STANDARD')
  
  // Settings States
  const [language, setLanguage] = useState('English')
  const [currency, setCurrency] = useState('INR (₹)')
  const [notifyToggle, setNotifyToggle] = useState(true)
  const [themeMode, setThemeMode] = useState<'Light' | 'Dark'>('Light')

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

  const handleSavePreferences = async (e: React.FormEvent) => {
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
      setSubView('MENU')
    } catch {
      setMessage('Failed to update preferences.')
    }
  }

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Personal information updated successfully.')
    setSubView('MENU')
  }

  const travelInterestsOptions = ['BEACHES', 'WATER_SPORTS', 'CULTURAL_SIGHTS', 'ADVENTURE', 'FOOD_TOURS', 'NIGHTLIFE']
  const diningOptions = ['VEGETARIAN', 'SEAFOOD', 'VEGAN', 'GLUTEN_FREE']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto flex flex-col gap-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-3xl p-6 shadow-sm min-h-[500px]"
    >
      {message && (
        <div className="bg-indigo-50 dark:bg-brand-950/50 border border-indigo-200 dark:border-brand-900 text-indigo-700 dark:text-brand-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <ShieldCheck size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* --- SUBVIEW: MENU --- */}
      {subView === 'MENU' && (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center pt-4">
            <h1 className="text-xl font-bold tracking-tight">My Profile</h1>
          </div>

          {/* User Avatar Card */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-md capitalize">
              {fullName.charAt(0)}
            </div>
            <div className="text-center">
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{fullName}</h2>
              <p className="text-xs text-gray-400">{email} • {phone}</p>
            </div>
          </div>

          {/* Settings Menu List */}
          <div className="flex flex-col border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
            
            <button 
              onClick={() => setSubView('PERSONAL_INFO')}
              className="flex justify-between items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-zinc-850 text-left text-xs font-semibold text-gray-700 dark:text-gray-250 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <User size={16} className="text-gray-400" />
                Personal Information
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>

            <button 
              onClick={() => setSubView('PREFERENCES')}
              className="flex justify-between items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-zinc-850 text-left text-xs font-semibold text-gray-700 dark:text-gray-250 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Heart size={16} className="text-gray-400" />
                Travel Preferences
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>

            <button 
              onClick={() => setSubView('NOTIFICATIONS')}
              className="flex justify-between items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-zinc-850 text-left text-xs font-semibold text-gray-700 dark:text-gray-250 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Bell size={16} className="text-gray-400" />
                Notifications
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>

            <button 
              onClick={() => setSubView('SETTINGS')}
              className="flex justify-between items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-zinc-850 text-left text-xs font-semibold text-gray-700 dark:text-gray-250 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <SettingsIcon size={16} className="text-gray-400" />
                Settings
              </span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>

            <button 
              onClick={logout}
              className="flex justify-between items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-zinc-850 text-left text-xs font-semibold text-red-500 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <LogOut size={16} />
                Logout
              </span>
              <ChevronRight size={14} />
            </button>

          </div>
        </div>
      )}

      {/* --- SUBVIEW: PERSONAL INFO --- */}
      {subView === 'PERSONAL_INFO' && (
        <form onSubmit={handleSavePersonalInfo} className="flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
            <button type="button" onClick={() => setSubView('MENU')} className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg">
              <ArrowLeft size={16} />
            </button>
            <h2 className="font-bold text-sm">Personal Information</h2>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="font-bold text-gray-400">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="font-bold text-gray-400">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <label className="font-bold text-gray-400">Phone Number</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 font-medium"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm mt-3"
          >
            Save Information
          </button>
        </form>
      )}

      {/* --- SUBVIEW: TRAVEL PREFERENCES --- */}
      {subView === 'PREFERENCES' && (
        <form onSubmit={handleSavePreferences} className="flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
            <button type="button" onClick={() => setSubView('MENU')} className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg">
              <ArrowLeft size={16} />
            </button>
            <h2 className="font-bold text-sm">Travel Preferences</h2>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-gray-400">Travel Interests</label>
            <div className="grid grid-cols-2 gap-2">
              {travelInterestsOptions.map((opt) => {
                const active = interests.includes(opt)
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleToggle(opt, interests, setInterests)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:border-brand-500 dark:bg-brand-950/30'
                        : 'border-gray-250 dark:border-zinc-800 text-gray-550'
                    }`}
                  >
                    <span className="capitalize">{opt.toLowerCase().replace('_', ' ')}</span>
                    {active && <Check size={12} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-gray-400">Dining Choices</label>
            <div className="grid grid-cols-2 gap-2">
              {diningOptions.map((opt) => {
                const active = foodPreferences.includes(opt)
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => handleToggle(opt, foodPreferences, setFoodPreferences)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 dark:border-brand-500 dark:bg-brand-950/30'
                        : 'border-gray-250 dark:border-zinc-800 text-gray-550'
                    }`}
                  >
                    <span className="capitalize">{opt.toLowerCase().replace('_', ' ')}</span>
                    {active && <Check size={12} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-gray-400">Budget Tier</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
            >
              <option value="LOW">Low Budget (Cost-focused)</option>
              <option value="MEDIUM">Medium Budget (Standard Comfort)</option>
              <option value="HIGH">High Budget (Luxury)</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm mt-3"
          >
            Save Preferences
          </button>
        </form>
      )}

      {/* --- SUBVIEW: NOTIFICATIONS --- */}
      {subView === 'NOTIFICATIONS' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setSubView('MENU')} className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg">
                <ArrowLeft size={16} />
              </button>
              <h2 className="font-bold text-sm">Notifications</h2>
            </div>
            <button onClick={() => setMessage('All marked as read')} className="text-[10px] text-indigo-600 dark:text-brand-400 font-bold hover:underline">
              Mark all as read
            </button>
          </div>

          {/* Screen 10 Notification Items */}
          <div className="flex flex-col gap-3">
            
            <div className="flex gap-3 bg-gray-50 dark:bg-zinc-850 p-3 rounded-xl text-xs">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 dark:text-gray-150">Booking Confirmed</h5>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">Sunset Cruise booking is confirmed.</p>
                <span className="text-[9px] text-gray-400 mt-1 block">5 min ago</span>
              </div>
            </div>

            <div className="flex gap-3 bg-gray-50 dark:bg-zinc-850 p-3 rounded-xl text-xs">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <SettingsIcon size={14} />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 dark:text-gray-150">Itinerary Updated</h5>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">Your itinerary for Day 2 has been updated.</p>
                <span className="text-[9px] text-gray-400 mt-1 block">10 min ago</span>
              </div>
            </div>

            <div className="flex gap-3 bg-gray-50 dark:bg-zinc-850 p-3 rounded-xl text-xs">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Bell size={14} />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 dark:text-gray-150">Event Reminder</h5>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">Goa Food Festival is starting tomorrow.</p>
                <span className="text-[9px] text-gray-400 mt-1 block">1 hour ago</span>
              </div>
            </div>

            <div className="flex gap-3 bg-gray-50 dark:bg-zinc-850 p-3 rounded-xl text-xs">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Globe size={14} />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 dark:text-gray-150">Special Offer</h5>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">Get 10% off on spa services today!</p>
                <span className="text-[9px] text-gray-400 mt-1 block">3 hours ago</span>
              </div>
            </div>

            <div className="flex gap-3 bg-gray-50 dark:bg-zinc-850 p-3 rounded-xl text-xs">
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center flex-shrink-0">
                <Globe size={14} />
              </div>
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 dark:text-gray-150">Weather Update</h5>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5">Rainy clouds tomorrow in Goa.</p>
                <span className="text-[9px] text-gray-400 mt-1 block">6 hours ago</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SUBVIEW: SETTINGS --- */}
      {subView === 'SETTINGS' && (
        <div className="flex flex-col gap-5 text-xs">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
            <button onClick={() => setSubView('MENU')} className="p-1 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded-lg">
              <ArrowLeft size={16} />
            </button>
            <h2 className="font-bold text-sm">Settings</h2>
          </div>

          {/* Section General */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">General</h4>
            
            <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-850 px-4 py-3.5 rounded-xl">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Language</span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-bold text-indigo-600 dark:text-brand-400 focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-850 px-4 py-3.5 rounded-xl">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Currency</span>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent font-bold text-indigo-600 dark:text-brand-400 focus:outline-none"
              >
                <option value="INR (₹)">INR (₹)</option>
                <option value="USD ($)">USD ($)</option>
              </select>
            </div>

            <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-850 px-4 py-3.5 rounded-xl">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Notifications</span>
              <input 
                type="checkbox" 
                checked={notifyToggle}
                onChange={() => setNotifyToggle(!notifyToggle)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" 
              />
            </div>

            <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-850 px-4 py-3.5 rounded-xl">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Theme</span>
              <button 
                onClick={() => setThemeMode(themeMode === 'Light' ? 'Dark' : 'Light')}
                className="font-bold text-indigo-600 dark:text-brand-400 hover:underline"
              >
                {themeMode}
              </button>
            </div>
          </div>

          {/* Section Privacy */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Privacy</h4>
            
            <a href="#" className="flex justify-between items-center bg-gray-50 dark:bg-zinc-850 px-4 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Privacy Policy</span>
              <ChevronRight size={14} className="text-gray-400" />
            </a>

            <a href="#" className="flex justify-between items-center bg-gray-50 dark:bg-zinc-850 px-4 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Terms & Conditions</span>
              <ChevronRight size={14} className="text-gray-400" />
            </a>
          </div>

          {/* Section Support */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Support</h4>
            
            <a href="#" className="flex justify-between items-center bg-gray-50 dark:bg-zinc-850 px-4 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Help & Support</span>
              <ChevronRight size={14} className="text-gray-400" />
            </a>
          </div>

          <div className="text-center pt-2 text-[10px] text-gray-400">
            App Version 1.0.0
          </div>
        </div>
      )}

    </motion.div>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
