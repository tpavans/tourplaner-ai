import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, CheckCircle, Navigation, Terminal, ChevronDown, ChevronUp } from 'lucide-react'
import API from '../services/api'
import Map from '../components/Map'

interface ChatMessage {
  id?: number
  role: 'USER' | 'ASSISTANT'
  message: string
}

interface CardData {
  id: number
  title: string
  description: string
  category: string
  rating: number
  distance: string
  imageUrl: string
  type: string
}

interface ItineraryProposal {
  title: string
  destination: string
  startDate: string
  endDate: string
  activities: {
    time: string
    name: string
    type: string
    activityId?: number
    lat?: number
    lng?: number
  }[]
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<CardData[]>([])
  const [proposal, setProposal] = useState<ItineraryProposal | null>(null)
  const [agentLogs, setAgentLogs] = useState<string[]>([])
  const [showLogs, setShowLogs] = useState(true)
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [geolocatedCity, setGeolocatedCity] = useState('Rajahmundry')
  
  // Geolocation tracker
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Track browser location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          setUserCoords({ lat: 17.0005, lng: 81.8040 }) // Default near Rajahmundry (not Goa)
        }
      )
    }
  }, [])

  useEffect(() => {
    if (userCoords) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userCoords.lat}&lon=${userCoords.lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.suburb || data.address.village || 'Rajahmundry';
            setGeolocatedCity(city);
          }
        })
        .catch(() => {});
    }
  }, [userCoords])

  useEffect(() => {
    // Load history
    API.get('/chat/history')
      .then((res) => {
        const history = res.data.map((h: any) => ({
          role: h.role,
          message: h.message,
        }))
        setMessages(history)
        if (history.length === 0) {
          setMessages([
            {
              role: 'ASSISTANT',
              message: "Hello! I am your ConciergeIQ travel orchestrator. Let me know what you'd like to do, or try asking:\n• 'plan dinner in ravulapalem budget 1000'\n• 'suggest movie theaters in Vizag'",
            },
          ])
        }
      })
      .catch(() => {
        setMessages([
          {
            role: 'ASSISTANT',
            message: 'Hello! I am your ConciergeIQ travel orchestrator. How can I help you today?',
          },
        ])
      })
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input
    setInput('')
    setMessages((prev) => [...prev, { role: 'USER', message: userMsg }])
    setLoading(true)
    setBookingSuccess('')
    setAgentLogs([])

    try {
      const res = await API.post('/chat', { message: userMsg, currentLocation: geolocatedCity })
      const data = res.data

      setMessages((prev) => [...prev, { role: 'ASSISTANT', message: data.responseMessage }])
      
      if (data.recommendations && data.recommendations.length > 0) {
        setCards(data.recommendations)
      } else {
        setCards([])
      }

      if (data.proposedItinerary) {
        setProposal(data.proposedItinerary)
      } else {
        setProposal(null)
      }

      if (data.agentLogs) {
        setAgentLogs(data.agentLogs)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ASSISTANT', message: 'I encountered an issue processing that query. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!proposal) return
    setLoading(true)
    try {
      await API.post('/chat/itinerary/approve', proposal)
      setBookingSuccess('Itinerary booked successfully! Bookings added to your timeline.')
      setProposal(null)
      setCards([])
      setMessages((prev) => [
        ...prev,
        { role: 'ASSISTANT', message: 'Great decision! I have booked your reservations and updated your active schedules.' },
      ])
    } catch {
      setBookingSuccess('Failed to process automated bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getMapPins = () => {
    if (!proposal || !proposal.activities) return []
    return proposal.activities.map((act, i) => ({
      id: act.activityId || i,
      name: act.name,
      lat: act.lat || 15.55,
      lng: act.lng || 73.75,
      type: (act.type || 'ATTRACTION') as any
    }))
  }

  const getProposalLegs = () => {
    const legs: { from: string; to: string; distance: string; duration: string }[] = []
    const pins = getMapPins()
    let prevPoint: { name: string; lat: number; lng: number } | null = null

    if (userCoords) {
      prevPoint = { name: 'Your Location', lat: userCoords.lat, lng: userCoords.lng }
    }

    pins.forEach((pin) => {
      if (prevPoint) {
        const dLat = pin.lat - prevPoint.lat
        const dLng = pin.lng - prevPoint.lng
        const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111
        const durationMin = Math.round(distance * 2.5)
        legs.push({
          from: prevPoint.name,
          to: pin.name,
          distance: `${distance.toFixed(1)} km`,
          duration: `${durationMin} min drive`
        })
      }
      prevPoint = { name: pin.name, lat: pin.lat, lng: pin.lng }
    })
    return legs
  }

  const legs = getProposalLegs()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto h-[calc(100vh-8.5rem)]"
    >
      
      {/* Left Column: Chat dialogue feed (lg:col-span-7) */}
      <div className="lg:col-span-7 flex flex-col bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm h-full">
        
        {/* Active AI Status Header */}
        <div className="border-b border-gray-200 dark:border-darkBorder p-4 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white dark:border-zinc-900 rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Concierge</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Online • Powered by LangGraph Multi-Agent Orchestrator</p>
          </div>
        </div>

        {/* Message History Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ASSISTANT' && (
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-brand-950 flex items-center justify-center text-indigo-600 dark:text-brand-300 flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-2xl p-4 text-sm ${
                  msg.role === 'USER'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200/50 dark:border-zinc-700/50'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
              </div>

              {msg.role === 'USER' && (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 flex-shrink-0 font-bold capitalize">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Dynamic Recommendations Cards */}
          {cards.length > 0 && (
            <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {cards.map((card) => (
                <div key={card.id} className="bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-darkBorder rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="h-28 overflow-hidden relative">
                    <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize">
                      {card.type.toLowerCase()}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <h4 className="font-bold text-xs">{card.title}</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">{card.description}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold pt-2 mt-1 border-t border-gray-100 dark:border-zinc-700">
                      <span>Rating: {card.rating}★</span>
                      <span>{card.distance} away</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}



          {/* Proposal approval actions */}
          {proposal && (
            <div className="pl-11 mt-4">
              <div className="bg-indigo-50/50 dark:bg-brand-950/10 border border-indigo-200 dark:border-brand-900 rounded-2xl p-4 flex flex-col gap-3 max-w-xl">
                <div>
                  <h4 className="font-bold text-sm text-indigo-700 dark:text-brand-300">Ready to Book?</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approve this plan to automate bookings in {proposal.destination}</p>
                </div>
                <button
                  onClick={handleApprove}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle size={14} />
                  Confirm and Book Itinerary
                </button>
              </div>
            </div>
          )}

          {bookingSuccess && (
            <div className="pl-11 mt-2">
              <div className="bg-green-150 border border-green-200 text-green-700 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900 p-3 rounded-xl text-xs">
                {bookingSuccess}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-start pl-11">
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl p-4 text-xs italic text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span>AI Concierge is typing...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Box Footer */}
        <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-darkBorder p-4 bg-white dark:bg-zinc-900 flex gap-2">
          <input
            type="text"
            placeholder="Type your trip request (e.g. 'plan cinema evening in Vizag')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-darkBorder rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-3 rounded-xl transition-all shadow-md"
          >
            <Send size={18} />
          </button>
        </form>

      </div>

      {/* Right Column: Google Maps & Time-to-Time Proposal steps (lg:col-span-5) */}
      <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-4 shadow-sm flex flex-col gap-3 flex-1 min-h-[300px]">
          <h3 className="font-bold text-sm flex items-center gap-1.5">
            <Navigation size={16} className="text-indigo-600 dark:text-brand-400" />
            Live Map Tracking
          </h3>
          
          <div className="flex-1">
            <Map 
              drawRoute={proposal !== null} 
              userCoords={userCoords}
              pins={getMapPins()}
            />
          </div>
        </div>

        {proposal ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-sm text-indigo-700 dark:text-brand-300">{proposal.title}</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Destination: {proposal.destination} • {proposal.startDate}</p>
            </div>

            {/* Time to Time Activities */}
            <div className="relative border-l border-gray-200 dark:border-zinc-800 pl-4 ml-1 space-y-4">
              {proposal.activities.map((act, i) => (
                <div key={i} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white dark:border-zinc-900"></div>
                  <div>
                    <span className="font-bold text-indigo-600 dark:text-brand-400">{act.time}</span>
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">{act.name}</h5>
                    <span className="text-[9px] uppercase font-bold text-gray-450">{(act.type || 'ATTRACTION').toLowerCase()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Travel leg times summary */}
            {legs.length > 0 && (
              <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-gray-400">Travel Steps</h4>
                {legs.map((leg, index) => (
                  <div key={index} className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400">
                    <span>{leg.from.split(' ')[0]} ➔ {leg.to.split(' ')[0]}</span>
                    <span className="font-bold text-indigo-600 dark:text-brand-450">{leg.distance} ({leg.duration})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-darkBorder rounded-2xl p-6 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 flex-1">
            <Bot size={28} className="text-indigo-400 animate-pulse" />
            <p>Ask the AI Concierge to plan an itinerary to view the Google Maps routing and live coordinates.</p>
          </div>
        )}
      </div>

    </motion.div>
  )
}
