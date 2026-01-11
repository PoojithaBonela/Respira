import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    BarChart3, Calendar as CalendarIcon, Clock, AlertTriangle, TrendingUp, Shield,
    ChevronDown, Activity, Sparkles, Send, User, Bot, MessageSquare,
    ArrowRight, Trophy, LineChart, ArrowDown, HeartPulse, ChevronLeft, Info,
    Minimize2, Maximize2
} from 'lucide-react'
import { fetchWithAuth } from '../api'

function Insights() {
    const navigate = useNavigate()

    // Real Data State
    const [insightsData, setInsightsData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch All Insights
    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await fetchWithAuth('/insights/all')
                if (response.ok) {
                    const data = await response.json()
                    setInsightsData(data)
                }
            } catch (err) {
                console.error("Failed to fetch all insights:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchInsights()
    }, [])

    // Deconstruct data for easy access
    const hasData = insightsData?.has_data
    const reduction = insightsData?.reduction || { rate: 0, status: hasData === false ? "Log daily for comparison" : "Loading..." }
    const trend = insightsData?.trend || { data: [], labels: [] }
    const path = insightsData?.path || { goal_date: hasData === false ? "unlock timeline" : "Calculating...", is_reducing: false }
    const patterns = insightsData?.patterns || { high_risk_time: hasData === false ? "Log urges to see patterns" : "Loading...", top_triggers: [] }
    const consistency = insightsData?.consistency || { score: 0, standing: hasData === false ? "Log activity to build score" : "Loading..." }


    // Styles
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

    const mainContentStyle = {
        paddingTop: '120px',
        paddingBottom: '60px',
        paddingLeft: '40px',
        paddingRight: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
    }

    const cardGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', // Responsive grid
        gap: '24px',
        width: '100%'
    }

    return (
        <div style={pageStyle}>
            <div style={backgroundGradientStyle} />



            {/* Main Content Wrapper - Fixes the overlap issue */}
            <div className="page-container" style={mainContentStyle}>

                {/* Title Section */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h1 style={{
                        fontSize: '32px', // Slightly reduced from 36px
                        fontWeight: 800,
                        color: '#f7fafc',
                        margin: 0,
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.02em'
                    }}>
                        Insights
                    </h1>
                    <p style={{ color: '#cbd5e0', marginTop: '8px', fontSize: '15px', fontWeight: 400 }}>
                        Understand your patterns, one step at a time.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="insights-grid" style={cardGridStyle}>

                    {/* Card 1: Trend */}
                    <Card title="Weekly Trend" subtitle={new Date().toLocaleString('default', { month: 'long' })} glowColor="#3b82f6">
                        <div style={{ height: '130px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '5px' }}>
                            {trend && trend.data && trend.data.length > 0 ? trend.data.map((val, i) => {
                                const maxVal = Math.max(...trend.data, 1);
                                // Logic: Red if data > 0, Grey if 0 (future or empty)
                                const isRed = val > 0;
                                return (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', flex: 1 }}>
                                        {/* Bar Track */}
                                        <div title={`${trend.labels[i]}: ${val.toFixed(0)} cigs`} style={{
                                            width: '20px',
                                            flex: undefined,
                                            height: '100%',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            overflow: 'hidden',
                                            marginBottom: '8px'
                                        }}>
                                            {/* Bar Fill */}
                                            <div style={{
                                                width: '100%',
                                                height: isRed ? `${(val / maxVal) * 100}%` : '4px', // Show tiny pill for empty/future weeks? Or 0? User asked for grey if no data.
                                                // Actually "if no data available... it should be grey". 
                                                // Let's make 0 value result in a 0-height fill but the track remains visible as the "grey" placeholder.
                                                // OR we can make a small grey pill for 0 to show "it's there".
                                                // Let's stick to track only for 0 so it looks clean, or small height.
                                                // User ref image had "tracks". 
                                                // Let's assume transparent fill for 0, so only track is seen.
                                                height: isRed ? `${(val / maxVal) * 100}%` : '0%',
                                                background: '#ef4444',
                                                borderRadius: '10px',
                                                transition: 'height 0.5s ease',
                                                minHeight: isRed ? '4px' : '0'
                                            }} />
                                        </div>
                                        {/* Label */}
                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>
                                            {trend.labels[i]}
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div style={{ fontSize: '13px', color: '#94a3b8', width: '100%', textAlign: 'center', pb: '20px' }}>
                                    {isLoading ? 'Loading trend...' : 'Start logging to see your trend'}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Card 2: Reduction Rate */}
                    <Card title="Reduction" subtitle="Compared to last month" glowColor="#22c55e">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'rgba(34, 197, 94, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <ArrowDown size={24} color="#4ade80" />
                            </div>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: 700, color: '#f7fafc' }}>
                                    {isLoading ? '...' : (hasData === false ? '0%' : `${reduction.rate}%`)}
                                </div>
                                <div style={{ fontSize: '13px', color: '#4ade80', fontWeight: 600 }}>
                                    {isLoading ? 'Calculating...' : (hasData === false ? 'Log daily for comparison' : reduction.status)}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Card 3: Quit Timeline */}
                    <Card title="Current path" subtitle={path.is_goal_set ? `${path.current_progress} / ${path.smoke_free_goal} days smoke-free` : "Set goal in profile (Default: 7 days)"} glowColor="#22c55e">
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                                <span>{path.current_progress || 0} days</span>
                                <span>{path.smoke_free_goal || 7} days</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${Math.min(100, ((path.current_progress || 0) / (path.smoke_free_goal || 7)) * 100)}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
                                    borderRadius: '4px',
                                    transition: 'width 1s ease'
                                }} />
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '13px', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>
                                    {isLoading ? 'Predicting...' : (
                                        hasData === false ? 'Log daily to unlock prediction' : <>If pattern continues: <strong>{path.goal_date}</strong></>
                                    )}
                                </span>
                                {path.probability > 0 && (
                                    <span style={{
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        background: 'rgba(74, 222, 128, 0.1)',
                                        color: '#4ade80',
                                        fontWeight: 600
                                    }}>
                                        {path.probability}% Prob.
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Card 4: High-Risk Moments */}
                    <Card title="High-risk moments" subtitle="Based on past logs" glowColor="#ef4444">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                            {/* Peak Urge Time */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                                    <Clock size={20} color="#f87171" style={{ opacity: 0.9 }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#f7fafc' }}>
                                        {isLoading ? '...' : (hasData === false ? 'Log urges to see patterns' : patterns.high_risk_time)}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Peak urge time</div>
                                </div>
                            </div>
                            {/* Peak Smoking Day */}
                            {patterns.high_risk_day && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ padding: '10px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px' }}>
                                        <CalendarIcon size={20} color="#fbbf24" style={{ opacity: 0.9 }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#f7fafc' }}>
                                            {(() => {
                                                const day = patterns.high_risk_day;
                                                const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                                                    day === 2 || day === 22 ? 'nd' :
                                                        day === 3 || day === 23 ? 'rd' : 'th';
                                                const monthName = new Date().toLocaleString('default', { month: 'long' });
                                                return `${day}${suffix} ${monthName}`;
                                            })()}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Highest smoking day</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Card 5: Pattern Awareness */}
                    <Card title="Pattern awareness" subtitle="Common triggers" glowColor="#f59e0b">
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                            {patterns.top_triggers.length > 0 ? patterns.top_triggers.map((tag, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    color: '#e2e8f0',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '6px 12px',
                                    borderRadius: '8px'
                                }}>
                                    {tag === 'Stress' ? <AlertTriangle size={14} color="#fbbf24" /> : <Activity size={14} color="#94a3b8" />}
                                    {tag}
                                </div>
                            )) : (
                                <div style={{ fontSize: '13px', color: '#64748b' }}>
                                    {isLoading ? 'Analysing...' : 'Log your triggers everyday to see patterns'}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Card 6: Consistency Score */}
                    <Card title="Consistency score" subtitle="Steady effort matters" glowColor="#8b5cf6">
                        {/* Info Icon with Tooltip */}
                        <div style={{ position: 'absolute', top: '24px', right: '24px', cursor: 'help' }} className="group">
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Info size={14} color="#94a3b8" />
                            </div>
                            {/* Tooltip Popup */}
                            <div style={{
                                position: 'absolute',
                                top: '30px',
                                right: '0',
                                width: '280px',
                                background: 'rgba(15, 23, 42, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '16px',
                                zIndex: 50,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                display: 'none', // Hidden by default, shown on hover via CSS or state (using simple style override here if possible, but React logic is safer. Let's use State)
                            }} className="tooltip-content">
                                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f7fafc', margin: '0 0 8px 0' }}>How is this calculated?</h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#cbd5e0', lineHeight: '1.5' }}>
                                    <li style={{ marginBottom: '4px' }}>Based on your personal goal progress ((Days / Goal) × 100).</li>
                                    <li style={{ marginBottom: '4px' }}>Recent streaks add a small bonus.</li>
                                    <li>Using urge support/games adds a bonus.</li>
                                </ul>
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic', margin: '10px 0 0 0' }}>
                                    Reflects steady effort, not perfection. Relapses don't reset this score.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                                <svg width="60" height="60" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#4ade80" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * (consistency.score || 0)) / 100} strokeLinecap="round" transform="rotate(-90 50 50)" />
                                </svg>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                                    {isLoading ? '...' : consistency.score}
                                </div>
                            </div>
                            <div style={{ flex: 1, marginLeft: '16px' }}>
                                <div style={{ fontSize: '14px', color: '#e2e8f0' }}>{(hasData === false ? 'Log activity to build score' : consistency.standing)}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>based on your effort</div>
                            </div>
                        </div>
                    </Card>

                </div>

                {/* Chatbot Section */}
                <div style={{ margin: '40px auto 0', width: '100%', maxWidth: '800px' }}>
                    <Chatbot />
                </div>
            </div>
        </div>
    )
}

