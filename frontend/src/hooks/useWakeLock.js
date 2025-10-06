import { useEffect, useRef } from 'react'

/**
 * Custom hook to prevent screen sleep during workout
 * Uses the Screen Wake Lock API when available
 */
export const useWakeLock = (isActive) => {
  const wakeLockRef = useRef(null)

  useEffect(() => {
    if (!('wakeLock' in navigator)) {
      console.log('Wake Lock API not supported')
      return
    }

    const requestWakeLock = async () => {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        console.log('Wake Lock acquired - screen will stay on')

        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock released')
        })
      } catch (err) {
        console.error('Failed to acquire Wake Lock:', err)
      }
    }

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release()
          wakeLockRef.current = null
        } catch (err) {
          console.error('Failed to release Wake Lock:', err)
        }
      }
    }

    if (isActive) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      releaseWakeLock()
    }
  }, [isActive])

  return wakeLockRef
}
