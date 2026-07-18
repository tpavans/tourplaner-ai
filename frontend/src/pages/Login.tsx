import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ShieldAlert, Chrome, Mail, Apple } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login, signup } = useAuth()
  
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('GUEST')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (isRegister) {
        await signup({ email, password, fullName, phone, role })
        setSuccess('Account created successfully! Please log in.')
        setIsRegister(false)
        setPassword('')
      } else {
        await login(email, password)
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/30">
            <span className="font-extrabold text-2xl tracking-tighter leading-none">C</span>
          </div>
          <h2 className="text-2xl font-bold font-display">ConciergeIQ</h2>
          <p className="text-xs text-gray-400">Your Personal Travel Concierge</p>
        </div>

        {/* Action Title */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold tracking-tight">
            {isRegister ? 'Create an Account' : 'Welcome Back!'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister ? 'Sign up to begin your journey' : 'Sign in to continue your journey'}
          </p>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="mb-4 bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-950/50 border border-green-800 text-green-300 p-3 rounded-xl text-xs">
            {success}
          </div>
        )}

        {/* Login/Signup Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Anusri Kommana"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="GUEST">GUEST (Traveler)</option>
                  <option value="STAFF">HOTEL STAFF</option>
                  <option value="ADMIN">ADMINISTRATOR</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email Address</label>
            <input
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-gray-400">Password</label>
              {!isRegister && (
                <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300">
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all mt-2"
          >
            {isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6 gap-3">
          <div className="h-px bg-zinc-800 flex-1"></div>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">or continue with</span>
          <div className="h-px bg-zinc-800 flex-1"></div>
        </div>

        {/* OAuth Mocks */}
        <div className="grid grid-cols-3 gap-3">
          <button className="flex justify-center items-center py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 rounded-xl text-gray-300">
            <Chrome size={18} />
          </button>
          <button className="flex justify-center items-center py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 rounded-xl text-gray-300">
            <Apple size={18} />
          </button>
          <button className="flex justify-center items-center py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 rounded-xl text-gray-300">
            <Mail size={18} />
          </button>
        </div>

        {/* Register Toggle */}
        <div className="text-center mt-6 text-xs text-gray-400">
          <span>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
              setSuccess('')
            }}
            className="text-indigo-400 font-semibold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  )
}
