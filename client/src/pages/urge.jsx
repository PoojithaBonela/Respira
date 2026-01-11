import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../api'
import {
    Calendar as CalendarIcon, Trophy, User, HeartPulse, Activity,
    Zap, Coffee, Flame, Users, BatteryLow, Repeat,
    Home, Briefcase, Sun,
    Timer, Droplets, Cookie, Wind, Footprints, MapPin, Hand, Target, MessageCircle, Brain
} from 'lucide-react'

// ========== 10 SOLUTION CARDS DATA ==========
const solutionCards = [
    {
        id: 1,
        title: "Delay and Distract",
        subtitle: "Using the 5-10 Minute Rule",
        description: "When an urge hits, pause for 5-10 minutes and do something else. Cravings peak and then fade on their own. Try setting a small timer and focus on a different activity until the urge lessens.",
        icon: Timer,
        color: "#f6ad55"
    },
    {
        id: 2,
        title: "Drink Water + Stretch",
        subtitle: "Hydrate and Move",
        description: "Slowly drinking water helps reduce cravings and keeps your mouth and mind busy. Pair it with gentle stretches to shift focus and release tension.",
        icon: Droplets,
        color: "#63b3ed"
    },
    {
        id: 3,
        title: "Chew Something Healthy",
        subtitle: "Oral Substitutes",
        description: "Keep gum, sugar-free mints, carrot sticks, celery, nuts or seeds handy. Oral substitutes help satisfy mouth fixation and distract from urge.",
        icon: Cookie,
        color: "#68d391"
    },
    {
        id: 4,
        title: "Deep Breathing",
        subtitle: "Mindfulness & Calm",
        description: "Practicing slow, deep breathing - inhale through the nose, exhale through the mouth - can calm your nervous system and ease stress-related cravings.",
        icon: Wind,
        color: "#90cdf4"
    },
    {
        id: 5,
        title: "Go for a Short Walk",
        subtitle: "Physical Burst",
        description: "Even a 5-minute walk or short burst of physical activity (stairs, jumping jacks) can release endorphins, boost mood, and break the automatic urge loop.",
        icon: Footprints,
        color: "#4ade80"
    },
    {
        id: 6,
        title: "Change Your Environment",
        subtitle: "Move to a Smoke-Free Zone",
        description: "If possible, move to a smoke-free zone or a different room. Physically distancing from trigger places can weaken automatic cravings.",
        icon: MapPin,
        color: "#d6bcfa"
    },
    {
        id: 7,
        title: "Busy Hands Activity",
        subtitle: "Interrupt the Urge",
        description: "Use your hands: squeeze a stress ball, fidget with a pen, do a quick hobby task, or even wash dishes - anything to interrupt the urge sequence.",
        icon: Hand,
        color: "#fcd34d"
    },
    {
        id: 8,
        title: "Focus on Your Why",
        subtitle: "Motivation List",
        description: "Remind yourself of your personal reasons for quitting - health, family, money saved - and revisit them when urges strike.",
        icon: Target,
        color: "#f87171"
    },
    {
        id: 9,
        title: "Call or Text Someone",
        subtitle: "Social Support",
        description: "Reaching out to a friend or support group when a craving feels strong can give immediate social backing and distraction.",
        icon: MessageCircle,
        color: "#a78bfa"
    },
    {
        id: 10,
        title: "Visualization Technique",
        subtitle: "Relaxation & Mental Reframing",
        description: "Picture the craving like a wave that rises and falls, or visualize yourself coping calmly without smoking; this mental reframing helps ride out the urge.",
        icon: Brain,
        color: "#f9a8d4"
    }
]

// ========== MAPPING: Feeling + Location => Solution ID ==========
const solutionMapping = {
    "Stressed": {
        "Home": 4,
        "Work / college": 4,
        "Outside": 5,
        "With people": 1,
        "Alone": 10
    },
    "Bored": {
        "Home": 7,
        "Work / college": 7,
        "Outside": 5,
        "With people": 6,
        "Alone": 3
    },
    "Strong craving": {
        "Home": 1,
        "Work / college": 2,
        "Outside": 5,
        "With people": 9,
        "Alone": 8
    },
    "Social pressure": {
        "Home": 8,
        "Work / college": 1,
        "Outside": 6,
        "With people": 9,
        "Alone": 10
    },
    "Tired": {
        "Home": 2,
        "Work / college": 2,
        "Outside": 5,
        "With people": 3,
        "Alone": 10
    },
    "Just habit": {
        "Home": 6,
        "Work / college": 7,
        "Outside": 5,
        "With people": 1,
        "Alone": 3
    }
}

