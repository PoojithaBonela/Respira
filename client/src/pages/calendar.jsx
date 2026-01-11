import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Flame, Wind, Coins, TrendingUp, Activity, Trophy, HeartPulse, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchWithAuth } from '../api'
import LogCigaretteModal from '../components/LogCigaretteModal'

function Calendar() {
  const navigate = useNavigate()

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const currentYear = new Date().getFullYear() // Establish "today's year" for logic checks

  const [calendarData, setCalendarData] = React.useState([])
  const [stats, setStats] = React.useState({
    smoke_free_days: 0,
    days_smoked: 0,
    longest_streak: 0,
    money_spent: 0,
    longest_streak: 0,
    money_spent: 0,
    total_cigarettes: 0,
    min_year: new Date().getFullYear() // Default to current year
  })

  // Modal state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedLogDate, setSelectedLogDate] = useState(null)

  // Get cigarette cost settings from localStorage
  const [cigaretteCost, setCigaretteCost] = useState(null)
  const [currency, setCurrency] = useState('INR')

  useEffect(() => {
    // Fetch settings from API
    fetchWithAuth('/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data.cigarette_cost) setCigaretteCost(parseFloat(data.cigarette_cost))
        if (data.currency) setCurrency(data.currency)
      })
      .catch(err => console.error("Failed to fetch settings:", err))
  }, []) // Empty dependency array - fetch once on mount

  const fetchData = async () => {
    try {
      const response = await fetchWithAuth(`/calendar/${selectedYear}`)
      if (response.ok) {
        const data = await response.json()
        setCalendarData(data.calendar_days)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch calendar data:", error)
    }
  }

  // Fetch data from backend
  React.useEffect(() => {
    fetchData()
  }, [selectedYear])

  const DOT_SIZE = 14
  const DOT_GAP = 6
  const MONTH_GAP = 32

  const monthNames = useMemo(
    () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    []
  )

  // Create a quick lookup map for status by date string
  const statusMap = useMemo(() => {
    const map = {}
    calendarData.forEach(day => {
      map[day.date] = day // Store full day object
    })
    return map
  }, [calendarData])

  const months = useMemo(() => {
    const out = []

    for (let month = 0; month < 12; month++) {
      const first = new Date(selectedYear, month, 1)
      const last = new Date(selectedYear, month + 1, 0)

      // Align to start of week (Sunday)
      const start = new Date(first)
      start.setDate(start.getDate() - start.getDay())

      // Align to end of week (Saturday)
      const end = new Date(last)
      end.setDate(end.getDate() + (6 - end.getDay()))

      const cells = []
      const cursor = new Date(start)
      while (cursor <= end) {
        const d = new Date(cursor)
        // Format date as YYYY-MM-DD to match backend
        const dateStr = d.toLocaleDateString('en-CA') // YYYY-MM-DD

        // Default to 'future' (grey) if no data found
        const dayData = statusMap[dateStr]
        const status = dayData ? dayData.status : 'future'
        const count = dayData ? dayData.cigarettes : 0

        cells.push({
          date: d,
          dateStr: dateStr,
          inMonth: d.getMonth() === month,
          status: d.getMonth() === month ? status : 'future',
          count: count
        })
        cursor.setDate(cursor.getDate() + 1)
      }

      out.push({
        month,
        name: monthNames[month],
        cells,
      })
    }

    return out
  }, [selectedYear, monthNames, statusMap])

  // Real Trend Data derived from stats
  // We pass ALL months to the graph, but indicate where to start drawing
  const graphData = stats.monthly_counts || []
  const firstLogMonth = stats.first_log_month

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b0e13ff', // Darker base (Slate 900)
      color: '#f7fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background Gradient - Dark but not black */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)', // Subtle gradient from Slate 900 to 800
        zIndex: -1
      }} />



      {/* Main Content */}
      <div style={{
        paddingTop: '120px',
        paddingBottom: '60px',
        paddingLeft: '40px',
        paddingRight: '40px',
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <button
            onClick={() => setSelectedYear(prev => prev - 1)}
            disabled={selectedYear <= stats.min_year}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              cursor: selectedYear <= stats.min_year ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: selectedYear <= stats.min_year ? '#4a5568' : '#cbd5e0',
              opacity: selectedYear <= stats.min_year ? 0.5 : 1
            }}
            onMouseOver={(e) => {
              if (selectedYear > stats.min_year) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseOut={(e) => {
              if (selectedYear > stats.min_year) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = '#cbd5e0'
              }
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#f7fafc',
              margin: 0,
              fontFamily: 'Inter, sans-serif'
            }}>
              {selectedYear} Overview
            </h1>
            <p style={{ color: '#cbd5e0', marginTop: '8px', fontSize: '16px', margin: '4px 0 0' }}>
              Your journey through the year at a glance.
            </p>
          </div>

          <button
            onClick={() => setSelectedYear(prev => prev + 1)}
            disabled={selectedYear >= currentYear}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              cursor: selectedYear >= currentYear ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: selectedYear >= currentYear ? '#4a5568' : '#cbd5e0',
              opacity: selectedYear >= currentYear ? 0.5 : 1
            }}
            onMouseOver={(e) => {
              if (selectedYear < currentYear) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseOut={(e) => {
              if (selectedYear < currentYear) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = '#cbd5e0'
              }
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Stats Grid - FORCED SINGLE ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          width: '100%',
          minWidth: '800px'
        }}>
          <StatCard
            icon={<Wind size={24} color="#22c55e" />}
            value={stats.smoke_free_days || 0}
            label="Smoke Free Days"
            sub="Keep it up!"
            accentColor="#22c55e"
          />
          <StatCard
            icon={<Flame size={24} color="#ef4444" />}
            value={stats.days_smoked || 0}
            label="Days Smoked"
            sub="Don't give up."
            accentColor="#ef4444"
          />
          <StatCard
            icon={<TrendingUp size={24} color="#3b82f6" />}
            value={stats.longest_streak || 0}
            label="Longest Streak"
            sub="Consecutive smoke-free days"
            accentColor="#3b82f6"
          />
          <MoneySpentCard
            totalCigarettes={stats.total_cigarettes || 0}
            cigaretteCost={cigaretteCost}
            currency={currency}
          />
        </div>

        {/* Calendar Grid Container */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Abstract background glow - Neutral/White */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: `${MONTH_GAP}px`,
              justifyContent: 'center'
            }}>
              {months.map((m) => (
                <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#cbd5e0', // Slightly lighter for visibility
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    {m.name}
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: `${DOT_GAP}px`,
                  }}>
                    {m.cells.map((cell, idx) => {
                      // Determine color based on status
                      let bg = 'rgba(255, 255, 255, 0.05)'
                      if (cell.inMonth) {
                        if (cell.status === 'smoke-free') bg = '#22c55e' // Green
                        if (cell.status === 'smoked') bg = '#ef4444' // Red
                        if (cell.status === 'future') bg = 'rgba(203, 213, 224, 0.4)' // Light Grey - future days
                        if (cell.status === 'untracked') bg = 'rgba(100, 116, 139, 0.3)' // Dark Grey - past days before app use
                      } else {
                        bg = 'transparent'
                      }

                      return (
                        <div
                          key={idx}
                          title={cell.inMonth ? `${cell.date.toDateString()}${cell.status === 'smoked' ? ` - ${cell.count} cigarettes` : ''}` : ''}
                          style={{
                            width: `${DOT_SIZE}px`,
                            height: `${DOT_SIZE}px`,
                            borderRadius: '4px',
                            backgroundColor: bg,
                            opacity: !cell.inMonth ? 0 : 1,
                            transition: 'all 0.2s ease',
                            boxShadow: cell.status === 'smoke-free' ? '0 0 6px rgba(34, 197, 94, 0.4)' : 'none',
                            cursor: (cell.inMonth && cell.status === 'smoke-free' && cell.date.getMonth() === new Date().getMonth() && cell.date < new Date()) ? 'pointer' : 'default',
                          }}
                          onClick={() => {
                            const today = new Date()
                            const isEligible =
                              cell.inMonth &&
                              cell.status === 'smoke-free' &&
                              cell.date.getMonth() === today.getMonth() &&
                              cell.date.getDate() < today.getDate() && // Past day in current month
                              cell.date.getFullYear() === today.getFullYear()

                            if (isEligible) {
                              setSelectedLogDate(cell.dateStr)
                              setIsLogModalOpen(true)
                            }
                          }}
                          onMouseOver={(e) => {
                            const today = new Date()
                            const isEligible =
                              cell.inMonth &&
                              cell.status === 'smoke-free' &&
                              cell.date.getMonth() === today.getMonth() &&
                              cell.date.getDate() < today.getDate() &&
                              cell.date.getFullYear() === today.getFullYear()

                            if (cell.inMonth && (cell.status !== 'future' || isEligible)) {
                              e.currentTarget.style.transform = 'scale(1.4)'
                              e.currentTarget.style.zIndex = 10
                            }
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.zIndex = 1
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginTop: '40px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '24px'
            }}>
              <LegendItem color="#22c55e" label="Smoke Free" shadow="0 0 6px rgba(34, 197, 94, 0.4)" />
              <LegendItem color="#ef4444" label="Smoked" />
              <LegendItem color="rgba(203, 213, 224, 0.5)" label="Future" />
              <LegendItem color="rgba(100, 116, 139, 0.4)" label="Before App Use" />
            </div>
          </div>
        </div>

        {/* Smoking Trend Graph */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Abstract background glow - Neutral/White */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#f7fafc',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <TrendingUp size={20} color="#3b82f6" />
              Yearly Smoking Trend
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
              Average daily consumption per month. <span style={{ color: '#ef4444' }}>Red = Increase</span>, <span style={{ color: '#22c55e' }}>Green = Decrease</span>.
            </p>

            <TradingGraph data={graphData} labels={monthNames} startIndex={firstLogMonth} />
          </div>
        </div>
        <LogCigaretteModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          onSaveSuccess={fetchData}
          initialDate={selectedLogDate}
        />
      </div>
    </div>
  )
}

// Helper Components

function StatCard({ icon, value, label, sub, accentColor = '#22c55e' }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
      // Force height to match for alignment if content varies
      height: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 12px 30px -10px ${accentColor}33` // Hex opacity 20%
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '200px',
        height: '200px',
        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
        filter: 'blur(40px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          padding: '10px',
          borderRadius: '14px',
          backgroundColor: `${accentColor}15`, // 15 = ~8% opacity
          color: accentColor
        }}>
          {icon}
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#fff',
          fontFamily: 'Inter, sans-serif'
        }}>
          {value}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>
      </div>
    </div>
  )
}

function LegendItem({ color, label, shadow }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '3px',
        backgroundColor: color,
        boxShadow: shadow || 'none'
      }} />
      <span style={{ fontSize: '14px', color: '#cbd5e0' }}>{label}</span>
    </div>
  )
}

function MoneySpentCard({ totalCigarettes, cigaretteCost, currency }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'د.إ'
  }

  const symbol = currencySymbols[currency] || '₹'
  const isCostSet = cigaretteCost !== null && cigaretteCost > 0
  const moneySpent = isCostSet ? (totalCigarettes * cigaretteCost).toFixed(0) : 0

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 30px -10px #eab30833'
        if (!isCostSet) setShowTooltip(true)
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        setShowTooltip(false)
      }}
    >
      {/* Tooltip */}
      {showTooltip && !isCostSet && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#facc15',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          Set cigarette cost in Profile menu
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          padding: '10px',
          borderRadius: '14px',
          backgroundColor: '#eab30815',
          color: '#eab308'
        }}>
          <Coins size={24} />
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#fff',
          fontFamily: 'Inter, sans-serif'
        }}>
          {isCostSet ? `${symbol}${moneySpent}` : '—'}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>Money Spent</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
          {isCostSet ? 'Based on your logged cigarettes' : 'Set cost in profile'}
        </div>
      </div>
    </div>
  )
}


function TradingGraph({ data, labels, startIndex = 0 }) {
  if (!data || data.length === 0) return null

  const width = 1000
  const height = 300
  const padding = 40

  // Only consider data from startIndex onwards for max calculation
  const activeData = data.slice(startIndex >= 0 ? startIndex : 0)
  const maxValue = Math.max(...activeData, 20) // Minimum scale of 20

  // Coordinate calculations - always use data.length for x-axis spacing
  const getX = (index) => padding + (index * ((width - padding * 2) / (data.length - 1)))
  const getY = (value) => height - padding - ((value / maxValue) * (height - padding * 2))

  const points = data.map((val, idx) => ({
    x: getX(idx),
    y: getY(val),
    val,
    label: labels[idx],
    isActive: startIndex >= 0 && idx >= startIndex
  }))

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '800px', overflow: 'visible' }}>
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = height - padding - (tick * (height - padding * 2))
          return (
            <line
              key={tick}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          )
        })}

        {/* Line Segments - only between active points */}
        {points.map((p, i) => {
          if (i === points.length - 1) return null
          const nextP = points[i + 1]

          // Only draw line if BOTH points are active
          if (!p.isActive || !nextP.isActive) return null

          // Color Logic
          let strokeColor = '#94a3b8'
          if (nextP.val > p.val) strokeColor = '#ef4444' // Red
          if (nextP.val < p.val) strokeColor = '#22c55e' // Green

          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={nextP.x}
              y2={nextP.y}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          )
        })}

        {/* Data Points and Labels */}
        {points.map((p, i) => (
          <g key={i}>
            {/* Always show label */}
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
              fontWeight="600"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {p.label}
            </text>

            {/* Only show point and value if active */}
            {p.isActive && (
              <>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#1e293b"
                  stroke="#cbd5e0"
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={p.y - 15}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="600"
                >
                  {p.val}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default Calendar
