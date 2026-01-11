import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Trophy,
    Calendar as CalendarIcon,
    Activity,
    User,
    Medal,
    Award,
    Shield,
    Star,
    Flame,
    CheckCircle2,
    Lock,
    HeartPulse,
    ShieldCheck,
    Crown,
    Gem,
    Brain,
    Compass,
    Target,
    Zap,
    Mountain,
    Wind,
    Sun,
    Coins,
    MessageCircle,
    Check
} from 'lucide-react'
import { fetchWithAuth } from '../api'

function Rewards() {
    const navigate = useNavigate()

    // Data State
    const [currentStreak, setCurrentStreak] = useState(0)
    const [urgeSupportDays, setUrgeSupportDays] = useState(0)
    const [totalFocusPoints, setTotalFocusPoints] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch actual data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch LIFE TIME Streak
                const response = await fetchWithAuth('/calendar/stats/lifetime')
                if (response.ok) {
                    const data = await response.json()
                    // Use longest_streak for rewards purposes
                    setCurrentStreak(data.longest_streak || 0)
                }

                // 2. Fetch Support Sessions
                const urgeRes = await fetchWithAuth('/urge/stats')
                if (urgeRes.ok) {
                    const data = await urgeRes.json()
                    setUrgeSupportDays(data.total_days || 0)
                }

                // 3. Fetch Focus Points
                const gameRes = await fetchWithAuth('/game/stats')
                if (gameRes.ok) {
                    const data = await gameRes.json()
                    setTotalFocusPoints(data.total_points || 0)
                }
            } catch (err) {
                console.error("Error fetching rewards data:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // FOR PREVIEW: Show all as unlocked
    const showAllUnlocked = false // Set to false to use actual data logic

    // Styles
    const pageStyle = {
        minHeight: '100vh',
        backgroundColor: '#0b0e13ff', // Matches other pages
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

    // --- Configuration ---

    const milestones = [
        {
            title: "Early Stage",
            color: "#4ade80", // Soft Green
            badges: [
                { name: "First Step", value: 3, unit: "Days", icon: CheckCircle2, metricTag: 'streak' },
                { name: "One Week Strong", value: 7, unit: "Days", icon: Flame, metricTag: 'streak' },
                { name: "Consistency", value: 14, unit: "Days", icon: Star, metricTag: 'streak' }
            ]
        },
        {
            title: "Habit Formation",
            color: "#2dd4bf", // Teal
            badges: [
                { name: "One Month Clear", value: 30, unit: "Days", icon: Shield, metricTag: 'streak' },
                { name: "Momentum", value: 45, unit: "Days", icon: Activity, metricTag: 'streak' },
                { name: "Self Control", value: 60, unit: "Days", icon: Lock, metricTag: 'streak' }
            ]
        },
        {
            title: "Identity Shift",
            color: "#3b82f6", // Deep Blue
            badges: [
                { name: "New Normal", value: 90, unit: "Days", icon: User, metricTag: 'streak' },
                { name: "Resilience", value: 120, unit: "Days", icon: Activity, metricTag: 'streak' },
                { name: "Half-Year Free", value: 180, unit: "Days", icon: CalendarIcon, metricTag: 'streak' }
            ]
        },
        {
            title: "Mastery",
            color: "#facc15", // Gold
            badges: [
                { name: "Steadfast", value: 240, unit: "Days", icon: Award, metricTag: 'streak' },
                { name: "Unbreakable", value: 300, unit: "Days", icon: ShieldCheck, metricTag: 'streak' },
                { name: "One Year Free", value: 365, unit: "Days", icon: Trophy, metricTag: 'streak' }
            ]
        },
        {
            title: "Extended Mastery",
            color: "#f87171", // Legendary Red
            badges: [
                { name: "Relentless", value: 400, unit: "Days", icon: Mountain, metricTag: 'streak' },
                { name: "Half a Thousand", value: 500, unit: "Days", icon: Sun, metricTag: 'streak' },
                { name: "Two Years Free", value: 730, unit: "Days", icon: Crown, metricTag: 'streak' }
            ]
        },
        {
            title: "Urge Support",
            color: "#fb923c", // Orange
            badges: [
                { name: "First Week", value: 7, unit: "Days", icon: Wind, metricTag: 'support' },
                { name: "Fortnight", value: 14, unit: "Days", icon: Compass, metricTag: 'support' },
                { name: "One Month", value: 30, unit: "Days", icon: Shield, metricTag: 'support' },
                { name: "Two Months", value: 60, unit: "Days", icon: Brain, metricTag: 'support' },
                { name: "Three Months", value: 90, unit: "Days", icon: Target, metricTag: 'support' },
                { name: "Five Months", value: 150, unit: "Days", icon: Zap, metricTag: 'support' }
            ]
        },
        {
            title: "Focus & Minds",
            color: "#a855f7", // Purple
            badges: [
                { name: "Focused Starter", value: 1000, unit: "Points", icon: Coins, metricTag: 'points' },
                { name: "Mind Over Urge", value: 5000, unit: "Points", icon: Brain, metricTag: 'points' },
                { name: "Unshaken", value: 10000, unit: "Points", icon: ShieldCheck, metricTag: 'points' },
                { name: "Deep Focus", value: 25000, unit: "Points", icon: Gem, metricTag: 'points' },
                { name: "Steel Mind", value: 50000, unit: "Points", icon: Shield, metricTag: 'points' },
                { name: "Zen State", value: 100000, unit: "Points", icon: Star, metricTag: 'points' }
            ]
        }
    ]

    const allBadges = milestones.flatMap(m => m.badges)
    const totalBadges = allBadges.length

    const isBadgeEarned = (badge) => {
        if (badge.metricTag === 'points') return totalFocusPoints >= badge.value
        if (badge.metricTag === 'support') return urgeSupportDays >= badge.value
        return currentStreak >= badge.value
    }

    const earnedBadgesCount = allBadges.filter(b => isBadgeEarned(b)).length
    const earnedBadgesList = allBadges.filter(b => isBadgeEarned(b))

    // Calculate next streak milestone
    const nextStreakMilestone = milestones
        .flatMap(m => m.badges)
        .filter(b => b.metricTag === 'streak' && b.value > currentStreak)
        .sort((a, b) => a.value - b.value)[0]

    const nextMilestoneValue = nextStreakMilestone ? nextStreakMilestone.value : currentStreak
    const progressToNext = nextStreakMilestone ? (currentStreak / nextStreakMilestone.value) * 100 : 100

    // Dynamic Sizing for Earned Badges Card
    const getBadgeSize = () => {
        if (earnedBadgesCount <= 4) return 48
        if (earnedBadgesCount <= 8) return 36
        if (earnedBadgesCount <= 12) return 28
        if (earnedBadgesCount <= 20) return 22
        return 18
    }
    const badgeSize = getBadgeSize()

    return (
        <div style={pageStyle}>
            <div style={backgroundGradientStyle} />



            {/* Main Content */}
            <div style={{
                paddingTop: '120px',
                paddingBottom: '80px',
                maxWidth: '1000px',
                margin: '0 auto',
                paddingLeft: '24px',
                paddingRight: '24px'
            }}>

                {/* Page Title */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'Inter, sans-serif' }}>
                        Smoke-Free Rewards
                    </h1>
                    <p style={{ color: '#cbd5e0', margin: 0 }}>
                        Milestones earned through consistency.
                    </p>
                </div>

                {/* Hero Section - Grid Layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', // Streak gets slightly more space
                    gap: '24px',
                    marginBottom: '60px'
                }}>
                    {/* Card 1: Current Streak */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '30px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        {/* Abstract background - Neutral */}
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-10%',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4ade80', marginBottom: '20px', fontWeight: 700 }}>Longest Streak</h2>
                            <div style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1, marginBottom: '8px', fontFamily: "'Inter', sans-serif", color: '#fff' }}>
                                {currentStreak} <span style={{ fontSize: '24px', fontWeight: 500, color: '#94a3b8' }}>days</span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ width: '100%', maxWidth: '320px', marginTop: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '10px', fontWeight: 500 }}>
                                    <span>Next milestone</span>
                                    <span>{nextMilestoneValue - currentStreak} days left</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progressToNext}%`, height: '100%', background: '#4ade80', borderRadius: '10px', boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Badges Earned */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '30px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        {/* Abstract background - Neutral */}
                        <div style={{
                            position: 'absolute',
                            top: '-20%',
                            right: '-20%',
                            width: '300px',
                            height: '300px',
                            background: 'radial-gradient(circle, rgba(250, 204, 21, 0.12) 0%, transparent 70%)',
                            filter: 'blur(50px)',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#facc15', marginBottom: '20px', fontWeight: 700 }}>Badges Earned</h2>

                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                                <span style={{ fontSize: '64px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{earnedBadgesCount}</span>
                                <span style={{ fontSize: '24px', color: '#64748b', fontWeight: 500 }}>/ {totalBadges}</span>
                            </div>

                            {/* Mini Badge Preview - Dynamically Sizing */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                maxWidth: '100%',
                                padding: '0 10px'
                            }}>
                                {earnedBadgesList.length > 0 ? earnedBadgesList.map((badge, idx) => (
                                    <div key={idx} style={{
                                        width: `${badgeSize}px`,
                                        height: `${badgeSize * 1.16}px`, // Maintain shield ratio
                                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }} title={badge.name}>
                                        <badge.icon size={badgeSize * 0.45} color={milestones.find(m => m.badges.includes(badge))?.color || '#fff'} />
                                    </div>
                                )) : (
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>No badges yet. Keep going!</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Milestones Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>

                    {milestones.map((section, idx) => (
                        <div key={idx}>
                            {/* Section Header */}
                            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
                                <span style={{
                                    fontSize: '16px',
                                    fontFamily: "'Inter', sans-serif",
                                    color: '#94a3b8',
                                    fontWeight: 600,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase'
                                }}>
                                    {section.title}
                                </span>
                                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
                            </div>

                            {/* Badges Row */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '24px'
                            }}>
                                {section.badges.map((badge, bIdx) => {
                                    const isUnlocked = showAllUnlocked || isBadgeEarned(badge)
                                    const Icon = badge.icon

                                    return (
                                        <div key={bIdx} style={{
                                            background: isUnlocked
                                                ? `linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)`
                                                : 'rgba(255,255,255,0.02)',
                                            border: isUnlocked
                                                ? '1px solid rgba(255,255,255,0.4)' // Brighter border for unlocked
                                                : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '24px',
                                            padding: '32px 24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            opacity: 1,
                                            filter: 'none',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: `0 0 15px rgba(255,255,255,0.1), 0 0 30px ${section.color}20`,
                                            cursor: 'pointer'
                                        }}
                                            title={isUnlocked ? badge.name : undefined}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
                                                e.currentTarget.style.boxShadow = `0 0 25px rgba(255,255,255,0.25), 0 0 50px ${section.color}50, 0 10px 30px rgba(0,0,0,0.4)`
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                                                e.currentTarget.style.boxShadow = `0 0 15px rgba(255,255,255,0.1), 0 0 30px ${section.color}20`
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
                                            }}
                                        >

                                            {/* Glow Effect behind shield */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '20px',
                                                width: '100px',
                                                height: '100px',
                                                background: section.color,
                                                filter: 'blur(60px)',
                                                opacity: 0.2,
                                                zIndex: 0
                                            }} />

                                            {/* Badge Shield Wrapper (No clipping) */}
                                            <div style={{ position: 'relative', width: '80px', height: '90px', marginBottom: '20px' }}>
                                                {/* Shield Visual (Clipped) */}
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                                    background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}cc 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: `inset 0 0 20px rgba(255,255,255,0.3)`,
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}>
                                                    {/* Inner border refinement */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: '2px',
                                                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                                        background: '#0b0e13',
                                                        zIndex: -1
                                                    }} />

                                                    {/* Re-add background for the content */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: '3px',
                                                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                                        background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}aa 100%)`,
                                                        zIndex: -1
                                                    }} />

                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {isUnlocked ? (
                                                            <Icon
                                                                size={32}
                                                                color="#fff"
                                                                strokeWidth={2.5}
                                                            />
                                                        ) : (
                                                            <Lock size={28} color="#fff" strokeWidth={2.5} />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Earned Checkmark Indicator (Positioned outside clip-path) */}
                                                {isUnlocked && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-6px',
                                                        right: '-6px',
                                                        width: '24px',
                                                        height: '24px',
                                                        backgroundColor: '#fff',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                                                        zIndex: 10,
                                                        border: `2px solid #0b0e13`
                                                    }}>
                                                        <Check size={14} color={section.color} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f7fafc', marginBottom: '6px', zIndex: 1, letterSpacing: '0.02em' }}>
                                                {badge.name}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: isUnlocked ? section.color : '#64748b',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                zIndex: 1
                                            }}>
                                                {badge.value} {badge.unit}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                </div>

            </div>
        </div>
    )
}

export default Rewards
