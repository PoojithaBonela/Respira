import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    const token = localStorage.getItem('authToken')
    // Only redirect to profile if authenticated AND NOT a new user flow
    if (token && !location.state?.newUser) {
      navigate('/profile')
    }
  }, [navigate, location])
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        color: '#f9fafb',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      >
        <source src="/video1.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for Video readability */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(11, 14, 19, 0.4), rgba(11, 14, 19, 0.8))',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div
        style={{
          position: 'absolute',
          top: '1.25rem',
          left: '1.5rem',
          fontSize: '1.8rem',
          fontWeight: 900,
          letterSpacing: '0.2em',
          fontFamily: "'Inter', sans-serif",
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
          zIndex: 10
        }}
      >
        Respira
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'transparent',
        }}
      >
        <div
          style={{
            zIndex: 10,
            width: '100%',
            maxWidth: 360,
            padding: '2.2rem 2rem',
            borderRadius: '1.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            transform: 'translateY(10px)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                marginBottom: '0.75rem',
                color: '#fff',
                lineHeight: '1.2',
              }}
            >
              Welcome to Respira
            </h1>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                marginBottom: '0.8rem',
                color: '#e2e8f0',
                lineHeight: '1.4',
              }}
            >
              Let's understand your smoking habits
            </h2>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#94a3b8',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              Your answers help us personalize your journey towards a smoke-free life.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => navigate('/questionnaire')}
              style={{
                width: '100%',
                padding: '0.75rem 2rem',
                borderRadius: '1rem',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.4)';
              }}
            >
              Let's Start
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
