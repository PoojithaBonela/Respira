import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins } from 'lucide-react'
import { fetchWithAuth } from '../api'

const TILE_COUNT = 19
const PARTICLE_COUNT = 30

function FocusGame() {
    const navigate = useNavigate()

    // Game states
    const [gameState, setGameState] = useState('playing')
    const [score, setScore] = useState(0)
    const [startTime] = useState(Date.now())
    const [endTime, setEndTime] = useState(null)
    const [tiles, setTiles] = useState([])
    const [particles, setParticles] = useState([])
    const intervalRef = useRef(null)

    // Initialize tiles and particles
    useEffect(() => {
        initializeTiles()
        initializeParticles()
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    // Color changing effect every 1.5 seconds
    useEffect(() => {
        if (gameState === 'playing') {
            intervalRef.current = setInterval(() => {
                shuffleTileColors()
            }, 1500)
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current)

            if (gameState === 'completed') {
                // Save game stats locally
                const timeFocused = getTimeFocused()
                // const coinsEarned = getCoinsEarned() // Unused variable
                // const savedStats = localStorage.getItem('gameStats')
                // const stats = savedStats ? JSON.parse(savedStats) : { maxTimeFocused: 0, totalPoints: 0 }

                // const updatedStats = {
                //     maxTimeFocused: Math.max(stats.maxTimeFocused, timeFocused),
                //     totalPoints: stats.totalPoints + score
                // }

                // localStorage.setItem('gameStats', JSON.stringify(updatedStats))

                // Sync with backend
                const syncGameSession = async () => {
                    try {
                        await fetchWithAuth('/game/session', {
                            method: 'POST',
                            body: JSON.stringify({
                                seconds_focused: timeFocused,
                                points_earned: getCoinsEarned(),
                                timestamp: new Date().toISOString()
                            })
                        })
                    } catch (err) {
                        console.error('Failed to sync game session with backend:', err)
                    }
                }
                syncGameSession()
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [gameState])

    const initializeParticles = () => {
        const newParticles = Array(PARTICLE_COUNT).fill(null).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 15 + 10,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.3 + 0.1
        }))
        setParticles(newParticles)
    }

    const initializeTiles = () => {
        const newTiles = Array(TILE_COUNT).fill(null).map((_, index) => ({
            id: index,
            state: 'neutral',
            clicked: false
        }))
        assignColors(newTiles)
        setTiles(newTiles)
    }

    const assignColors = (tilesToUpdate) => {
        let availableIndices = tilesToUpdate
            .map((t, i) => (!t.clicked ? i : -1))
            .filter(i => i !== -1)

        if (availableIndices.length < 6) {
            tilesToUpdate.forEach(t => {
                t.clicked = false
                t.state = 'neutral'
            })
            availableIndices = tilesToUpdate.map((_, i) => i)
        } else {
            tilesToUpdate.forEach(t => {
                if (!t.clicked) t.state = 'neutral'
            })
        }

        const shuffled = availableIndices.sort(() => Math.random() - 0.5)
        const greenCount = Math.min(shuffled.length, Math.floor(Math.random() * 3) + 3)
        shuffled.slice(0, greenCount).forEach(i => {
            tilesToUpdate[i].state = 'green'
        })

        const yellowCount = Math.min(3, shuffled.length - greenCount)
        shuffled.slice(greenCount, greenCount + yellowCount).forEach(i => {
            tilesToUpdate[i].state = 'yellow'
        })

        const redCount = Math.min(2, shuffled.length - greenCount - yellowCount)
        shuffled.slice(greenCount + yellowCount, greenCount + yellowCount + redCount).forEach(i => {
            tilesToUpdate[i].state = 'red'
        })
    }

    const shuffleTileColors = () => {
        setTiles(prev => {
            const newTiles = prev.map(t => ({ ...t }))
            assignColors(newTiles)
            return newTiles
        })
    }

    const handleTileClick = (tileId) => {
        if (gameState !== 'playing') return

        const tile = tiles.find(t => t.id === tileId)
        if (!tile || tile.clicked) return

        if (tile.state === 'green') {
            setScore(prev => prev + 1)
            setTiles(prev => prev.map(t =>
                t.id === tileId ? { ...t, clicked: true } : t
            ))
        } else if (tile.state === 'red' || tile.state === 'yellow') {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setEndTime(Date.now())
            setGameState('completed')
        }
    }

    const getTimeFocused = () => {
        const end = endTime || Date.now()
        return Math.floor((end - startTime) / 1000)
    }

    const getCoinsEarned = () => {
        return 10 + score
    }

    const resetGame = () => {
        setGameState('playing')
        setScore(0)
        setEndTime(null)
        initializeTiles()
    }

    // --- Styles ---
    const pageStyle = {
        minHeight: '100vh',
        backgroundColor: '#0b0e13ff',
        color: '#f7fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: 'relative',
        overflow: 'hidden'
    }

    const backgroundGradientStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        zIndex: -2
    }

    const mainContentStyle = {
        paddingTop: '60px',
        paddingBottom: '60px',
        maxWidth: '900px',
        margin: '0 auto',
        paddingLeft: '24px',
        paddingRight: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
    }

    const getTileStyle = (tile) => {
        let bgColor = 'rgba(255, 255, 255, 0.06)'
        let borderColor = 'rgba(255, 255, 255, 0.12)'
        let boxShadow = 'inset 0 0 20px rgba(255,255,255,0.03)'

        if (tile.clicked) {
            bgColor = 'rgba(16, 185, 129, 0.1)'
            borderColor = 'rgba(16, 185, 129, 0.2)'
            boxShadow = 'inset 0 0 15px rgba(16, 185, 129, 0.1)'
        } else {
            switch (tile.state) {
                case 'green':
                    bgColor = 'rgba(16, 185, 129, 0.25)'
                    borderColor = 'rgba(16, 185, 129, 0.6)'
                    boxShadow = '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.2)'
                    break
                case 'yellow':
                    bgColor = 'rgba(251, 191, 36, 0.2)'
                    borderColor = 'rgba(251, 191, 36, 0.5)'
                    boxShadow = '0 0 25px rgba(251, 191, 36, 0.4), 0 0 50px rgba(251, 191, 36, 0.2), inset 0 0 15px rgba(251, 191, 36, 0.15)'
                    break
                case 'red':
                    bgColor = 'rgba(239, 68, 68, 0.2)'
                    borderColor = 'rgba(239, 68, 68, 0.5)'
                    boxShadow = '0 0 25px rgba(239, 68, 68, 0.4), 0 0 50px rgba(239, 68, 68, 0.2), inset 0 0 15px rgba(239, 68, 68, 0.15)'
                    break
                default:
                    break
            }
        }

        return {
            width: '70px',
            height: '80px',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: bgColor,
            border: `2px solid ${borderColor}`,
            boxShadow: boxShadow,
            cursor: tile.clicked ? 'default' : 'pointer',
            transition: 'all 0.4s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: tile.clicked ? 0.4 : 1,
            transform: tile.clicked ? 'scale(0.9)' : 'scale(1)'
        }
    }

    const cardStyle = {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 15px 40px rgba(0,0,0,0.3), 0 0 30px rgba(16, 185, 129, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: '380px'
    }

    // Particle animation keyframes
    const particleStyles = `
        @keyframes fall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(110vh) rotate(360deg);
                opacity: 0;
            }
        }
    `

    // Render particles
    const renderParticles = () => (
        <>
            <style>{particleStyles}</style>
            {particles.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'fixed',
                        left: `${p.x}%`,
                        top: '-20px',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: `rgba(255, 255, 255, ${p.opacity + 0.2})`,
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        zIndex: 1,
                        animation: `fall ${p.speed}s linear infinite`,
                        animationDelay: `${p.delay}s`,
                        boxShadow: `0 0 ${p.size * 3}px rgba(255, 255, 255, ${p.opacity})`
                    }}
                />
            ))}
        </>
    )

    // Render game grid
    const renderGameGrid = () => (
        <div style={{ textAlign: 'center' }}>
            <h2 style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#10b981',
                marginBottom: '12px',
                fontWeight: 700
            }}>Focus Game</h2>
            <h1 style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#fff',
                marginBottom: '16px',
                fontFamily: "'Inter', sans-serif"
            }}>Tap only the green tiles</h1>
            <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '16px' }}>
                Score: <span style={{ color: '#10b981', fontWeight: 700 }}>{score}</span>
            </p>

            {/* Hexagonal Grid - 19 tiles */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
            }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {tiles.slice(0, 3).map(tile => (
                        <div key={tile.id} style={getTileStyle(tile)} onClick={() => handleTileClick(tile.id)} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '-18px' }}>
                    {tiles.slice(3, 7).map(tile => (
                        <div key={tile.id} style={getTileStyle(tile)} onClick={() => handleTileClick(tile.id)} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '-18px' }}>
                    {tiles.slice(7, 12).map(tile => (
                        <div key={tile.id} style={getTileStyle(tile)} onClick={() => handleTileClick(tile.id)} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '-18px' }}>
                    {tiles.slice(12, 16).map(tile => (
                        <div key={tile.id} style={getTileStyle(tile)} onClick={() => handleTileClick(tile.id)} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '-18px' }}>
                    {tiles.slice(16, 19).map(tile => (
                        <div key={tile.id} style={getTileStyle(tile)} onClick={() => handleTileClick(tile.id)} />
                    ))}
                </div>
            </div>

            <button
                style={{
                    marginTop: '48px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#94a3b8',
                    padding: '12px 28px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.color = '#fff'
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = '#94a3b8'
                }}
                onClick={() => navigate('/urge')}
            >
                Exit Game
            </button>
        </div>
    )

    // Render completion card
    const renderCompletionCard = () => (
        <div style={cardStyle}>
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <h1 style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: '24px',
                    fontFamily: "'Inter', sans-serif"
                }}>Nice pause.</h1>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '32px',
                    marginBottom: '24px'
                }}>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>{score}</div>
                        <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Correct taps</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#63b3ed' }}>{getTimeFocused()}s</div>
                        <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Time focused</div>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '18px',
                    marginBottom: '24px',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        <Coins size={18} color="#facc15" />
                        <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Coins earned
                        </span>
                    </div>

                    <div style={{ fontSize: '13px', color: '#cbd5e0', marginBottom: '6px' }}>
                        +10 coins for completing
                    </div>
                    <div style={{ fontSize: '13px', color: '#cbd5e0', marginBottom: '12px' }}>
                        +{score} coin{score !== 1 ? 's' : ''} per correct tap
                    </div>

                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#facc15' }}>
                        Total: {getCoinsEarned()} coins
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <button
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 40px',
                            borderRadius: '999px',
                            fontSize: '15px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={() => navigate('/urge')}
                    >
                        Done
                    </button>

                    <button
                        style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            border: 'none',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                        onClick={resetGame}
                    >
                        Play again
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div style={pageStyle}>
            <div style={backgroundGradientStyle} />
            {renderParticles()}

            <div style={mainContentStyle}>
                {gameState === 'playing' && renderGameGrid()}
                {gameState === 'completed' && renderCompletionCard()}
            </div>
        </div>
    )
}

export default FocusGame