// Default solutions for when location is skipped (based on feeling only)
const defaultSolutionByFeeling = {
    "Stressed": 4,
    "Bored": 7,
    "Strong craving": 1,
    "Social pressure": 8,
    "Tired": 2,
    "Just habit": 6
}

function getSolutionCard(feeling, location) {
    let solutionId
    if (location && solutionMapping[feeling] && solutionMapping[feeling][location]) {
        solutionId = solutionMapping[feeling][location]
    } else if (defaultSolutionByFeeling[feeling]) {
        solutionId = defaultSolutionByFeeling[feeling]
    } else {
        solutionId = 1 // Fallback
    }
    return solutionCards.find(card => card.id === solutionId)
}

function Urge() {
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({
        feeling: '',
        location: ''
    })
    const [selectedSolution, setSelectedSolution] = useState(null)

    // Urge trigger tracking stats
    const [urgeStats, setUrgeStats] = useState({
        'Stressed': 0,
        'Bored': 0,
        'Strong craving': 0,
        'Social pressure': 0,
        'Tired': 0,
        'Just habit': 0
    })

    // Game stats tracking
    const [gameStats, setGameStats] = useState({
        maxTimeFocused: 0,
        totalPoints: 0
    })

    // Fetch stats from backend on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const currentYear = new Date().getFullYear()

                // Fetch Urge Stats for the current year
                const urgeRes = await fetchWithAuth(`/urge/stats?year=${currentYear}`)
                if (urgeRes.ok) {
                    const data = await urgeRes.json()
                    // Merge backend counts with default triggers to ensure all are shown
                    const mergedUrges = { ...urgeStats }
                    Object.entries(data.trigger_counts).forEach(([trigger, count]) => {
                        mergedUrges[trigger] = count
                    })
                    setUrgeStats(mergedUrges)
                }

                // Fetch Game Stats (Lifetime)
                const gameRes = await fetchWithAuth(`/game/stats`)
                if (gameRes.ok) {
                    const data = await gameRes.json()
                    setGameStats({
                        maxTimeFocused: data.max_seconds_focused,
                        totalPoints: data.total_points
                    })
                }
            } catch (err) {
                console.error("Failed to fetch stats from backend:", err)
            }
        }

        fetchStats()
    }, [])

    const handleAnswer = async (key, value) => {
        const newAnswers = { ...answers, [key]: value }
        setAnswers(newAnswers)

        if (key === 'feeling') {
            // Track urge trigger locally
            const updatedStats = { ...urgeStats, [value]: (urgeStats[value] || 0) + 1 }
            setUrgeStats(updatedStats)
            // localStorage.setItem('urgeStats', JSON.stringify(updatedStats))

            // Sync with backend
            try {
                await fetchWithAuth('/urge/log', {
                    method: 'POST',
                    body: JSON.stringify({
                        trigger: value,
                        timestamp: new Date().toISOString()
                    })
                })
            } catch (err) {
                console.error("Failed to sync urge log with backend:", err)
            }

            setStep(2)
        } else if (key === 'location') {
            const solution = getSolutionCard(newAnswers.feeling, value)
            setSelectedSolution(solution)
            setStep(3)
        }
    }

    const handleSkip = () => {
        const solution = getSolutionCard(answers.feeling, null)
        setSelectedSolution(solution)
        setStep(3)
    }

    // --- Styles matching rewards.jsx ---
    const pageStyle = {
        minHeight: '100vh',
        backgroundColor: '#0b0e13ff',
        color: '#f7fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: 'relative',
        overflowX: 'hidden'
    }

    const backgroundGradientStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        zIndex: -1
    }

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 1.8rem',
        zIndex: 50,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(11, 14, 19, 0.5)'
    }

    const navButtonStyle = {
        height: '34px',
        padding: '0 16px',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    }

    const mainContentStyle = {
        paddingTop: '120px',
        paddingBottom: '80px',
        maxWidth: '1100px',
        margin: '0 auto',
        paddingLeft: '24px',
        paddingRight: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)'
    }

    const cardStyle = {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '600px'
    }

    const titleStyle = {
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#f87171',
        marginBottom: '20px',
        fontWeight: 700
    }

    const headingStyle = {
        fontSize: '28px',
        fontWeight: 800,
        color: '#fff',
        marginBottom: '32px',
        fontFamily: "'Inter', sans-serif"
    }

    const optionCardStyle = (isSelected) => ({
        background: isSelected
            ? 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)'
            : 'rgba(255,255,255,0.02)',
        border: isSelected
            ? '1px solid rgba(255,255,255,0.4)'
            : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
        width: '120px',
        height: '120px',
        boxSizing: 'border-box',
        boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.1)' : 'none'
    })

    const optionIconStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px'
    }

    const optionLabelStyle = {
        fontSize: '12px',
        fontWeight: 600,
        color: '#e2e8f0',
        lineHeight: '1.2'
    }

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 120px)',
        gap: '16px',
        justifyContent: 'center'
    }

    // --- Render Functions ---

    const renderStep0 = () => {
        const totalUrges = Object.values(urgeStats).reduce((a, b) => a + b, 0)
        const maxUrge = Math.max(...Object.values(urgeStats), 1)

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', width: '100%' }}>
                <div className="hero-section" style={{ display: 'flex', flexDirection: 'row', gap: '32px', alignItems: 'stretch', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                    {/* Main Card */}
                    <div style={{ ...cardStyle, flex: '1 1 400px', maxWidth: '480px' }}>
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-10%',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <h2 style={{ ...titleStyle, color: '#10b981' }}>Urge Support</h2>
                            <h1 style={headingStyle}>Feeling the urge to smoke?</h1>

                            <button
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '18px 40px',
                                    borderRadius: '999px',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    maxWidth: '320px',
                                    margin: '0 auto',
                                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.4)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)'
                                }}
                                onClick={() => setStep(1)}
                            >
                                Start Quick Pause
                            </button>

                            <p style={{ marginTop: '20px', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
                                Takes less than a minute
                            </p>
                        </div>
                    </div>

                    {/* Secondary Card - Focus Game */}
                    <div style={{
                        ...cardStyle,
                        flex: '1 1 400px',
                        maxWidth: '480px',
                        padding: '40px',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-10%',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(99, 179, 237, 0.12) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <h2 style={{ ...titleStyle, color: '#63b3ed' }}>Focus Game</h2>
                            <h1 style={headingStyle}>Need a distraction?</h1>

                            <button
                                style={{
                                    background: 'linear-gradient(135deg, #63b3ed 0%, #4299e1 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '18px 40px',
                                    borderRadius: '999px',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    maxWidth: '320px',
                                    margin: '0 auto',
                                    boxShadow: '0 10px 30px rgba(99, 179, 237, 0.3)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(99, 179, 237, 0.4)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(99, 179, 237, 0.3)'
                                }}
                                onClick={() => navigate('/focusgame')}
                            >
                                Try the Focus Game
                            </button>

                            <p style={{ marginTop: '20px', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
                                Keep your mind busy for a moment
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Stats Row --- */}
                <div className="hero-section" style={{ display: 'flex', flexDirection: 'row', gap: '32px', alignItems: 'stretch', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                    {/* Urge Stats Card */}
                    <div style={{
                        ...cardStyle,
                        flex: '1 1 400px',
                        maxWidth: '480px',
                        padding: '40px', // Increased padding to match top cards
                        minHeight: '220px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-10%',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', fontWeight: 700 }}>
                                Urge Triggers
                            </h3>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Object.entries(urgeStats).map(([trigger, count]) => (
                                    <div key={trigger} style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '12px', color: '#cbd5e0' }}>{trigger}</span>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{count}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${(count / maxUrge) * 100}%`,
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                                transition: 'width 1s ease-out',
                                                borderRadius: '3px'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Game Stats Card */}
                    <div style={{
                        ...cardStyle,
                        flex: '1 1 400px',
                        maxWidth: '480px',
                        padding: '40px', // Increased padding to match top cards
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '24px'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-10%',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(99, 179, 237, 0.08) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                            <h3 style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, textAlign: 'left', alignSelf: 'flex-start', marginBottom: '20px' }}>
                                Focus Stats
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginBottom: '20px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#63b3ed' }}>{gameStats.maxTimeFocused}s</div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>Max Focus</div>
                                </div>
                                <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#facc15' }}>{gameStats.totalPoints}</div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>Total Points</div>
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(99, 179, 237, 0.05)',
                                padding: '16px',
                                borderRadius: '16px',
                                fontSize: '14px',
                                color: '#90cdf4',
                                border: '1px solid rgba(99, 179, 237, 0.1)',
                                textAlign: 'center',
                                fontWeight: 500
                            }}>
                                Practice makes progress. Keep it up!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderStep1 = () => {
        const options = [
            { label: 'Stressed', icon: <Zap size={24} color="#f6ad55" /> },
            { label: 'Bored', icon: <Coffee size={24} color="#90cdf4" /> },
            { label: 'Strong craving', icon: <Flame size={24} color="#fc8181" /> },
            { label: 'Social pressure', icon: <Users size={24} color="#d6bcfa" /> },
            { label: 'Tired', icon: <BatteryLow size={24} color="#f6e05e" /> },
            { label: 'Just habit', icon: <Repeat size={24} color="#68d391" /> }
        ]

        return (
            <div style={cardStyle}>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(99, 179, 237, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <h2 style={{ ...titleStyle, color: '#63b3ed' }}>Question 1</h2>
                    <h1 style={headingStyle}>How are you feeling right now?</h1>

                    <div className="urge-grid" style={gridStyle}>
                        {options.map((opt) => (
                            <div
                                key={opt.label}
                                style={optionCardStyle(answers.feeling === opt.label)}
                                onClick={() => handleAnswer('feeling', opt.label)}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                                    e.currentTarget.style.borderColor = answers.feeling === opt.label ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <div style={optionIconStyle}>
                                    {opt.icon}
                                </div>
                                <span style={optionLabelStyle}>{opt.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderStep2 = () => {
        const options = [
            { label: 'Home', icon: <Home size={24} color="#63b3ed" /> },
            { label: 'Work / college', icon: <Briefcase size={24} color="#cbd5e0" /> },
            { label: 'Outside', icon: <Sun size={24} color="#f6e05e" /> },
            { label: 'With people', icon: <Users size={24} color="#d6bcfa" /> },
            { label: 'Alone', icon: <User size={24} color="#a0aec0" /> }
        ]

        return (
            <div style={cardStyle}>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(160, 174, 192, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <h2 style={{ ...titleStyle, color: '#a0aec0' }}>Question 2 (Optional)</h2>
                    <h1 style={headingStyle}>Where are you right now?</h1>

                    <div className="urge-grid" style={{ ...gridStyle, gridTemplateColumns: 'repeat(3, 120px)' }}>
                        {options.map((opt) => (
                            <div
                                key={opt.label}
                                style={optionCardStyle(answers.location === opt.label)}
                                onClick={() => handleAnswer('location', opt.label)}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                                    e.currentTarget.style.borderColor = answers.location === opt.label ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <div style={optionIconStyle}>
                                    {opt.icon}
                                </div>
                                <span style={optionLabelStyle}>{opt.label}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        style={{
                            marginTop: '24px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#94a3b8',
                            padding: '10px 28px',
                            borderRadius: '999px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                            e.currentTarget.style.color = '#fff'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                            e.currentTarget.style.color = '#94a3b8'
                        }}
                        onClick={handleSkip}
                    >
                        Skip
                    </button>
                </div>
            </div>
        )
    }

    // Solution Card Renderer
    const renderStep3 = () => {
        if (!selectedSolution) return null
        const SolutionIcon = selectedSolution.icon

        return (
            <div style={cardStyle}>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: `radial-gradient(circle, ${selectedSolution.color}25 0%, transparent 70%)`,
                    filter: 'blur(60px)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: `${selectedSolution.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <SolutionIcon size={40} color={selectedSolution.color} />
                    </div>

                    <h2 style={{ ...titleStyle, color: selectedSolution.color }}>{selectedSolution.subtitle}</h2>
                    <h1 style={headingStyle}>{selectedSolution.title}</h1>

                    <p style={{
                        fontSize: '16px',
                        lineHeight: '1.7',
                        color: '#cbd5e0',
                        marginBottom: '32px',
                        maxWidth: '480px',
                        margin: '0 auto 32px auto',
                        textAlign: 'center'
                    }}>
                        {selectedSolution.description}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            style={{
                                background: `${selectedSolution.color}`,
                                border: 'none',
                                padding: '14px 32px',
                                borderRadius: '999px',
                                color: '#0b0e13',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                            onClick={() => { setStep(0); setAnswers({ feeling: '', location: '' }); setSelectedSolution(null) }}
                        >
                            Done
                        </button>
                        <button
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                padding: '14px 32px',
                                borderRadius: '999px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                            }}
                            onClick={() => {
                                // Show a random different tip
                                const otherCards = solutionCards.filter(c => c.id !== selectedSolution.id)
                                const randomIndex = Math.floor(Math.random() * otherCards.length)
                                setSelectedSolution(otherCards[randomIndex])
                            }}
                        >
                            Try Another Tip
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={pageStyle}>
            <div style={backgroundGradientStyle} />



            {/* Main Content */}
            <div className="page-container" style={mainContentStyle}>
                {step === 0 && renderStep0()}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    )
}

export default Urge
