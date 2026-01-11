import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pageStyles, buttonStates, optionStates } from '../styles/questionStyles.js'

function Question({ questionData }) {
  const [selectedValue, setSelectedValue] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('onboarding_answers') || '{}')
    return saved[questionData.id] || (questionData.type === 'checkbox' ? [] : '')
  })
  const navigate = useNavigate()

  const handleOptionClick = (optionId) => {
    let newValue
    if (questionData.type === 'radio') {
      newValue = optionId
    } else {
      newValue = selectedValue.includes(optionId)
        ? selectedValue.filter(id => id !== optionId)
        : [...selectedValue, optionId]
    }

    setSelectedValue(newValue)

    // Persist to localStorage
    const saved = JSON.parse(localStorage.getItem('onboarding_answers') || '{}')
    localStorage.setItem('onboarding_answers', JSON.stringify({
      ...saved,
      [questionData.id]: newValue
    }))
  }

  const handleNext = () => {
    if (!isNextEnabled) {
      alert('Please select at least one option to continue.')
      return
    }
    navigate(questionData.nextRoute)
  }

  const handleBack = () => {
    navigate(questionData.backRoute)
  }

  const isNextEnabled = questionData.type === 'radio'
    ? selectedValue !== ''
    : selectedValue.length > 0

  const isOptionSelected = (optionId) => {
    return questionData.type === 'radio'
      ? selectedValue === optionId
      : selectedValue.includes(optionId)
  }

  const getOptionWeight = (optionId) => {
    return isOptionSelected(optionId) ? optionStates.selected : optionStates.unselected
  }

  const getNextButtonStyles = () => {
    const baseStyles = { ...pageStyles.nextButton }
    const stateStyles = isNextEnabled ? buttonStates.enabled : buttonStates.disabled
    return { ...baseStyles, ...stateStyles }
  }

  const getBackButtonStyles = () => {
    return { ...pageStyles.backButton }
  }

  return (
    <div style={pageStyles.container}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={pageStyles.video}
      >
        <source src="/video1.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for Video readability */}
      <div style={pageStyles.overlay} />

      <div style={pageStyles.logo}>
        Respira
      </div>

      <div style={pageStyles.contentWrapper}>
        <div style={pageStyles.card}>
          <div style={pageStyles.header}>
            <h2 style={pageStyles.title}>
              {questionData.title}
            </h2>
            <p style={pageStyles.subtitle}>
              {questionData.subtitle}
            </p>
          </div>

          <div style={pageStyles.optionsContainer}>
            {questionData.options.map((option) => {
              const selected = isOptionSelected(option.id)
              return (
                <div
                  key={option.id}
                  style={{
                    ...pageStyles.option,
                    ...(selected ? optionStates.selected : {})
                  }}
                  onClick={() => handleOptionClick(option.id)}
                  onMouseOver={(e) => {
                    if (!selected) {
                      e.currentTarget.style.backgroundColor = optionStates.hover.backgroundColor
                      e.currentTarget.style.borderColor = optionStates.hover.borderColor
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!selected) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  <div
                    style={{
                      ...(questionData.type === 'radio' ? pageStyles.radioInput : pageStyles.checkboxInput),
                      backgroundColor: selected ? '#ffffff' : 'transparent',
                      borderColor: selected ? '#fff' : 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {selected && (
                      questionData.type === 'radio' ? (
                        <div style={pageStyles.radioInner} />
                      ) : (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          style={{ color: '#020617' }}
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )
                    )}
                  </div>
                  <span
                    style={{
                      ...pageStyles.optionText,
                      ...(selected ? optionStates.selected : {})
                    }}
                  >
                    {option.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={pageStyles.buttonContainer}>
            <button
              onClick={handleBack}
              style={getBackButtonStyles()}
              onMouseOver={(e) => {
                e.currentTarget.style.color = buttonStates.backHover.color
                e.currentTarget.style.backgroundColor = buttonStates.backHover.backgroundColor
                e.currentTarget.style.borderColor = buttonStates.backHover.borderColor
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              Back
            </button>
            <button
              onClick={isNextEnabled ? handleNext : (e) => {
                e.preventDefault()
                alert('Please select at least one option to continue.')
              }}
              style={getNextButtonStyles()}
              onMouseOver={(e) => {
                if (isNextEnabled) {
                  e.currentTarget.style.transform = buttonStates.hover.transform
                  e.currentTarget.style.boxShadow = buttonStates.hover.boxShadow
                }
              }}
              onMouseOut={(e) => {
                if (isNextEnabled) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = buttonStates.enabled.boxShadow
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Question