// Helper Card Component
function Card({ title, subtitle, children, glowColor = '#ffffff' }) {
    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)', // Lighter grey glass
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)', // Neutral border
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', // Neutral shadow
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            cursor: 'default',
            minHeight: '180px',
            position: 'relative',
            overflow: 'hidden'
        }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
        >
            {/* Abstract background glow - Neutral/White */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${glowColor}15 0%, transparent 70%)`,
                filter: 'blur(40px)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <div style={{ marginBottom: 'auto', position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f7fafc', margin: '0 0 4px 0', fontFamily: 'Inter, sans-serif' }}>
                    {title}
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
                    {subtitle}
                </p>
            </div>
            <div style={{ marginTop: '16px' }}>
                {children}
            </div>
        </div>
    )
}



// Chatbot Component
function Chatbot() {
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const messagesEndRef = React.useRef(null)

    // Load messages from localStorage with 24-hour expiry
    const loadMessages = () => {
        try {
            const stored = localStorage.getItem('ai_chat_messages')
            if (stored) {
                const parsed = JSON.parse(stored)
                const now = Date.now()
                // Filter out messages older than 24 hours
                const filteredMessages = parsed.filter(msg => {
                    const messageAge = now - new Date(msg.timestamp).getTime()
                    return messageAge < 24 * 60 * 60 * 1000 // 24 hours in milliseconds
                })

                if (filteredMessages.length > 0) {
                    return filteredMessages
                }
            }
        } catch (e) {
            console.error('Failed to load chat history:', e)
        }
        // Return default welcome message
        return [{
            id: 1,
            text: "Hi there. I'm here to help you reflect on your patterns. What's on your mind?",
            sender: 'ai',
            timestamp: new Date().toISOString()
        }]
    }

    const [messages, setMessages] = useState(loadMessages)

    // Save messages to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('ai_chat_messages', JSON.stringify(messages))
        } catch (e) {
            console.error('Failed to save chat history:', e)
        }
    }, [messages])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const starterPrompts = [
        "How can I reduce smoking at night?",
        "Why are weekends harder?",
        "I broke my streak, what now?",
        "Any small steps I can try?"
    ]

    const handleSend = async (text) => {
        const userText = text || input
        if (!userText.trim()) return

        // Add user message
        const newUserMsg = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, newUserMsg])
        setInput('')
        setIsTyping(true)

        try {
            const response = await fetchWithAuth('/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: userText
                })
            })

            if (response.ok) {
                const data = await response.json()
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: data.response,
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                }])
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "I'm having trouble connecting right now. Please try again in a moment.",
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                }])
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I couldn't reach the server. Please check your connection and try again.",
                sender: 'ai',
                timestamp: new Date().toISOString()
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const chatContent = (
        <>
            {/* Header */}
            <div style={{
                padding: '24px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f7fafc', margin: 0 }}>Ask for guidance</h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Based on your patterns</p>
                    </div>
                </div>
                {/* Expand/Minimize Button */}
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: '#94a3b8'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.color = '#f7fafc'
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        e.currentTarget.style.color = '#94a3b8'
                    }}
                    title={isFullscreen ? "Minimize" : "Expand fullscreen"}
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>

            {/* Messages Area */}
            <div
                className="chat-messages"
                style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}
            >
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '20px',
                            background: msg.sender === 'user' ? '#334155' : 'rgba(255,255,255,0.05)',
                            color: msg.sender === 'user' ? '#f8fafc' : '#e2e8f0',
                            fontSize: '15px',
                            lineHeight: '1.5',
                            borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
                            borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '20px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div style={{ alignSelf: 'flex-start', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', borderBottomLeftRadius: '4px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                            <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                            <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '24px', paddingTop: '0' }}>
                {/* Chips */}
                {messages.length < 3 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {starterPrompts.map((prompt, idx) => (
                            <button key={idx}
                                onClick={() => handleSend(prompt)}
                                style={{
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    padding: '8px 16px',
                                    borderRadius: '999px',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                    e.currentTarget.style.color = '#f1f5f9'
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = '#94a3b8'
                                }}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask how you can improve..."
                        style={{
                            width: '100%',
                            padding: '16px',
                            paddingRight: '48px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            color: '#f8fafc',
                            fontSize: '15px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    <button
                        onClick={() => handleSend()}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: '#4ade80',
                            border: 'none',
                            color: '#064e3b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'hover 0.2s ease'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Regular Chat Container */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                display: isFullscreen ? 'none' : 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                height: '600px'
            }}>
                {chatContent}
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                    onClick={(e) => {
                        // Close on backdrop click
                        if (e.target === e.currentTarget) setIsFullscreen(false)
                    }}
                    onKeyDown={(e) => {
                        // Close on ESC key
                        if (e.key === 'Escape') setIsFullscreen(false)
                    }}
                    tabIndex={0}
                >
                    <div
                        className="fullscreen-chat"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
                            backdropFilter: 'blur(16px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            width: '100%',
                            maxWidth: '1400px',
                            height: '95vh'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {chatContent}
                    </div>
                </div>
            )}

            <style>
                {`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }

                .group:hover .tooltip-content {
                    display: block !important;
                }

                /* Custom Scrollbar - Applied to both regular and fullscreen chat */
                .chat-messages::-webkit-scrollbar {
                    width: 8px;
                }

                .chat-messages::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    margin: 8px 0;
                }

                .chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(74, 222, 128, 0.25);
                    border-radius: 10px;
                    border: 2px solid rgba(255, 255, 255, 0.03);
                }

                .chat-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(74, 222, 128, 0.4);
                }
                `}
            </style>
        </>
    )
}

export default Insights
