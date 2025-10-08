import { useRef, useEffect, useCallback } from 'react'

// Audio context for generating sounds
let audioContext = null

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
  }
  return audioContext
}

// Load voices on initialization
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
  window.speechSynthesis.getVoices()
}

// Track last announcement to prevent duplicates
let lastAnnouncement = null

/**
 * Announce text using speech synthesis
 */
const announce = (text, volume) => {
  if ('speechSynthesis' in window) {
    // Use setTimeout to make this completely async and non-blocking
    setTimeout(() => {
      try {
        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel()
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0
        utterance.lang = 'en-US'

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        }

        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.warn('Audio playback not supported:', error)
      }
    }, 0)
  }
}

/**
 * Generate audio tones programmatically
 */
const playBeep = (frequency = 800, duration = 200, volume = 0.7) => {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

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
  } catch (error) {
    console.warn('Audio playback failed:', error)
  }
}

const playChime = (volume = 0.7) => {
  playBeep(523, 150, volume) // C5
  setTimeout(() => playBeep(659, 150, volume), 150) // E5
}

const playSetComplete = (volume = 0.7) => {
  playBeep(392, 200, volume) // G4 - lower starting note
  setTimeout(() => playBeep(523, 200, volume), 250) // C5
  setTimeout(() => playBeep(659, 300, volume), 550) // E5 - longer final note
}

const playPauseComplete = (volume = 0.7) => {
  playBeep(600, 100, volume) // Quick low beep
  setTimeout(() => playBeep(800, 100, volume), 120) // Quick high beep
}

/**
 * Custom hook for audio alerts
 * @param {string} audioPreference - Type of sound: 'beep', 'chime', 'announce'
 * @param {number} volume - Volume level (0-1)
 */
export const useAudio = (audioPreference = 'beep', volume = 0.7) => {
  const lastPlayedRef = useRef(0)
  const minInterval = 100 // Minimum ms between sounds to prevent spam

  // Initialize audio context - must be called from a user gesture
  const startWorkoutAudio = () => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Test speech synthesis directly to ensure it works on macOS Chrome
    if ('speechSynthesis' in window && audioPreference === 'announce') {
      const utterance = new SpeechSynthesisUtterance('starting workout')
      utterance.rate = 1.0
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  const playHoldComplete = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayedRef.current < minInterval) return

    lastPlayedRef.current = now

    try {
      if (audioPreference === 'announce') {
        announce('HOLD', volume)
      } else if (audioPreference === 'chime') {
        playChime(volume)
      } else {
        playBeep(800, 200, volume)
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
      if (audioPreference === 'announce') {
        announce('COMPLETE', volume)
      } else if (audioPreference === 'chime') {
        playSetComplete(volume)
      } else {
        playSetComplete(volume)
      }
    } catch (error) {
      console.error('Error playing set complete sound:', error)
    }
  }, [audioPreference, volume])

  const playPauseCompleteSound = useCallback(() => {
    const now = Date.now()
    if (now - lastPlayedRef.current < minInterval) return

    lastPlayedRef.current = now

    try {
      if (audioPreference === 'announce') {
        announce('REST', volume)
      } else if (audioPreference === 'chime') {
        playPauseComplete(volume)
      } else {
        playPauseComplete(volume)
      }
    } catch (error) {
      console.error('Error playing pause complete sound:', error)
    }
  }, [audioPreference, volume])

  // Resume audio context on user interaction (required by browsers)
  useEffect(() => {
    const resumeAudio = () => {
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume()
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
    startWorkoutAudio,
    playHoldComplete,
    playSetComplete: playSetCompleteSound,
    playPauseComplete: playPauseCompleteSound
  }
}
