import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Planner from './pages/Planner'
import Explore from './pages/Explore'
import Bookings from './pages/Bookings'
import Profile from './pages/Profile'
import StaffDashboard from './pages/StaffDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import { useAuth } from './hooks/useAuth'

// Route Guard to protect private content
function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-400">Verifying session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/planner" 
              element={
                <PrivateRoute>
                  <Planner />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/explore" 
              element={
                <PrivateRoute>
                  <Explore />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <PrivateRoute>
                  <Bookings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/staff" 
              element={
                <PrivateRoute allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
