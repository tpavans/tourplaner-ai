import React from 'react'
import { Sun, Moon, Bell, LogOut, User as UserIcon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-darkBorder bg-white/75 dark:bg-darkBg/75 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <span className="font-bold text-xl leading-none">C</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            Concierge<span className="text-indigo-600 dark:text-brand-400">IQ</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <button className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-darkBorder"></div>

          {/* User Profile info */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold">{user.fullName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-brand-950 border border-indigo-200 dark:border-brand-900 flex items-center justify-center text-indigo-600 dark:text-brand-300 font-bold capitalize">
                {user.fullName.charAt(0)}
              </div>
              <button 
                onClick={logout}
                title="Logout"
                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
