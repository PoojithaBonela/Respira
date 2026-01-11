import React from 'react'
import { Info, HelpCircle, UserCheck, MessageSquare, HeartPulse, Trophy, Shield, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function About() {
    const navigate = useNavigate()

    const cardStyle = {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
    }

    const iconContainerStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '4px',
        position: 'relative',
        zIndex: 1
    }

    const sectionTitleStyle = {
        fontSize: '18px',
        fontWeight: 700,
        color: '#f7fafc',
        margin: '0 0 4px 0',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        zIndex: 1
    }

    const textStyle = {
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#94a3b8',
        margin: 0,
        fontWeight: 500,
        position: 'relative',
        zIndex: 1
    }

    const innerGlowStyle = {
        position: 'absolute',
        top: '-20%',
        right: '-20%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 0,
        pointerEvents: 'none'
    }

    return (
        <div style={{
            minHeight: '100vh',
            padding: '80px 24px 80px',
            backgroundColor: '#0b0e13ff', // Slate 950/Black
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflowX: 'hidden'
        }}>
            {/* Background Gradient matching Insights */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                zIndex: -1
            }} />

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.6s ease forwards;
                    }
                    .card-hover:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
                        border-color: rgba(255, 255, 255, 0.15) !important;
                    }
                    .shine {
                        position: relative;
                        overflow: hidden;
                    }
                    .shine::after {
                        content: "";
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: linear-gradient(
                            to bottom right,
                            rgba(255, 255, 255, 0) 0%,
                            rgba(255, 255, 255, 0) 40%,
                            rgba(255, 255, 255, 0.1) 50%,
                            rgba(255, 255, 255, 0) 60%,
                            rgba(255, 255, 255, 0) 100%
                        );
                        transform: rotate(45deg);
                        transition: all 0.3s;
                        opacity: 0;
                    }
                    .shine:hover::after {
                        opacity: 1;
                        left: 100%;
                        top: 100%;
                        transition: all 0.8s ease-in-out;
                    }
                `}
            </style>

            {/* Back Button Container */}
            <div
                className="animate-fade-in"
                style={{
                    maxWidth: '1200px',
                    width: '100%',
                    marginBottom: '40px'
                }}
            >
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        padding: '10px 20px',
                        backdropFilter: 'blur(10px)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = '#fff'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = '#94a3b8'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
            </div>

            <header
                className="animate-fade-in"
                style={{
                    textAlign: 'center',
                    marginBottom: '64px',
                    maxWidth: '800px'
                }}
            >
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#f7fafc',
                    marginBottom: '16px'
                }}>About RESPIRA</h1>
                <p style={{
                    fontSize: '15px',
                    color: '#cbd5e0',
                    lineHeight: '1.7',
                    fontWeight: 400
                }}>
                    A space for mindful reflection, habit awareness, and gentle progress.
                </p>
            </header>

            {/* Main Grid: 3 columns */}
            <div
                style={{
                    maxWidth: '1200px',
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '24px',
                    marginBottom: '24px'
                }}
            >
                {/* 1. What is RESPIRA? */}
                <div className="animate-fade-in card-hover shine" style={{ ...cardStyle, animationDelay: '0.1s' }}>
                    <div style={innerGlowStyle} />
                    <div style={iconContainerStyle}>
                        <Info size={18} color="#63b3ed" />
                    </div>
                    <h2 style={sectionTitleStyle}>RESPIRA</h2>
                    <p style={textStyle}>
                        RESPIRA is a habit-awareness app designed to help you better understand and gradually reduce smoking through reflection, tracking, and gentle support. Instead of focusing on perfection, RESPIRA encourages small, consistent steps and helps you build awareness around your habits in a calm, non-judgmental way.
                    </p>
                </div>

                {/* 2. How the App Works */}
                <div className="animate-fade-in card-hover shine" style={{ ...cardStyle, animationDelay: '0.2s' }}>
                    <div style={innerGlowStyle} />
                    <div style={iconContainerStyle}>
                        <HelpCircle size={18} color="#48bb78" />
                    </div>
                    <h2 style={sectionTitleStyle}>How the App Works</h2>
                    <p style={textStyle}>
                        You only log activity on days when you smoke. Smoke-free days are tracked automatically, allowing you to see your progress clearly over time. Your activity is visualized across days, weeks, and months so you can notice patterns, streaks, and changes without feeling pressured to log constantly.
                    </p>
                </div>

                {/* 3. Personalization & Insights */}
                <div className="animate-fade-in card-hover shine" style={{ ...cardStyle, animationDelay: '0.3s' }}>
                    <div style={innerGlowStyle} />
                    <div style={iconContainerStyle}>
                        <UserCheck size={18} color="#f6ad55" />
                    </div>
                    <h2 style={sectionTitleStyle}>Personalization & Insights</h2>
                    <p style={textStyle}>
                        RESPIRA personalizes your experience with a quick survey and your ongoing activity in the app. These details help tailor insights so they feel relevant to your habits, goals, and routines. AI is used only to explain patterns and trends in a supportive and easy-to-understand way — not to make medical predictions or diagnoses.
                    </p>
                </div>

                {/* 4. Chatbot Support */}
                <div className="animate-fade-in card-hover shine" style={{ ...cardStyle, animationDelay: '0.4s' }}>
                    <div style={innerGlowStyle} />
                    <div style={iconContainerStyle}>
                        <MessageSquare size={18} color="#f687b3" />
                    </div>
                    <h2 style={sectionTitleStyle}>Chatbot Support</h2>
                    <p style={textStyle}>
                        RESPIRA includes a reflective chatbot that helps you think through your habits, urges, and progress. It responds based on your personal patterns and goals, offering gentle guidance and suggestions rather than instructions or judgment. The focus is on helping you reflect, not telling you what to do.
                    </p>
                </div>

                {/* 5. Urge Support & Focus Tools */}
                <div className="animate-fade-in card-hover shine" style={{ ...cardStyle, animationDelay: '0.5s' }}>
                    <div style={innerGlowStyle} />
                    <div style={iconContainerStyle}>
                        <HeartPulse size={18} color="#f56565" />
                    </div>
                    <h2 style={sectionTitleStyle}>Urge Support & Focus Tools</h2>
                    <p style={textStyle}>
                        When cravings arise, RESPIRA offers simple tools to help you pause, delay, and redirect your attention. These features are designed to support you in the moment by encouraging small distractions or focus activities that can make urges easier to manage.
                    </p>
                </div>

                {/* 6. Rewards & Progress */}
                <div className="animate-fade-in card-hover shine" style={{ ...cardStyle, animationDelay: '0.6s' }}>
                    <div style={innerGlowStyle} />
                    <div style={iconContainerStyle}>
                        <Trophy size={18} color="#ecc94b" />
                    </div>
                    <h2 style={sectionTitleStyle}>Rewards & Progress</h2>
                    <p style={textStyle}>
                        Progress in RESPIRA is measured through consistency and effort over time. You earn badges and rewards for smoke-free streaks, mindful choices, and continued engagement. These milestones are meant to encourage persistence and self-recognition, not pressure or comparison.
                    </p>
                </div>
            </div>

            {/* Centered Privacy Card */}
            <div
                className="animate-fade-in card-hover shine"
                style={{
                    ...cardStyle,
                    maxWidth: '400px',
                    width: '100%',
                    marginBottom: '64px',
                    animationDelay: '0.7s',
                    padding: '24px'
                }}
            >
                <div style={innerGlowStyle} />
                <div style={iconContainerStyle}>
                    <Shield size={18} color="#9f7aea" />
                </div>
                <h2 style={sectionTitleStyle}>Data & Privacy</h2>
                <p style={textStyle}>
                    Your data is private and belongs to you. RESPIRA does not sell, share, or use your information for advertising or third-party purposes. All data is used only to personalize your experience within the app and to generate insights that help you understand your habits better. You remain in full control at all times. You can review, delete, or completely remove your data and account whenever you choose from the settings.
                </p>
            </div>

            {/* Separate Disclaimer Box */}
            <div
                className="animate-fade-in"
                style={{
                    maxWidth: '800px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '32px',
                    textAlign: 'center',
                    animationDelay: '0.8s',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(to right, transparent, rgba(99, 179, 237, 0.5), transparent)'
                }} />

                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(99, 179, 237, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(99, 179, 237, 0.2)'
                }}>
                    <ShieldAlert size={20} color="#63b3ed" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#f7fafc',
                        margin: 0
                    }}>Medical Disclaimer</h3>
                    <p style={{
                        fontSize: '13.5px',
                        color: '#94a3b8',
                        margin: 0,
                        lineHeight: '1.6',
                        maxWidth: '600px',
                        fontStyle: 'italic'
                    }}>
                        RESPIRA is designed to support habit awareness and self-reflection. It is not a medical or diagnostic tool and does not replace professional healthcare. Insights are intended to help you understand patterns, not to diagnose or predict health outcomes.
                    </p>
                </div>
            </div>

            <footer
                className="animate-fade-in"
                style={{
                    marginTop: '80px',
                    paddingBottom: '40px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    animationDelay: '1s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#4fd1c5',
                    fontSize: '14px',
                    fontWeight: 600,
                    opacity: 0.8
                }}>
                    <Sparkles size={16} />
                    <span>Your Journey, Your Pace</span>
                </div>
                <p style={{
                    fontSize: '15px',
                    color: '#64748b',
                    fontWeight: 500,
                    lineHeight: '1.6'
                }}>
                    Progress looks different for everyone. Take small steps, be kind to yourself.
                </p>
            </footer>
        </div>
    )
}
