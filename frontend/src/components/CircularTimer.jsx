import React from 'react'
import './CircularTimer.css'

const CircularTimer = ({ timeRemaining, totalTime, phase }) => {
  const progress = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  // Different colors based on phase
  const getColor = () => {
    switch (phase) {
      case 'hold':
        return '#51cf66' // green
      case 'pause':
        return '#ffd43b' // yellow
      default:
        return '#4a9eff' // blue
    }
  }

  return (
    <div className="circular-timer">
      <svg className="timer-svg" width="280" height="280" viewBox="0 0 280 280">
        {/* Background circle */}
        <circle
          className="timer-circle-bg"
          cx="140"
          cy="140"
          r={radius}
          strokeWidth="16"
          fill="none"
        />

        {/* Progress circle */}
        <circle
          className="timer-circle-progress"
          cx="140"
          cy="140"
          r={radius}
          strokeWidth="16"
          fill="none"
          stroke={getColor()}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 140 140)"
        />
      </svg>

      {/* Time display in center */}
      <div className="timer-center">
        <span className="timer-number">{Math.ceil(timeRemaining)}</span>
        <span className="timer-label">seconds</span>
      </div>
    </div>
  )
}

export default CircularTimer
