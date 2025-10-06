import { useRef, useEffect, useCallback } from 'react'

// Audio context for generating sounds
let audioContext = null

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

/**
 * Generate audio tones programmatically
 */
const playBeep = (frequency = 800, duration = 200, volume = 0.7) => {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(volume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration / 1000)
}

const playChime = (volume = 0.7) => {
  // Play a pleasant two-tone chime
  playBeep(523, 150, volume) // C5
  setTimeout(() => playBeep(659, 150, volume), 150) // E5
}

const playSetComplete = (volume = 0.7) => {
  // Play a distinctive three-tone ascending pattern for set completion
  // Lower, longer tones for more distinction
  playBeep(392, 200, volume) // G4 - lower starting note
  setTimeout(() => playBeep(523, 200, volume), 250) // C5
  setTimeout(() => playBeep(659, 300, volume), 550) // E5 - longer final note
}

const playPauseComplete = (volume = 0.7) => {
  // Play a quick double beep for pause ending (get ready signal)
  playBeep(600, 100, volume) // Quick low beep
  setTimeout(() => playBeep(800, 100, volume), 120) // Quick high beep
}

/**
 * Custom hook for audio alerts
 * @param {string} audioPreference - Type of sound: 'beep', 'chime', 'tone'
 * @param {number} volume - Volume level (0-1)
 */
export const useAudio = (audioPreference = 'beep', volume = 0.7) => {
  const lastPlayedRef = useRef(0)
  const minInterval = 100 // Minimum ms between sounds to prevent spam

  const playHoldComplete = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayedRef.current < minInterval) return

    lastPlayedRef.current = now

    try {
      if (audioPreference === 'chime') {
        playChime(volume)
      } else {
        playBeep(800, 200, volume) // Single beep
      }
    } catch (error) {
      console.error('Error playing hold complete sound:', error)
    }
  }, [audioPreference, volume])

  const playSetCompleteSound = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayedRef.current < minInterval) return

    lastPlayedRef.current = now

    try {
      playSetComplete(volume)
    } catch (error) {
      console.error('Error playing set complete sound:', error)
    }
  }, [volume])

  const playPauseCompleteSound = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayedRef.current < minInterval) return

    lastPlayedRef.current = now

    try {
      playPauseComplete(volume)
    } catch (error) {
      console.error('Error playing pause complete sound:', error)
    }
  }, [volume])

  // Resume audio context on user interaction (required by browsers)
  useEffect(() => {
    const resumeAudio = () => {
      const ctx = getAudioContext()
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
    }

    document.addEventListener('touchstart', resumeAudio)
    document.addEventListener('click', resumeAudio)

    return () => {
      document.removeEventListener('touchstart', resumeAudio)
      document.removeEventListener('click', resumeAudio)
    }
  }, [])

  return {
    playHoldComplete,
    playSetComplete: playSetCompleteSound,
    playPauseComplete: playPauseCompleteSound
  }
}
