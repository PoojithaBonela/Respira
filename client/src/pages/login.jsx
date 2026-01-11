import React from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'

import {
  ClipboardList,
  BarChart3,
  Sprout,
  Target,
  MessageCircle,
  Bell,
  HeartPulse,
  Moon,
  Coins
} from 'lucide-react'

const FEATURES = [
  {
    icon: <ClipboardList size={32} color="#22c55e" />,
    title: 'Track Habits',
    body: 'Easily note when you smoke, how you feel, and what triggered it — all in a few taps.',
  },
  {
    icon: <BarChart3 size={32} color="#22c55e" />,
    title: 'See Progress',
    body: 'Simple charts help you understand your smoking patterns and notice improvement over time.',
  },
  {
    icon: <Sprout size={32} color="#22c55e" />,
    title: 'Cravings Support',
    body: 'The app learns your tough moments and gently supports you when cravings usually hit.',
  },
  {
    icon: <Target size={32} color="#22c55e" />,
    title: 'Quit Your Way',
    body: 'Set small, realistic goals and follow a flexible plan that adjusts as you improve.',
  },
  {
    icon: <MessageCircle size={32} color="#22c55e" />,
    title: 'Daily Insights',
    body: 'Receive calm, encouraging messages that explain your habits without guilt or pressure.',
  },
  {
    icon: <Bell size={32} color="#22c55e" />,
    title: 'Gentle Nudges',
    body: 'Helpful reminders to log and stay mindful — never overwhelming.',
  },
  {
    icon: <HeartPulse size={32} color="#22c55e" />,
    title: 'Health Impact',
    body: 'Visual explanations show how your body recovers, keeping you motivated.',
  },
  {
    icon: <Moon size={32} color="#22c55e" />,
    title: 'Stress-Free',
    body: 'A clean, soothing design helps you focus and feel in control during your journey.',
  },
  {
    icon: <Coins size={32} color="#22c55e" />,
    title: 'Save Money',
    body: 'Track exactly how much you save by not smoking and plan how to spend those rewards.',
  },
]

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
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
    transform: skewX(-25deg);
    transition: none;
    pointer-events: none;
  }
  .shine-card:hover::before {
    animation: shine 1.5s infinite;
  }
