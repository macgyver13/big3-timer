import { useEffect, useRef } from 'react'

/**
 * Custom hook for countdown timer logic
 * @param {number} timeRemaining - Current time remaining in seconds
 * @param {function} setTimeRemaining - Function to update time remaining
 * @param {boolean} isActive - Whether timer is active
 * @param {boolean} isPaused - Whether timer is paused
 * @param {function} onComplete - Callback when timer reaches 0
 */
export const useTimer = (timeRemaining, setTimeRemaining, isActive, isPaused, onComplete) => {
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0.1) { // Use small threshold to avoid timing issues
          clearInterval(intervalRef.current)
          intervalRef.current = null
          onComplete()
          return 0
        }
        return prev - 0.1 // Update every 100ms for smoother countdown
      })
    }, 100)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, setTimeRemaining, onComplete])

  return {
    formattedTime: Math.ceil(timeRemaining)
  }
}
