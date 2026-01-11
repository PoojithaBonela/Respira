import React, { useState, useEffect } from 'react'
import { fetchWithAuth } from '../api'

function LogCigaretteModal({ isOpen, onClose, onSaveSuccess, initialDate, initialCount = 0, initialTriggers = [], hasLoggedAlready = false }) {
    const [cigarettesToday, setCigarettesToday] = useState(initialCount)
    const [selectedTriggers, setSelectedTriggers] = useState([])
    const triggerOptions = ['Stress', 'Boredom', 'After meals', 'Late night', 'With friends', 'Just habit']

    useEffect(() => {
        setCigarettesToday(initialCount)
        setSelectedTriggers([]) // Always start empty to allow adding NEW triggers
    }, [initialCount, isOpen])

    const toggleTrigger = (label) => {
        setSelectedTriggers((prev) => {
            if (prev.includes(label)) return prev.filter((t) => t !== label)
            return [...prev, label]
        })
    }

    const handleSave = async () => {
        try {
            const logDate = initialDate || new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

            // Combine history with new selections
            const finalTriggers = [...initialTriggers, ...selectedTriggers]

            const response = await fetchWithAuth('/log', {
                method: 'POST',
                body: JSON.stringify({
                    date: logDate,
                    cigarettes: cigarettesToday,
                    triggers: finalTriggers
                })
            })

            if (response.ok) {
                if (onSaveSuccess) onSaveSuccess()
                onClose()
            } else {
                console.error("Failed to save log")
            }
        } catch (error) {
            console.error("Error saving log:", error)
        }
    }

    if (!isOpen) return null

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                zIndex: 1000,
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
                    padding: '32px',
                    textAlign: 'center',
                    position: 'relative',
                    color: '#f7fafc'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ marginBottom: '32px', position: 'relative' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#a0aec0',
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
                            e.target.style.color = '#fff'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                            e.target.style.color = '#a0aec0'
                        }}
                    >
                        ×
                    </button>
                    <h2 style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        margin: 0,
                        background: 'linear-gradient(to right, #fff, #cbd5e0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: 'Inter, -apple-system, sans-serif'
                    }}>
                        Log smoking {initialDate ? `for ${initialDate}` : "today"}
                    </h2>
                </div>

                {/* Cigarette Counter */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#94a3b8',
                        marginBottom: '16px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Cigarettes Smoked
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px'
                    }}>
                        <button
                            type="button"
                            onClick={() => setCigarettesToday((v) => {
                                const min = (hasLoggedAlready && initialCount > 0) ? 1 : 0
                                return Math.max(min, v - 1)
                            })}
                            style={counterButtonStyle}
                            onMouseOver={buttonHoverIn}
                            onMouseOut={buttonHoverOut}
                        >
                            -
                        </button>

                        <div style={{
                            minWidth: '80px',
                            fontSize: '48px',
                            fontWeight: 800,
                            fontFamily: 'Inter, sans-serif',
                            color: '#fff',
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            textAlign: 'center'
                        }}>
                            {cigarettesToday}
                        </div>

                        <button
                            type="button"
                            onClick={() => setCigarettesToday((v) => v + 1)}
                            style={counterButtonStyle}
                            onMouseOver={buttonHoverIn}
                            onMouseOut={buttonHoverOut}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Triggers */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#94a3b8',
                        marginBottom: '16px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Triggers (Optional)
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px'
                    }}>
                        {triggerOptions.map((label) => {
                            const active = selectedTriggers.includes(label)
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => toggleTrigger(label)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border: active
                                            ? '1px solid rgba(34, 197, 94, 0.5)'
                                            : '1px solid rgba(255, 255, 255, 0.08)',
                                        backgroundColor: active
                                            ? 'rgba(34, 197, 94, 0.15)'
                                            : 'rgba(255, 255, 255, 0.03)',
                                        color: active ? '#4ade80' : '#cbd5e0',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                    onMouseOver={(e) => {
                                        if (!active) e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                                    }}
                                    onMouseOut={(e) => {
                                        if (!active) e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
                                    }}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '16px'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={cancelButtonStyle}
                        onMouseOver={(e) => e.target.style.color = '#fff'}
                        onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        style={saveButtonStyle}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-1px)'
                            e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)'
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        Save Log
                    </button>
                </div>
            </div>
        </div>
    )
}

// Internal styles/helpers
const counterButtonStyle = {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#f7fafc',
    fontSize: '28px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const cancelButtonStyle = {
    flex: 1,
    height: '48px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    fontFamily: 'Inter, sans-serif'
}

const saveButtonStyle = {
    flex: 2,
    height: '48px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'Inter, sans-serif'
}

const buttonHoverIn = (e) => {
    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
    e.target.style.transform = 'scale(1.05)'
}

const buttonHoverOut = (e) => {
    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
    e.target.style.transform = 'scale(1)'
}

export default LogCigaretteModal
