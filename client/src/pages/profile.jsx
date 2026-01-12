import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Activity, TrendingUp, ShieldCheck, Zap, Calendar as CalendarIcon, Flame, History, TrendingDown, Lightbulb, Trophy, HeartPulse, Maximize2, Minimize2 } from 'lucide-react'
import LogCigaretteModal from '../components/LogCigaretteModal'
import { fetchWithAuth } from '../api'

// --- Dashboard Components ---


// --- Dashboard Components ---

const cardBaseStyle = {
  width: '300px',
  height: '180px',
  borderRadius: '24px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'default',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box'
}

function SnapshotCard({ hasLogged, todayCount, stats }) {
  const isIncrease = stats?.is_increase
  const percentage = stats?.percentage_change || 0
  const lastLogCount = stats?.last_log_count || 0
  const lastLogDate = stats?.last_log_date ? new Date(stats.last_log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'

  return (
    <div className="hero-card" style={{
      ...cardBaseStyle,
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.15)', // Brighter
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 10px rgba(255,255,255,0.05)', // Glow
    }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#94a3b8',
        marginBottom: 'auto', // Pushes content down
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', color: '#3b82f6' }}>
          <Activity size={16} />
        </div>
        Snapshot
      </div>

      {!hasLogged ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
          Log today to unlock stats
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main Stat */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '42px', fontWeight: 800, color: '#f7fafc', lineHeight: 1 }}>{todayCount}</span>
            <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600 }}>cigarettes today</span>
          </div>

          {/* Footer Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e0' }}>
              <History size={14} color="#94a3b8" />
              <span>Last Log{lastLogDate !== 'N/A' ? ` (${lastLogDate})` : ''}: {lastLogCount}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: isIncrease ? '#ef4444' : '#22c55e', // Red for increase, Green for decrease
              fontWeight: 600
            }}>
              {isIncrease ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isIncrease ? '+' : '-'}{percentage}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InsightCard({ hasLogged, navigate }) {
  const [insight, setInsight] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [lastFocusIndex, setLastFocusIndex] = React.useState(null)
  const [isExpanded, setIsExpanded] = React.useState(false)

  const fetchInsight = async () => {
    if (!hasLogged) return

    setIsLoading(true)
    try {
      let url = '/chat/daily-insight'
      const params = []
      if (lastFocusIndex !== null) {
        params.push(`exclude_index=${lastFocusIndex}`)
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }

      const response = await fetchWithAuth(url)
      if (response.ok) {
        const data = await response.json()
        setInsight(data.insight)
        setLastFocusIndex(data.focus_index)
      }
    } catch (error) {
      console.error('Failed to fetch daily insight:', error)
      setInsight("Check your trends—small wins add up!")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchInsight()
  }, [hasLogged])

  return (
    <div className="hero-card" style={{
      ...cardBaseStyle,
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 10px rgba(255,255,255,0.05)',
      height: isExpanded ? 'auto' : '180px',
      minHeight: '180px',
      maxHeight: isExpanded ? '800px' : '180px',
      zIndex: isExpanded ? 50 : 1,
      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease, box-shadow 0.3s ease',
      paddingBottom: isExpanded ? '32px' : '24px'
    }}
      onMouseOver={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
        }
      }}
      onMouseOut={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
        }
      }}
    >
      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#94a3b8',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', background: 'rgba(234, 179, 8, 0.15)', borderRadius: '8px', color: '#eab308' }}>
            <Lightbulb size={16} />
          </div>
          AI Insight
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasLogged && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                fetchInsight()
              }}
              disabled={isLoading}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
              title="Get new insight"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }}>
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 size={14} color="#94a3b8" /> : <Maximize2 size={14} color="#94a3b8" />}
          </button>
        </div>
      </div>

      {!hasLogged ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
          Insights appear after logging
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          textAlign: 'center',
          padding: isExpanded ? '20px 12px' : '12px 8px 0',
          overflowY: 'hidden'
        }}>
          <div style={{
            fontSize: isExpanded ? '15px' : '14px',
            color: '#e2e8f0',
            lineHeight: '1.6',
            fontWeight: 500,
            fontStyle: 'italic'
          }}>
            {isLoading ? (
              <span style={{ color: '#94a3b8' }}>Generating insight...</span>
            ) : (
              `"${insight || 'Check your trends—small wins add up!'}"`
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}


function Profile() {
  const navigate = useNavigate()
  const transitionDuration = 500 // ms
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [snapshotData, setSnapshotData] = useState({
    today_count: 0,
    last_log_count: 0,
    last_log_date: null,
    percentage_change: 0,
    is_increase: false,
    has_logged_today: false
  })

  const [cigarettesToday, setCigarettesToday] = useState(0)

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth('/log/stats')
      if (response.ok) {
        const data = await response.json()
        setSnapshotData(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile stats:", error)
    }
  }

  React.useEffect(() => {
    fetchStats()
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)

  // ... (Shine styles - Keeping same)
  // ... (Effects - Keeping same)
  // ... (Cards - Keeping same)
  // ... (displayCards - Keeping same)
  // ... (toggleTrigger - Keeping same)

  // NOTE: I will skip repeating the full component body where unchanged. 
  // Wait, I need to match the replacement target.
  // The user wants me to fix the placement. The easiest way is to rewrite the Render part specifically the Hero Section.

  // I will use `replace_file_content` to replace the `SnapshotCard` and `InsightCard` definitions first (which I just did above),
  // AND THEN replace the Hero section in a separate chunk or same chunk if contiguous. 
  // Actually, the previous tool call replaced lines 7-130 and 422-473. They are far apart. 
  // I must check where `SnapshotCard` is defined. It's at the top.
  // I will focus THIS replacement on the Component Definitions (Top of file)
  // and I will do a SECOND replacement for the Hero Section Layout (Middle of file).

  // Wait, the tool only allows contiguous edits or `multi_replace`. I should use `multi_replace` or just do the top first.
  // I'll do the top definitions now.


  // Shine effect styles
  const shineStyles = `
    @keyframes shine {
      0% { left: -100%; }
      20% { left: 100%; }
      100% { left: 100%; }
    }
    .shine-card {
      position: relative;
      overflow: hidden;
    }
    .shine-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
      transform: skewX(-25deg);
      transition: none;
      pointer-events: none;
    }
    .shine-card:hover::before {
      animation: shine 1.5s infinite;
    }
  `

  const backgroundGradientStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#0b0e13ff',
    zIndex: 0
  }

  const triggerOptions = useMemo(
    () => ['Stress', 'Boredom', 'After meals', 'Late night', 'With friends', 'Just habit'],
    []
  )

  // Auto-scroll effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
      setIsTransitioning(true)
    }, 3000) // Move every 3 seconds

    return () => clearInterval(timer)
  }, [])

  // Handle infinite loop reset
  React.useEffect(() => {
    if (currentIndex === 5) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0)
      }, transitionDuration)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex])

  const featureCards = useMemo(() => [
    {
      id: 'awareness',
      icon: <Brain size={48} color="#22c55e" />,
      title: 'You chose awareness',
      highlight: "You're already ahead of millions of smokers.",
      body: 'You chose awareness over avoidance. Smoking is present, but controlled — no guilt, no fear.'
    },
    {
      id: 'counts',
      icon: <Activity size={48} color="#22c55e" />,
      title: 'Every cigarette counts',
      highlight: 'Every cigarette you log matters.',
      body: 'Awareness is the first step to control. Logging builds progress visually — without pressure to quit.'
    },
    {
      id: 'patterns',
      icon: <TrendingUp size={48} color="#22c55e" />,
      title: 'Patterns hide in the smoke',
      highlight: 'Your smoking follows patterns.',
      body: 'What feels random reveals structure. AI-driven insights connect smoking habits with daily life.'
    },
    {
      id: 'reductions',
      icon: <ShieldCheck size={48} color="#22c55e" />,
      title: 'Small reductions, real impact',
      highlight: 'Reducing even a little lowers long-term risk.',
      body: 'Focus on reduction, not fear. Each small step brightens your path. Encourages honesty in logging and removes the perfection mindset.'
    },
    {
      id: 'control',
      icon: <Zap size={48} color="#22c55e" />,
      title: "You’re in control",
      highlight: 'This is your journey — not a test.',
      body: 'Log honestly. Improve gradually. Calm, controlled, peaceful. Your journey, your pace, your choice.'
    }
  ], [])

  const displayCards = useMemo(() => [...featureCards, ...featureCards.slice(0, 4)], [featureCards])

  // ... (render)


  // We will pass the fetchStats as a callback to the modal
  const handleModalSave = async () => {
    await fetchStats()
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b0e13', // Deep dark background
      color: '#f7fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{shineStyles}</style>



      <style>{shineStyles}</style>

      {/* Background Gradient & Blobs */}
      <div style={backgroundGradientStyle} />

      {/* Top Left Blob */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Bottom Right Blob */}
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Main content area */}
      <div className="page-container" style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        paddingTop: '120px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

          {/* Dashboard Hero Section */}
          <div className="hero-section" style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '24px',
            width: '100%',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}>
            {/* Left Card */}
            {/* Left Card */}
            <SnapshotCard
              hasLogged={snapshotData.has_logged_today}
              todayCount={snapshotData.today_count}
              stats={snapshotData}
            />

            {/* Center Action Tile */}
            {/* Center Action Tile */}
            <button
              type="button"
              className="log-button hero-card"
              onClick={() => {
                setIsLogModalOpen(true)
              }}
              style={{
                ...cardBaseStyle,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15), 0 0 20px rgba(16, 185, 129, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(16, 185, 129, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)'
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.15), 0 0 20px rgba(16, 185, 129, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                zIndex: 0
              }} />

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                marginBottom: '4px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
                  Log Smoking
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#6ee7b7', marginTop: '6px' }}>
                  Record today's intake
                </div>
              </div>
            </button>

            {/* Right Card */}
            <InsightCard hasLogged={snapshotData.has_logged_today} navigate={navigate} />
          </div>

          {/* Feature Section */}
          <div style={{
            width: '100%',
            maxWidth: '1400px',
            margin: '60px auto 0',
            padding: '0 24px', // Reduced from 48px to give more space
            boxSizing: 'border-box'
          }}>
            {/* Section Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#f7fafc',
                marginBottom: '12px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              }}>
                Your path to awareness
              </h2>
              <p style={{
                fontSize: '18px',
                color: '#a0aec0',
                fontWeight: 400,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Every step forward is a step toward understanding.
              </p>
            </div>

            {/* Feature Cards - Step Carousel */}
            <div className="feature-carousel feature-carousel-container" style={{
              width: '100%',
              maxWidth: '1106px', // Exact width for 3 cards (350*3 + 24*2 + 8px padding)
              margin: '0 auto',
              overflow: 'hidden',
              boxSizing: 'border-box',
              position: 'relative'
            }}>
              <div
                className="feature-carousel-track"
                style={{
                  display: 'flex',
                  gap: '24px',
                  // Updated calculation for 350px width
                  transform: `translateX(-${currentIndex * (350 + 24)}px)`,
                  transition: isTransitioning ? `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
                  padding: '10px 4px'
                }}
              >
                {displayCards.map((card, idx) => (
                  <div
                    key={`${card.id}-${idx}`}
                    className="shine-card feature-card"
                    style={{
                      position: 'relative',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), 0 0 10px rgba(255,255,255,0.05)',
                      width: '350px', // Reduced from 360px
                      height: '380px',
                      flex: '0 0 auto',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '32px 24px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{
                      marginBottom: '20px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      width: 'fit-content',
                      padding: '14px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {card.icon}
                    </div>

                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '10px',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      lineHeight: '1.2'
                    }}>
                      {card.title}
                    </h3>
                    <p style={{
                      fontSize: '15px',
                      color: 'rgba(79, 181, 130, 1)f',
                      fontWeight: 600,
                      marginBottom: '12px',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      lineHeight: '1.4'
                    }}>
                      {card.highlight}
                    </p>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: 0,
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                    }}>
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      <LogCigaretteModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaveSuccess={handleModalSave}
        initialCount={snapshotData.today_count || 0}
        initialTriggers={snapshotData.today_triggers || []}
        hasLoggedAlready={snapshotData.has_logged_today}
      />
    </div >
  )



}

export default Profile
