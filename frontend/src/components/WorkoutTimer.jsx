import React, { useEffect, useState } from 'react'
import { WorkoutProvider, useWorkout } from '../context/WorkoutContext'
import { useTimer } from '../hooks/useTimer'
import { useAudio } from '../hooks/useAudio'
import { useWakeLock } from '../hooks/useWakeLock'
import Settings from './Settings'
import VideoModal from './VideoModal'
import CircularTimer from './CircularTimer'
import './WorkoutTimer.css'

const WorkoutTimerContent = () => {
  const [showSettings, setShowSettings] = useState(false)
  const [showVideos, setShowVideos] = useState(false)
  const [selectedVideoExercise, setSelectedVideoExercise] = useState(null)
  const currentExerciseRef = React.useRef(null)
  const {
    config,
    isActive,
    isPaused,
    phase,
    timeRemaining,
    setTimeRemaining,
    currentExercise,
    currentExerciseDetails,
    exerciseDetails,
    currentExerciseIndex,
    currentSetIndex,
    currentRepIndex,
    currentSetReps,
    totalSets,
    startWorkout,
    startFromPosition,
    pauseWorkout,
    resumeWorkout,
    stopWorkout,
    nextPhase,
    skipToNext
  } = useWorkout()

  const { playHoldComplete, playSetComplete, playPauseComplete } = useAudio(
    config.audioPreference,
    config.volume
  )

  // Keep screen awake during workout
  useWakeLock(isActive)

  // Auto-scroll to current exercise in progress list
  useEffect(() => {
    if (currentExerciseRef.current && phase === 'rest') {
      currentExerciseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentExerciseIndex, currentSetIndex, phase])

  // Timer countdown logic
  const { formattedTime } = useTimer(
    timeRemaining,
    setTimeRemaining,
    isActive && phase !== 'rest',
    isPaused,
    () => {
      // Timer completed
      if (phase === 'hold') {
        // Check if this is the last rep of the set
        const currentSet = config.pyramid[currentSetIndex]
        const isLastRepOfSet = currentRepIndex + 1 >= currentSet

        if (!isLastRepOfSet) {
          // Only play hold complete if not the last rep
          playHoldComplete()
        }
      } else if (phase === 'pause') {
        // Play quick double beep at end of pause before next hold
        playPauseComplete()
      }
      // No sound for countdown completion
      nextPhase()
    }
  )

  // Play set complete sound when entering rest phase
  useEffect(() => {
    if (phase === 'rest') {
      console.log('SET COMPLETE - Playing 3-tone sound')
      playSetComplete()
    }
  }, [phase, playSetComplete])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in settings or modal
      if (showSettings || showVideos) return

      switch (e.key.toLowerCase()) {
        case ' ': // Space - pause/resume
        case 'p':
          e.preventDefault()
          if (isActive && phase !== 'rest' && phase !== 'complete') {
            if (isPaused) {
              resumeWorkout()
            } else {
              pauseWorkout()
            }
          }
          break
        case 'enter': // Enter - start/continue
          e.preventDefault()
          if (!isActive) {
            startWorkout()
          } else if (phase === 'rest') {
            nextPhase()
          }
          break
        case 's': // S - skip
          e.preventDefault()
          if (isActive && phase !== 'complete' && phase !== 'rest') {
            skipToNext()
          }
          break
        case 'escape': // Escape - stop
          e.preventDefault()
          if (isActive) {
            stopWorkout()
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isActive, isPaused, phase, showSettings, showVideos, startWorkout, pauseWorkout, resumeWorkout, stopWorkout, nextPhase, skipToNext])

  const handleStartResume = () => {
    if (!isActive) {
      startWorkout()
    } else if (isPaused) {
      resumeWorkout()
    } else if (phase === 'rest') {
      nextPhase()
    }
  }

  const getPhaseDisplay = () => {
    switch (phase) {
      case 'idle':
        return 'Ready to start'
      case 'countdown':
        return 'Get Ready!'
      case 'hold':
        return 'HOLD'
      case 'pause':
        return 'Rest'
      case 'rest':
        return `Get Ready: ${currentExercise?.name}`
      case 'complete':
        return ''
      default:
        return ''
    }
  }

  const getCompletionSummary = () => {
    const totalExercises = config.exercises.length
    const totalSets = config.pyramid.length
    const totalReps = config.pyramid.reduce((sum, reps) => sum + reps, 0)
    return {
      exercises: totalExercises,
      sets: totalSets * totalExercises,
      totalReps: totalReps * totalExercises,
      exerciseList: config.exercises.map(ex => ex.name)
    }
  }

  const getProgressText = () => {
    if (phase === 'idle' || phase === 'complete') return ''

    const setName = ['First', 'Second', 'Third'][currentSetIndex] || 'Set'
    return `${currentExercise?.name || ''} - ${setName} Set (${currentSetReps} reps)`
  }

  const getCurrentRepDisplay = () => {
    if (phase === 'idle' || phase === 'complete' || phase === 'rest' || phase === 'countdown') return ''
    return `Rep ${currentRepIndex + 1} of ${currentSetReps}`
  }

  const handleStopWorkout = () => {
    stopWorkout()
  }

  // Generate workout progress overview
  const getWorkoutProgress = () => {
    const progress = []

    config.pyramid.forEach((reps, setIdx) => {
      config.exercises.forEach((exercise, exIdx) => {
        const isCompleted =
          setIdx < currentSetIndex ||
          (setIdx === currentSetIndex && exIdx < currentExerciseIndex)
        const isCurrent = setIdx === currentSetIndex && exIdx === currentExerciseIndex

        progress.push({
          key: `${setIdx}-${exIdx}`,
          label: `${exercise.name} - Set ${setIdx + 1} (${reps} reps)`,
          isCompleted,
          isCurrent
        })
      })
    })

    return progress
  }

  return (
    <div className="workout-timer">
      {/* Header */}
      <div className="timer-header">
        <h1>Big3 Timer</h1>
        {!isActive && (
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            ⚙️
          </button>
        )}
      </div>

      {/* Main Display */}
      <div className="timer-display">
        {/* Exercise Name */}
        {isActive && phase !== 'complete' && (
          <div className="exercise-name">
            {currentExercise?.name}
          </div>
        )}

        {/* Progress Text */}
        {isActive && (
          <div className="progress-text">
            {getProgressText()}
          </div>
        )}

        {/* Phase Display */}
        {phase !== 'complete' && (
          <div className={`phase-display ${phase}`}>
            {getPhaseDisplay()}
          </div>
        )}

        {/* Completion Summary */}
        {phase === 'complete' && (
          <div className="completion-summary">
            <div className="completion-icon">🎉</div>
            <h2>Workout Complete!</h2>
            <div className="completion-stats">
              <div className="stat-item">
                <div className="stat-value">{getCompletionSummary().exercises}</div>
                <div className="stat-label">Exercises</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{getCompletionSummary().sets}</div>
                <div className="stat-label">Sets</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{getCompletionSummary().totalReps}</div>
                <div className="stat-label">Total Reps</div>
              </div>
            </div>
            <div className="completion-exercises">
              {getCompletionSummary().exerciseList.map((name, idx) => (
                <div key={idx} className="completed-exercise">
                  ✓ {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timer */}
        {(phase === 'countdown' || phase === 'hold' || phase === 'pause') && (
          <CircularTimer
            timeRemaining={timeRemaining}
            totalTime={
              phase === 'countdown'
                ? config.countdownDuration
                : phase === 'hold'
                  ? config.holdDuration
                  : config.pauseDuration
            }
            phase={phase}
          />
        )}

        {/* Rep Counter */}
        {isActive && (
          <div className="rep-counter">
            {getCurrentRepDisplay()}
          </div>
        )}

        {/* Workout Progress Overview - Show during rest */}
        {phase === 'rest' && (
          <div className="workout-progress-overview">
            <h3>Workout Progress</h3>
            <p className="workout-plan-hint">Click any exercise to jump there</p>
            <div className="progress-list">
              {getWorkoutProgress().map((item, index) => {
                const setIdx = Math.floor(index / config.exercises.length)
                const exIdx = index % config.exercises.length
                return (
                  <button
                    key={item.key}
                    ref={item.isCurrent ? currentExerciseRef : null}
                    className={`progress-item clickable ${item.isCompleted ? 'completed' : ''} ${item.isCurrent ? 'current' : ''}`}
                    onClick={() => startFromPosition(setIdx, exIdx)}
                  >
                    <span className="progress-icon">
                      {item.isCompleted ? '✓' : item.isCurrent ? '▶' : '○'}
                    </span>
                    <span className="progress-label">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Exercise Selection (Idle Phase) */}
      {phase === 'idle' && config.exercises && (
        <>
          <div className="workout-progress-overview">
            <h3>Full Workout Plan</h3>
            <p className="workout-plan-hint">Click any exercise to start there</p>
            <div className="progress-list">
              {getWorkoutProgress().map((item, index) => {
                const setIdx = Math.floor(index / config.exercises.length)
                const exIdx = index % config.exercises.length
                return (
                  <button
                    key={item.key}
                    className="progress-item clickable"
                    onClick={() => startFromPosition(setIdx, exIdx)}
                  >
                    <span className="progress-icon">○</span>
                    <span className="progress-label">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button className="btn-start-all" onClick={() => startWorkout(0)}>
            Start Full Workout
          </button>

          {/* Video Links at bottom of idle screen */}
          {exerciseDetails?.length > 0 && (
            <div className="video-links">
              <p className="video-hint">Learn proper form before starting</p>
              <button className="btn-videos" onClick={() => setShowVideos(true)}>
                📺 Watch Exercise Videos
              </button>
            </div>
          )}
        </>
      )}

      {/* Controls */}
      {phase !== 'idle' && (
        <div className="timer-controls">
          {isActive && phase !== 'complete' && (
          <>
            {phase === 'rest' ? (
              <>
                <button className="btn-continue" onClick={handleStartResume}>
                  Continue
                </button>
                {/* Video Links at bottom of rest screen */}
                {exerciseDetails?.length > 0 && (
                  <div className="video-links">
                    <button className="btn-videos" onClick={() => setShowVideos(true)}>
                      📺 Watch Exercise Videos
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  className="btn-pause"
                  onClick={isPaused ? resumeWorkout : pauseWorkout}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button className="btn-skip" onClick={skipToNext}>
                  Skip →
                </button>
                <button className="btn-stop" onClick={handleStopWorkout}>
                  Stop
                </button>
              </>
            )}
          </>
        )}

          {phase === 'complete' && (
            <button className="btn-restart" onClick={startWorkout}>
              Start New Workout
            </button>
          )}
        </div>
      )}

      {/* Set Progress Indicator */}
      {isActive && phase !== 'complete' && (
        <div className="set-progress">
          {config.pyramid.map((reps, idx) => (
            <div
              key={idx}
              className={`set-indicator ${idx === currentSetIndex ? 'active' : ''} ${idx < currentSetIndex ? 'completed' : ''}`}
            >
              {reps}
            </div>
          ))}
        </div>
      )}

      {/* Settings Modal */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideos}
        onClose={() => {
          setShowVideos(false)
          setSelectedVideoExercise(null)
        }}
        exercise={selectedVideoExercise || currentExerciseDetails}
        allExercises={exerciseDetails}
        onExerciseChange={setSelectedVideoExercise}
      />
    </div>
  )
}

const WorkoutTimer = () => {
  return (
    <WorkoutProvider>
      <WorkoutTimerContent />
    </WorkoutProvider>
  )
}

export default WorkoutTimer