`

function Login() {
  const [mode, setMode] = React.useState('login')
  const [showPassword, setShowPassword] = React.useState(false)
  const isSignup = mode === 'signup'
  const navigate = useNavigate()

  React.useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      navigate('/profile')
    }
  }, [navigate])

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')

  // Reset Password State
  const [token, setToken] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [showNewPassword, setShowNewPassword] = React.useState(false)

  const [error, setError] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleForgot = async () => {
    setError('')
    setMessage('')
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || "Failed to send reset email")
      } else {
        setMessage(data.message || "Reset link sent! Please check your email.")
        // Auto-switch to reset mode
        setTimeout(() => {
          setMode('reset')
          setMessage('Enter the token from your email below.')
        }, 1500)
      }
    } catch (err) {
      setError("Network or server error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setError('')
    setMessage('')
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || "Failed to reset password")
      } else {
        setMessage("Password updated! Logging you in...")
        setTimeout(() => {
          setMode('login')
          setPassword('')
          setMessage('Password updated successfully. Please log in.')
        }, 2000)
      }
    } catch (err) {
      setError("Network or server error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = async () => {
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const endpoint = isSignup ? `${API_BASE_URL}/auth/signup` : `${API_BASE_URL}/auth/login`
      const payload = isSignup
        ? { email, password, name: name || email.split('@')[0] }
        : { email, password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.detail === "Email already registered") {
          setError("Account exists. Please log in.")
        } else if (response.status === 404 && data.detail === "Account does not exist") {
          setError("Account does not exist. Redirecting to signup...")
          setTimeout(() => {
            setMode('signup')
            setError('')
          }, 1500)
        } else {
          setError(data.detail || "Authentication failed")
        }
        return
      }

      // Save user to localStorage (only for login, signup doesn't return user object)
      if (!isSignup && data.user) {
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userEmail', data.user.email)
        localStorage.setItem('userName', data.user.name)
      } else if (isSignup) {
        // For signup, we receive token now
        if (data.token) localStorage.setItem('authToken', data.token)
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userName', email.split('@')[0])
      }

      if (isSignup) {
        navigate('/landing', { state: { newUser: true } })
      } else {
        navigate('/profile')
      }

    } catch (err) {
      setError("Network or server error")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleCallback = async (response) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential, is_signup: isSignup }),
      })
      const data = await res.json()

      if (!res.ok) {
        // Strict Login Check: If account does not exist, redirect to signup
        if (res.status === 404 && data.detail === "Account does not exist") {
          setError("Account does not exist. Redirecting to signup...")
          setTimeout(() => {
            setMode('signup')
            setError('')
          }, 1500)
        } else {
          setError(data.detail || "Google login failed")
        }
      } else {
        // Save user to localStorage
        if (data.user) {
          localStorage.setItem('authToken', data.token)
          localStorage.setItem('userEmail', data.user.email)
          localStorage.setItem('userName', data.user.name)
        }

        // Redirect based on whether user is new or existing
        if (data.is_new_user) {
          navigate('/landing', { state: { newUser: true } })  // New user -> Welcome/Questionnaire
        } else {
          navigate('/profile')  // Existing user -> Dashboard
        }
      }
    } catch (err) {
      setError("Google login network error")
    } finally {
      setIsLoading(false)
    }
  }
  React.useEffect(() => {
    const renderGoogleButton = () => {
      if (window.google?.accounts) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

        console.log("Google Auth Debug: Loaded Client ID:", clientId) // DEBUG LOG

        if (!clientId) {
          console.warn("Missing VITE_GOOGLE_CLIENT_ID in client .env")
          return false
        }

        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
            cancel_on_tap_outside: false,
          })
          console.log("Google Auth Debug: Initialized") // DEBUG LOG
        } catch (e) {
          console.error("Google Auth Debug: Init Error", e)
        }

        const btnDiv = document.getElementById('google-btn-container')
        if (btnDiv) {
          btnDiv.innerHTML = ''
          try {
            window.google.accounts.id.renderButton(
              btnDiv,
              {
                theme: 'filled_black',
                size: 'large',
                width: 350,
                shape: 'pill',
                text: isSignup ? 'signup_with' : 'signin_with'
              }
            )
            console.log("Google Auth Debug: Button Rendered") // DEBUG LOG
          } catch (e) {
            console.error("Google Auth Debug: Render Error", e)
          }
        }
        return true
      }
      // console.log("Google Auth Debug: window.google not ready yet") // Silenced to prevent spam
      return false
    }

    if (!renderGoogleButton()) {
      const timer = setInterval(() => {
        if (renderGoogleButton()) {
          clearInterval(timer)
        }
      }, 100)

      const timeout = setTimeout(() => clearInterval(timer), 5000)
      return () => { clearInterval(timer); clearTimeout(timeout) }
    }
  }, [isSignup])

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        color: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

      <style>{shineStyles}</style>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'transparent',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '2rem',
            fontSize: '2.2rem',
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
            zIndex: 10,
            width: '100%',
            maxWidth: 400,
            padding: '2.5rem',
            borderRadius: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            transform: 'translateY(20px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                padding: '0.35rem',
                borderRadius: '1.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '1.2rem',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: isSignup
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'transparent',
                  color: isSignup ? '#fff' : '#94a3b8',
                  transition: 'all 0.3s ease',
                  boxShadow: isSignup ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none'
                }}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '1.2rem',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: !isSignup
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'transparent',
                  color: !isSignup ? '#fff' : '#94a3b8',
                  transition: 'all 0.3s ease',
                  boxShadow: !isSignup ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none'
                }}
              >
                Log in
              </button>
            </div>
          </div>
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
            onSubmit={(e) => {
              e.preventDefault()
              if (mode === 'forgot') handleForgot()
              else if (mode === 'reset') handleReset()
              else handleAuth()
            }}
          >
            {/* Error & Message Alerts */}
            {error && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <>
                {isSignup && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label htmlFor="name" style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#22c55e'
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label htmlFor="email" style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#22c55e'
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label htmlFor="password" style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                    Password
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0 1rem',
                      transition: 'all 0.2s ease',
                    }}
                    onFocusCapture={(e) => {
                      e.currentTarget.style.borderColor = '#22c55e'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onBlurCapture={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        flex: 1,
                        padding: '0.75rem 0',
                        border: 'none',
                        background: 'transparent',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '1rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{
                        marginLeft: '0.5rem',
                        border: 'none',
                        background: 'transparent',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.color = '#fff'}
                      onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {!isSignup && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                      onMouseOver={(e) => e.target.style.color = '#fff'}
                      onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </>
            )}

            {mode === 'forgot' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#fff', fontWeight: 600 }}>Reset Password</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label htmlFor="email" style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>
              </>
            )}

            {mode === 'reset' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#fff', fontWeight: 600 }}>Set New Password</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>Reset Token</label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste token from email"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '1rem',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>New Password</label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0 1rem',
                      transition: 'all 0.2s ease',
                    }}
                    onFocusCapture={(e) => {
                      e.currentTarget.style.borderColor = '#22c55e'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onBlurCapture={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New strong password"
                      style={{
                        flex: 1,
                        padding: '0.75rem 0',
                        border: 'none',
                        background: 'transparent',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '1rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      style={{
                        marginLeft: '0.5rem',
                        border: 'none',
                        background: 'transparent',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.color = '#fff'}
                      onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                    >
                      {showNewPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '1rem',
                padding: '0.8rem',
                borderRadius: '1rem',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.5)'
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.4)'
                }
              }}
            >
              {isLoading ? 'Processing...' : (
                mode === 'forgot' ? 'Send Reset Link' :
                  mode === 'reset' ? 'Update Password' :
                    isSignup ? 'Create Account' : 'Welcome Back'
              )}
            </button>

            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                  setMessage('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Back to Login
              </button>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    margin: '1.5rem 0',
                    fontSize: '0.8rem',
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <span>or</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <div
                  id="google-btn-container"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '0.5rem',
                    minHeight: '44px'
                  }}
                >
                  {/* Google Button will be rendered here by the script */}
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          width: '100%',
          maxWidth: 1040,
          margin: '0 auto',
          padding: '4rem 1.5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            width: '100%',
          }}
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="shine-card"
              style={{
                padding: '2.5rem 2rem',
                borderRadius: '2rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                backdropFilter: 'blur(16px)',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)'
                e.currentTarget.style.transform = 'translateY(-5px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  width: 'fit-content',
                  padding: '16px',
                  borderRadius: '1.2rem',
                }}
              >
                {feature.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: '#fff',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: '#94a3b8',
                    lineHeight: '1.6',
                    margin: 0,
                  }}
                >
                  {feature.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontWeight: 600,
              fontSize: '1.1rem',
              background: 'linear-gradient(to right, #22c55e, #16a34a)',
              color: '#020617',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
