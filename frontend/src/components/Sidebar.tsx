import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  MessageSquare, 
  Compass, 
  CalendarDays, 
  UserCircle,
  Building,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
  const { user } = useAuth()

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['GUEST', 'STAFF', 'ADMIN'] },
    { name: 'AI Concierge', path: '/chat', icon: MessageSquare, roles: ['GUEST', 'STAFF', 'ADMIN'] },
    { name: 'Travel Planner', path: '/planner', icon: MapIcon, roles: ['GUEST', 'STAFF', 'ADMIN'] },
    { name: 'Explore', path: '/explore', icon: Compass, roles: ['GUEST', 'STAFF', 'ADMIN'] },
    { name: 'Bookings', path: '/bookings', icon: CalendarDays, roles: ['GUEST', 'STAFF', 'ADMIN'] },
    { name: 'Profile', path: '/profile', icon: UserCircle, roles: ['GUEST', 'STAFF', 'ADMIN'] },
  ]

  // Add Staff dashboard link if authorized
  if (user?.role === 'STAFF' || user?.role === 'ADMIN') {
    links.push({ name: 'Staff Panel', path: '/staff', icon: Building, roles: ['STAFF', 'ADMIN'] })
  }

  // Add Admin dashboard link if authorized
  if (user?.role === 'ADMIN') {
    links.push({ name: 'Admin Control', path: '/admin', icon: ShieldCheck, roles: ['ADMIN'] })
  }

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-darkBorder bg-white dark:bg-darkBg flex-shrink-0 hidden md:block">
      <nav className="flex flex-col gap-1 p-4 h-full">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-brand-950/50 dark:text-brand-300 border-l-4 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900/50'
              }`
            }
          >
            <link.icon size={18} />
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
