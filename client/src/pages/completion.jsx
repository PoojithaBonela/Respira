import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'

function Completion() {
  const [showSpark, setShowSpark] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Submit onboarding data
    const submitProfile = async () => {
      const answers = JSON.parse(localStorage.getItem('onboarding_answers') || '{}')
      const token = localStorage.getItem('authToken')

      if (!token) return

      const profilePayload = {
        age_range: answers['questionnaire'] || 'Unknown',
        gender: answers['gender'] || 'Unknown',
        smoking_frequency: answers['smoking-frequency'] || 'Unknown',
        smoking_duration: answers['smoking-duration'] || 'Unknown',
        triggers: answers['smoking-triggers'] || [],
        reasons: answers['smoking-reasons'] || [],
        stress_smoking: answers['stress-smoking'] || 'Unknown',
        quit_attempts: answers['quit-attempts'] || 'Unknown',
        current_goal: answers['current-goal'] || 'Unknown'
      }

      try {
        // ... (in component)
        await fetch(`${API_BASE_URL}/user/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profilePayload)
        })
        localStorage.removeItem('onboarding_answers')
      } catch (e) {
        console.error("Failed to save profile", e)
      }
    }

    submitProfile()

    // Show message after a short delay
    const messageTimer = setTimeout(() => {
      setShowMessage(true)
    }, 500)

    // Show spark animation after message appears
    const sparkTimer = setTimeout(() => {
      setShowSpark(true)
    }, 2000)

    // Navigate to profile after animation completes
    const navigationTimer = setTimeout(() => {
      navigate('/profile')
    }, 5000)

    return () => {
      clearTimeout(messageTimer)
      clearTimeout(sparkTimer)
      clearTimeout(navigationTimer)
    }
  }, [navigate])

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        color: '#f9fafb',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
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
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '800px',
        }}
      >
        {/* Message */}
        <div
          style={{
            opacity: showMessage ? 1 : 0,
            transform: showMessage ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 1s ease-out',
            marginBottom: '2.5rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.7rem',
              fontWeight: 800,
              color: '#fff',
              lineHeight: '1.3',
              margin: 0,
              textShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            Thanks! Let's start personalizing insights and predictions for you.
          </h2>
        </div>

        {/* Animation Container */}
        <div style={{ position: 'relative', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Progress Line */}
          <div
            style={{
              width: showSpark ? '220px' : '0px',
              height: '3px',
              background: 'linear-gradient(to right, rgba(255,255,255,0.1), #fff, rgba(255,255,255,0.1))',
              borderRadius: '99px',
              opacity: showSpark ? 1 : 0,
              transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out',
              position: 'relative',
              boxShadow: '0 0 20px rgba(255,255,255,0.2)'
            }}
          >
            {/* Spark animation */}
            {showSpark && (
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '0',
                  width: '15px',
                  height: '15px',
                  backgroundColor: '#4ade80',
                  borderRadius: '50%',
                  boxShadow: '0 0 20px #22c55e, 0 0 40px #22c55e',
                  animation: 'sparkMove 2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                }}
              />
            )}
          </div>

          <p style={{
            marginTop: '1.5rem',
            color: '#94a3b8',
            fontSize: '1rem',
            opacity: showSpark ? 1 : 0,
            transition: 'opacity 1s ease-in'
          }}>
            Preparing your dashboard...
          </p>
        </div>

        {/* Global CSS for spark animation */}
        <style>{`
          @keyframes sparkMove {
            0% {
              left: 0;
              opacity: 1;
              transform: scale(1);
            }
            100% {
              left: 205px;
              opacity: 0;
              transform: scale(0.5);
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export default Completion
