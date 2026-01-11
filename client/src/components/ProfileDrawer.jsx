import React, { useState, useEffect, useRef } from 'react'
import { User, Mail, Edit2, LogOut, Moon, Sun, Bell, BellOff, Trash2, Info, Shield, Check, Coins, Target, ChevronRight, ChevronLeft, ChevronDown, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../api' // Remove API_BASE_URL import if not used elsewhere, or keep if needed for constructing full URL in some edge case but fetchWithAuth handles it.
// Actually fetchWithAuth handles base URL.

function ProfileDrawer({ isOpen, onClose }) {
    const navigate = useNavigate()
    const drawerRef = useRef(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, onClose])

    const [notificationsEnabled, setNotificationsEnabled] = useState(false)
    const [theme, setTheme] = useState('dark')

    // State for modals and inputs
    const [isCostModalOpen, setIsCostModalOpen] = useState(false)
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
    const [cost, setCost] = useState(() => localStorage.getItem('cigaretteCost') || '')
    const [currency, setCurrency] = useState(() => localStorage.getItem('cigaretteCurrency') || 'INR')
    const [selectedGoal, setSelectedGoal] = useState('')
    const [isDurationPickerOpen, setIsDurationPickerOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    // Account State
    const [isEditAccountOpen, setIsEditAccountOpen] = useState(false)
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
    const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'User Name')
    const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || 'user@example.com')
    const [deleteConfirmText, setDeleteConfirmText] = useState('')

    // Fetch user profile on open
    useEffect(() => {
        if (isOpen) {
            // Fetch user profile
            fetchWithAuth('/user/profile')
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch profile")
                    return res.json()
                })
                .then(data => {
                    setUserName(data.name || 'User Name')
                    setUserEmail(data.email || 'user@example.com')
                    // Also update localStorage to keep it fresh
                    if (data.name) localStorage.setItem('userName', data.name)
                    if (data.email) localStorage.setItem('userEmail', data.email)
                })
                .catch(err => console.error("Error fetching user profile:", err))

            // Fetch account settings
            fetchWithAuth('/user/settings')
                .then(res => res.json())
                .then(data => {
                    // Convert days back to duration string if possible
                    const days = data.smoke_free_goal
                    if (days === 7) setSelectedGoal('1 week')
                    else if (days === 14) setSelectedGoal('2 weeks')
                    else if (days === 30) setSelectedGoal('1 month')
                    else if (days > 30) setSelectedGoal(`${Math.round(days / 30)} months`)

                    if (data.cigarette_cost) setCost(data.cigarette_cost)
                    if (data.currency) setCurrency(data.currency)
                    if (data.notifications_enabled !== undefined) setNotificationsEnabled(data.notifications_enabled)

                    // START: Migration / Sync logic (Simple)
                    // If backend has no settings but we have local, sync it up
                    // This is a basic "sync on view" which is safe enough for now
                    if ((!data.cigarette_cost && localStorage.getItem('cigaretteCost')) || (!data.currency && localStorage.getItem('cigaretteCurrency'))) {
                        // We could trigger a save here, but let's just populate the state so user sees it and can save if they want? 
                        // Better: if backend empty, use local
                        if (!data.cigarette_cost) setCost(localStorage.getItem('cigaretteCost') || '')
                        if (!data.currency) setCurrency(localStorage.getItem('cigaretteCurrency') || 'INR')
                    }
                })
                .catch(err => console.error("Error fetching user settings:", err))
        }
    }, [isOpen])

    const handleSaveGoal = async () => {
        // Removed local email check, relying on token in fetchWithAuth


        let days = 30
        if (selectedGoal === '1 week') days = 7
        else if (selectedGoal === '2 weeks') days = 14
        else if (selectedGoal === '1 month') days = 30
        else if (selectedGoal.includes('months')) {
            days = parseInt(selectedGoal.split(' ')[0]) * 30
        }

        try {
            const response = await fetchWithAuth('/user/goal', {
                method: 'POST',
                body: JSON.stringify({ smoke_free_goal: days })
            })
            if (response.ok) {
                setIsGoalModalOpen(false)
            }
        } catch (err) {
            console.error("Error saving goal:", err)
        }
    }

    const handleSaveProfile = async () => {
        // Removed local email check


        try {
            const response = await fetchWithAuth('/user/profile', {
                method: 'PUT',
                body: JSON.stringify({ name: userName })
            })
            if (response.ok) {
                setIsEditAccountOpen(false)
                // Update local storage
                localStorage.setItem('userName', userName)
            }
        } catch (err) {
            console.error("Error saving profile:", err)
        }
    }

    const handleToggleNotifications = async (enabled) => {
        setNotificationsEnabled(enabled)
        try {
            await fetchWithAuth('/user/notifications', {
                method: 'PUT',
                body: JSON.stringify({ enabled })
            })
        } catch (err) {
            console.error("Error updating notifications:", err)
            // Rollback on error
            setNotificationsEnabled(!enabled)
        }
    }



    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s ease',
                    zIndex: 998
                }}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '380px', // Fixed width
                    background: 'linear-gradient(135deg, rgba(23, 25, 35, 0.95) 0%, rgba(10, 12, 16, 0.98) 100%)', // Darker base for drawer
                    backdropFilter: 'blur(20px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.6)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    borderTopLeftRadius: '24px',
                    borderBottomLeftRadius: '24px',
                    overflowY: 'auto'
                }}
            >
                {/* Back Button for Mobile/Drawer */}
                <div style={{
                    padding: '16px 20px 0 20px',
                    display: 'flex',
                    justifyContent: 'flex-start'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            color: '#cbd5e0',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                            e.currentTarget.style.color = '#fff'
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                            e.currentTarget.style.color = '#cbd5e0'
                        }}
                    >
                        <ChevronLeft size={18} />
                        Back
                    </button>
                </div>

                {/* Header Section */}
                <div style={{
                    padding: '40px 32px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <User size={32} color="#f7fafc" />
                    </div>
                    <h2 style={{
                        margin: '0 0 4px 0',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#f7fafc',
                        fontFamily: 'system-ui, sans-serif'
                    }}>{userName}</h2>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#94a3b8',
                        marginBottom: '16px'
                    }}>{userEmail}</p>
                </div>

                {/* Menu Items Container */}
                <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Section 1: Profile */}
                    <Section title="Profile">
                        <MenuItem
                            label="Account Info"
                            action={
                                <button
                                    onClick={() => setIsEditAccountOpen(true)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        padding: '6px 12px',
                                        borderRadius: '999px',
                                        color: '#f7fafc',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                >
                                    <Edit2 size={12} />
                                    Edit
                                </button>
                            }
                        />
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 0', marginTop: '8px' }}
                            onClick={() => isLoggedIn ? setIsLogoutConfirmOpen(true) : setIsLoggedIn(true)}
                            onMouseOver={e => e.currentTarget.style.opacity = 0.8}
                            onMouseOut={e => e.currentTarget.style.opacity = 1}
                        >
                            <LogOut size={16} color={isLoggedIn ? "#ef4444" : "#22c55e"} />
                            <span style={{ fontSize: '15px', color: isLoggedIn ? "#ef4444" : "#22c55e", fontWeight: 500 }}>
                                {isLoggedIn ? 'Log out' : 'Log in'}
                            </span>
                        </div>
                    </Section>

                    {/* Section 2: Cigarette Information */}
                    <Section title="Cigarette Information">
                        <MenuItem
                            label="Cigarette cost"
                            action={
                                <button
                                    onClick={() => setIsCostModalOpen(true)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        padding: '6px 12px',
                                        borderRadius: '999px',
                                        color: '#f7fafc',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                >
                                    Set cost
                                    <ChevronRight size={14} />
                                </button>
                            }
                        />
                        <div style={{ marginTop: '12px' }}>
                            <MenuItem
                                label="Set goal"
                                action={
                                    <button
                                        onClick={() => setIsGoalModalOpen(true)}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            padding: '6px 12px',
                                            borderRadius: '999px',
                                            color: '#f7fafc',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                    >
                                        Set goal
                                        <ChevronRight size={14} />
                                    </button>
                                }
                            />
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', marginLeft: '0' }}>
                                How long do you want to stay smoke-free?
                            </p>
                        </div>
                    </Section>



                    {/* Section 4: Notifications */}
                    <Section title="Notifications">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Bell size={18} color="#cbd5e0" />
                                <span style={{ fontSize: '15px', color: '#cbd5e0' }}>Notifications</span>
                            </div>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '4px',
                                borderRadius: '999px',
                                display: 'flex',
                                gap: '4px'
                            }}>
                                <ThemeOption
                                    active={notificationsEnabled}
                                    onClick={() => handleToggleNotifications(true)}
                                    icon={<Bell size={14} />}
                                    label="On"
                                />
                                <ThemeOption
                                    active={!notificationsEnabled}
                                    onClick={() => handleToggleNotifications(false)}
                                    icon={<BellOff size={14} />}
                                    label="Off"
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Section 5: Privacy & Data */}
                    <Section title="Privacy & Data">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#cbd5e0' }}
                                onClick={() => setIsDeleteConfirmOpen(true)}
                            >
                                <Trash2 size={16} />
                                <span style={{ fontSize: '15px' }}>Delete all data</span>
                            </div>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ef4444' }}
                                onClick={() => {
                                    setDeleteConfirmText('')
                                    setIsDeleteAccountOpen(true)
                                }}
                            >
                                <Shield size={16} />
                                <span style={{ fontSize: '15px' }}>Delete account</span>
                            </div>
                        </div>
                    </Section>

                    {/* Section 6: About */}
                    <Section title="About">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#cbd5e0' }}
                                onClick={() => {
                                    navigate('/about')
                                    onClose()
                                }}
                            >
                                <Info size={16} />
                                <span style={{ fontSize: '15px' }}>About RESPIRA</span>
                            </div>
                        </div>
                    </Section>

                </div>
            </div>

            {/* Cost Modal */}
            {isCostModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <style>
                            {`
                                /* Hide number input arrows */
                                input[type=number]::-webkit-inner-spin-button, 
                                input[type=number]::-webkit-outer-spin-button { 
                                    -webkit-appearance: none; 
                                    margin: 0; 
                                }
                            `}
                        </style>
                        <h3 style={modalTitleStyle}>Set cigarette cost</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', textAlign: 'left' }}>
                            <div>
                                <label style={labelStyle}>Price per cigarette</label>
                                <input
                                    type="number"
                                    placeholder="Enter price"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Currency</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {[
                                        { code: 'INR', symbol: '₹' },
                                        { code: 'USD', symbol: '$' },
                                        { code: 'EUR', symbol: '€' },
                                        { code: 'GBP', symbol: '£' },
                                        { code: 'AED', symbol: 'د.إ' }
                                    ].map(curr => (
                                        <button
                                            key={curr.code}
                                            onClick={() => setCurrency(curr.code)}
                                            style={{
                                                ...currencyButtonStyle,
                                                background: currency === curr.code ? '#22c55e' : 'rgba(255, 255, 255, 0.05)',
                                                color: currency === curr.code ? '#fff' : '#cbd5e0',
                                                borderColor: currency === curr.code ? '#22c55e' : 'rgba(255, 255, 255, 0.1)'
                                            }}
                                            title={curr.code}
                                        >
                                            {curr.symbol}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={modalActionsStyle}>
                            <button onClick={() => setIsCostModalOpen(false)} style={secondaryButtonStyle}>Cancel</button>
                            <button onClick={async () => {
                                if (cost) {
                                    // Removed localStorage reliance for persistence, use API
                                    // localStorage.setItem('cigaretteCost', cost) 
                                    // localStorage.setItem('cigaretteCurrency', currency)

                                    try {
                                        await fetchWithAuth('/user/settings', {
                                            method: 'PUT',
                                            body: JSON.stringify({
                                                cigarette_cost: cost.toString(),
                                                currency: currency
                                            })
                                        });
                                        // Update local state is handled by inputs
                                    } catch (e) {
                                        console.error("Failed to save settings", e)
                                    }
                                }
                                setIsCostModalOpen(false)
                            }} style={primaryButtonStyle}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Goal Modal */}
            {isGoalModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>Set your goal</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', textAlign: 'left' }}>
                            <div>
                                <label style={labelStyle}>I want to stay smoke-free for:</label>
                                <button
                                    onClick={() => setIsDurationPickerOpen(true)}
                                    style={{
                                        ...inputStyle,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        color: selectedGoal ? '#f7fafc' : '#94a3b8'
                                    }}
                                >
                                    {selectedGoal || 'Select a duration'}
                                    <ChevronDown size={16} color="#94a3b8" />
                                </button>
                            </div>
                        </div>

                        <div style={modalActionsStyle}>
                            <button onClick={() => setIsGoalModalOpen(false)} style={secondaryButtonStyle}>Cancel</button>
                            <button onClick={handleSaveGoal} style={primaryButtonStyle}>Save goal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duration Picker Modal (Stacked) */}
            {isDurationPickerOpen && (
                <div style={{
                    ...modalOverlayStyle,
                    zIndex: 1100 // Higher z-index to sit on top
                }}>
                    <div style={{
                        ...modalContentStyle,
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <style>
                            {`
                                .duration-scrollbar::-webkit-scrollbar {
                                    width: 4px;
                                }
                                .duration-scrollbar::-webkit-scrollbar-track {
                                    background: rgba(255, 255, 255, 0.02);
                                }
                                .duration-scrollbar::-webkit-scrollbar-thumb {
                                    background: rgba(255, 255, 255, 0.15);
                                    border-radius: 10px;
                                }
                                .duration-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background: rgba(255, 255, 255, 0.25);
                                }
                            `}
                        </style>
                        <h3 style={modalTitleStyle}>Select Duration</h3>

                        <div className="duration-scrollbar" style={{
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            minHeight: '200px',
                            paddingRight: '4px',
                            marginBottom: '24px'
                        }}>
                            {['1 week', '2 weeks', '1 month', ...[...Array(11)].map((_, i) => `${i + 2} months`)].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setSelectedGoal(option)
                                        setIsDurationPickerOpen(false)
                                    }}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: selectedGoal === option ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                                        background: selectedGoal === option ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        color: selectedGoal === option ? '#4ade80' : '#cbd5e0',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        width: '100%',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseOver={(e) => {
                                        if (selectedGoal !== option) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (selectedGoal !== option) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                        }
                                    }}
                                >
                                    {option}
                                    {selectedGoal === option && <Check size={16} />}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex' }}>
                            <button
                                onClick={() => setIsDurationPickerOpen(false)}
                                style={secondaryButtonStyle}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {isLogoutConfirmOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>Log out?</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '15px' }}>
                            Are you sure you want to log out?
                        </p>
                        <div style={modalActionsStyle}>
                            <button onClick={() => setIsLogoutConfirmOpen(false)} style={secondaryButtonStyle}>Cancel</button>
                            <button
                                onClick={() => {
                                    setIsLoggedIn(false)
                                    setIsLogoutConfirmOpen(false)
                                    // Clear user data
                                    // Clear user data
                                    localStorage.removeItem('authToken')
                                    localStorage.removeItem('userEmail')
                                    localStorage.removeItem('userName')
                                    navigate('/')
                                }}
                                style={{ ...primaryButtonStyle, background: '#ef4444' }}
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Data Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>Delete all data?</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '15px' }}>
                            This will permanently remove all your data.
                        </p>
                        <div style={modalActionsStyle}>
                            <button onClick={() => setIsDeleteConfirmOpen(false)} style={secondaryButtonStyle}>Cancel</button>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetchWithAuth('/user/data', {
                                            method: 'DELETE'
                                        })
                                        if (response.ok) {
                                            const data = await response.json()

                                            // Clear AI chat history from local storage
                                            localStorage.removeItem('ai_chat_messages')

                                            alert(data.message || 'All activity data has been deleted successfully!')
                                            setIsDeleteConfirmOpen(false)
                                            // Optionally refresh the page or update state
                                            window.location.reload()
                                        } else {
                                            const error = await response.json()
                                            alert(error.detail || 'Failed to delete data. Please try again.')
                                        }
                                    } catch (error) {
                                        console.error('Error deleting data:', error)
                                        alert('An error occurred while deleting data. Please try again.')
                                    }
                                }}
                                style={{ ...primaryButtonStyle, background: '#ef4444' }}
                            >
                                Delete data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Account Modal */}
            {isEditAccountOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>Edit account</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', textAlign: 'left' }}>
                            <div>
                                <label style={labelStyle}>Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={modalActionsStyle}>
                            <button onClick={() => setIsEditAccountOpen(false)} style={secondaryButtonStyle}>Cancel</button>
                            <button onClick={handleSaveProfile} style={primaryButtonStyle}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {isDeleteAccountOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>Delete account?</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '15px' }}>
                            This will permanently delete your account.
                        </p>

                        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                            <label style={labelStyle}>Type DELETE to confirm</label>
                            <input
                                type="text"
                                placeholder="TYPE DELETE"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                style={{
                                    ...inputStyle,
                                    borderColor: deleteConfirmText === 'DELETE' ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                    color: deleteConfirmText === 'DELETE' ? '#ef4444' : '#f7fafc'
                                }}
                            />
                        </div>

                        <div style={modalActionsStyle}>
                            <button onClick={() => setIsDeleteAccountOpen(false)} style={secondaryButtonStyle}>Cancel</button>
                            <button
                                onClick={async () => {
                                    if (deleteConfirmText === 'DELETE') {
                                        try {
                                            const response = await fetchWithAuth('/user/account', {
                                                method: 'DELETE'
                                            })
                                            if (response.ok) {
                                                const data = await response.json()
                                                alert(data.message || 'Your account has been permanently deleted.')

                                                // Clear all local storage
                                                localStorage.removeItem('authToken')
                                                localStorage.removeItem('userEmail')
                                                localStorage.removeItem('userName')
                                                localStorage.clear()

                                                // Navigate to landing page
                                                navigate('/')
                                            } else {
                                                const error = await response.json()
                                                alert(error.detail || 'Failed to delete account. Please try again.')
                                            }
                                        } catch (error) {
                                            console.error('Error deleting account:', error)
                                            alert('An error occurred while deleting your account. Please try again.')
                                        }
                                    }
                                }}
                                disabled={deleteConfirmText !== 'DELETE'}
                                style={{
                                    ...primaryButtonStyle,
                                    background: '#ef4444',
                                    opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5,
                                    cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Delete account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// Styles
const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
}

const modalContentStyle = {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(24px)', // High blur for the card itself
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
    padding: '32px',
    width: '90%',
    maxWidth: '520px',
    textAlign: 'center',
    position: 'relative',
    color: '#f7fafc'
}

const modalTitleStyle = {
    fontSize: '20px',
    fontWeight: 700,
    color: '#f7fafc',
    margin: '0 0 24px 0',
    textAlign: 'center'
}

const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600
}

const inputStyle = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#f7fafc',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    appearance: 'textfield', // Key for hiding arrows on Firefox
    MozAppearance: 'textfield'
}

const currencyButtonStyle = {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const goalCardStyle = {
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const modalActionsStyle = {
    display: 'flex',
    gap: '12px'
}

const primaryButtonStyle = {
    flex: 1,
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s'
}

const secondaryButtonStyle = {
    flex: 1,
    background: 'transparent',
    color: '#cbd5e0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s'
}


// Helpers
function Section({ title, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                color: '#64748b',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '16px'
            }}>{title}</h3>
            {children}
        </div>
    )
}

function MenuItem({ label, action }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '8px'
        }}>
            <span style={{ fontSize: '15px', color: '#cbd5e0' }}>{label}</span>
            {action}
        </div>
    )
}

function ThemeOption({ active, onClick, icon, label }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: active ? '#22c55e' : 'transparent',
                color: active ? '#fff' : '#94a3b8',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            {label}
        </div>
    )
}

export default ProfileDrawer
