import React, { createContext, useContext, useState, useEffect } from 'react'

const WorkoutContext = createContext()

export const useWorkout = () => {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider')
  }
  return context
}

// Default workout configuration
const DEFAULT_CONFIG = {
  exercises: [
    { id: 'curl-up', name: 'Curl Up', videoUrl: '' },
    { id: 'side-plank', name: 'Side Plank', videoUrl: '' },
    { id: 'bird-dog', name: 'Bird Dog', videoUrl: '' }
  ],
  pyramid: [12, 8, 4], // Reps per set
  holdDuration: 10, // seconds
  pauseDuration: 3, // seconds between holds
  countdownDuration: 3, // seconds before starting hold
  audioPreference: 'beep', // beep, chime, announce
  volume: 0.7,
  theme: 'dark'
}

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('big3-timer-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge with defaults to ensure new settings are included
      const merged = { ...DEFAULT_CONFIG, ...parsed }
      console.log('Loaded settings from localStorage:', merged)
      return merged
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return DEFAULT_CONFIG
}

// Save settings to localStorage
const saveSettings = (settings) => {
  try {
    localStorage.setItem('big3-timer-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export const WorkoutProvider = ({ children }) => {
  const [config, setConfig] = useState(loadSettings)
  const [exerciseDetails, setExerciseDetails] = useState([]) // Full exercise info from API

  // Workout session state
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0) // 0 = 12 reps, 1 = 8 reps, 2 = 4 reps
  const [currentRepIndex, setCurrentRepIndex] = useState(0) // Current rep within the set
  const [phase, setPhase] = useState('idle') // idle, countdown, hold, pause, rest, complete
  const [timeRemaining, setTimeRemaining] = useState(0) // seconds

  // Fetch exercise details from API on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        // In development, fetch from public folder
        // In production (Vercel), fetch from API
        const isDev = import.meta.env.DEV
        const url = isDev ? '/exercises.json' : '/api/exercises'
        const response = await fetch(url)
        const data = await response.json()
        setExerciseDetails(data.exercises || [])
      } catch (error) {
        console.error('Failed to fetch exercise details:', error)
      }
    }
    fetchExercises()
  }, [])

  // Save config changes to localStorage
  useEffect(() => {
    saveSettings(config)
  }, [config])

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const startWorkout = (startingExerciseIndex = 0) => {
    setIsActive(true)
    setIsPaused(false)
    setCurrentExerciseIndex(startingExerciseIndex)
    setCurrentSetIndex(0)
    setCurrentRepIndex(0)
    setPhase('countdown')
    setTimeRemaining(config.countdownDuration)
  }

  const startFromPosition = (setIndex, exerciseIndex) => {
    setIsActive(true)
    setIsPaused(false)
    setCurrentSetIndex(setIndex)
    setCurrentExerciseIndex(exerciseIndex)
    setCurrentRepIndex(0)
    setPhase('countdown')
    setTimeRemaining(config.countdownDuration)
  }

  const pauseWorkout = () => {
    setIsPaused(true)
  }

  const resumeWorkout = () => {
    setIsPaused(false)
  }

  const stopWorkout = () => {
    setIsActive(false)
    setIsPaused(false)
    setPhase('idle')
    setTimeRemaining(0)
  }

  const nextPhase = () => {
    const currentSet = config.pyramid[currentSetIndex]

    if (phase === 'countdown') {
      // Countdown complete - start hold
      setPhase('hold')
      setTimeRemaining(config.holdDuration)
    } else if (phase === 'hold') {
      // Just completed a hold
      const nextRep = currentRepIndex + 1

      if (nextRep < currentSet) {
        // More reps in this set - enter pause phase
        setPhase('pause')
        setTimeRemaining(config.pauseDuration)
        setCurrentRepIndex(nextRep)
      } else {
        // Set complete - move to next exercise in the same set
        const nextExercise = currentExerciseIndex + 1

        if (nextExercise < config.exercises.length) {
          // More exercises to do in this set
          setCurrentExerciseIndex(nextExercise)
          setCurrentRepIndex(0)
          setPhase('rest')
          setTimeRemaining(0) // Manual rest
        } else {
          // All exercises complete for this set - move to next set
          const nextSet = currentSetIndex + 1

          if (nextSet < config.pyramid.length) {
            // More sets to do - start first exercise of next set
            setCurrentSetIndex(nextSet)
            setCurrentExerciseIndex(0)
            setCurrentRepIndex(0)
            setPhase('rest')
            setTimeRemaining(0) // Manual rest
          } else {
            // Workout complete!
            setPhase('complete')
            setIsActive(false)
          }
        }
      }
    } else if (phase === 'pause') {
      // Pause complete - go directly to next hold (no countdown between reps)
      setPhase('hold')
      setTimeRemaining(config.holdDuration)
    } else if (phase === 'rest') {
      // Manual rest complete - user clicks to continue - start countdown for first rep
      setPhase('countdown')
      setTimeRemaining(config.countdownDuration)
    }
  }

  const skipToNext = () => {
    nextPhase()
  }

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG)
  }

  // Get full exercise details by ID
  const getCurrentExerciseDetails = () => {
    const current = config.exercises[currentExerciseIndex]
    return exerciseDetails.find(ex => ex.id === current?.id) || current
  }

  const value = {
    // Configuration
    config,
    updateConfig,
    resetToDefaults,

    // Exercise details from API
    exerciseDetails,

    // Workout state
    isActive,
    isPaused,
    currentExerciseIndex,
    currentSetIndex,
    currentRepIndex,
    phase,
    timeRemaining,

    // Actions
    startWorkout,
    startFromPosition,
    pauseWorkout,
    resumeWorkout,
    stopWorkout,
    nextPhase,
    skipToNext,
    setTimeRemaining,

    // Computed values
    currentExercise: config.exercises[currentExerciseIndex],
    currentExerciseDetails: getCurrentExerciseDetails(),
    currentSetReps: config.pyramid[currentSetIndex],
    totalSets: config.pyramid.length,
    totalExercises: config.exercises.length
  }

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  )
}
