import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Activity, Trophy, HeartPulse, User } from 'lucide-react'
import ProfileDrawer from './ProfileDrawer'

export default function AppLayout() {
    const navigate = useNavigate()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Shared button styles
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
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    }

    return (
        <div style={{ position: 'relative', width: '100%' }}>

            {/* Global Header */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 1.8rem',
                zIndex: 50,
                pointerEvents: 'none' // Allow clicks to pass through to canvas if needed, but children need events
            }}>

                {/* Logo & Nav - pointer events auto */}
                <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
                    <div
                        style={{
                            fontSize: '2.1rem',
                            fontWeight: 800,
                            letterSpacing: '0.16em',
                            fontFamily: "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                            textTransform: 'uppercase',
                            color: '#f7fafc',
                            cursor: 'pointer',
                            marginRight: '80px', // Move buttons to the right
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            textShadow: '0 0 0 rgba(255,255,255,0)'
                        }}
                        onClick={() => navigate('/profile')}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                            e.currentTarget.style.textShadow = '0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,255,255,0.2)'
                            e.currentTarget.style.letterSpacing = '0.18em'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.textShadow = '0 0 0 rgba(255,255,255,0)'
                            e.currentTarget.style.letterSpacing = '0.16em'
                        }}
                    >
                        Respira
                    </div>

                    <div style={{ display: 'flex', gap: '40px' }}> {/* Grouped buttons with even spacing */}
                        <button
                            type="button"
                            onClick={() => navigate('/calendar')}
                            style={navButtonStyle}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <CalendarIcon size={14} />
                            Calendar
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/insights')}
                            style={navButtonStyle}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <Activity size={14} color="#4ade80" />
                            Insights
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/rewards')}
                            style={navButtonStyle}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(250, 204, 21, 0.2)'
                                e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.4)'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            <Trophy size={14} color="#facc15" />
                            Rewards
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/urge')}
                            style={{
                                ...navButtonStyle,
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#f87171'
                            }}
                        >
                            <HeartPulse size={14} />
                            Urge Support
                        </button>
                    </div>
                </div>

                {/* Profile Section - pointer events auto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
                    <div
                        onClick={() => setIsDrawerOpen(true)}
                        style={{
                            width: '46px', // Increased from 40px
                            height: '46px',
                            borderRadius: '50%',
                            background: 'linear-gradient(145deg, #2d3748, #1a202c)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)'
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <User size={22} color="#f7fafc" />
                    </div>
                </div>
            </div>

            <ProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

            {/* Content */}
            <Outlet />
        </div>
    )
}
