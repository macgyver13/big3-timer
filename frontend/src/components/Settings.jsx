import React, { useState } from 'react'
import { useWorkout } from '../context/WorkoutContext'
import './Settings.css'

const Settings = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetToDefaults } = useWorkout()

  const [localConfig, setLocalConfig] = useState(config)

  if (!isOpen) return null

  const handleSave = () => {
    updateConfig(localConfig)
    onClose()
  }

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetToDefaults()
      setLocalConfig(config)
    }
  }

  const handleCancel = () => {
    setLocalConfig(config) // Revert changes
    onClose()
  }

  const updateLocalConfig = (updates) => {
    setLocalConfig(prev => ({ ...prev, ...updates }))
  }

  const moveExercise = (index, direction) => {
    const newExercises = [...localConfig.exercises]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newExercises.length) return

    [newExercises[index], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[index]]
    updateLocalConfig({ exercises: newExercises })
  }

  const updatePyramidSet = (index, value) => {
    const newPyramid = [...localConfig.pyramid]
    newPyramid[index] = parseInt(value) || 0
    updateLocalConfig({ pyramid: newPyramid })
  }

  const applyPreset = (preset) => {
    if (preset === 'beginner') {
      updateLocalConfig({
        pyramid: [8, 4, 2],
        holdDuration: 7,
        pauseDuration: 4
      })
    } else if (preset === 'advanced') {
      updateLocalConfig({
        pyramid: [12, 8, 4],
        holdDuration: 10,
        pauseDuration: 3
      })
    }
  }

  return (
    <div className="settings-overlay" onClick={handleCancel}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <div className="settings-content">
          {/* Workout Presets */}
          <section className="settings-section">
            <h3>Workout Presets</h3>
            <div className="preset-buttons">
              <button className="preset-btn beginner" onClick={() => applyPreset('beginner')}>
                <div className="preset-name">Beginner</div>
                <div className="preset-details">8, 4, 2 reps • 7s holds • 3s pause</div>
              </button>
              <button className="preset-btn advanced" onClick={() => applyPreset('advanced')}>
                <div className="preset-name">Advanced</div>
                <div className="preset-details">12, 8, 4 reps • 10s holds • 3s pause</div>
              </button>
            </div>
          </section>

          {/* Timing Configuration */}
          <section className="settings-section">
            <h3>Timing</h3>
            <div className="setting-item">
              <label>Hold Duration (seconds)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={localConfig.holdDuration}
                onChange={(e) => updateLocalConfig({ holdDuration: parseInt(e.target.value) || 10 })}
              />
            </div>
            <div className="setting-item">
              <label>Pause Between Holds (seconds)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={localConfig.pauseDuration}
                onChange={(e) => updateLocalConfig({ pauseDuration: parseInt(e.target.value) || 3 })}
              />
            </div>
            <div className="setting-item">
              <label>Get Ready (seconds)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={localConfig.countdownDuration}
                onChange={(e) => updateLocalConfig({ countdownDuration: parseInt(e.target.value) || 3 })}
              />
            </div>
          </section>

          {/* Pyramid Configuration */}
          <section className="settings-section">
            <h3>Pyramid Sets</h3>
            <div className="pyramid-sets">
              {localConfig.pyramid.map((reps, idx) => (
                <div key={idx} className="setting-item">
                  <label>Set {idx + 1} Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={reps}
                    onChange={(e) => updatePyramidSet(idx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Exercise Order */}
          <section className="settings-section">
            <h3>Exercise Order</h3>
            <div className="exercise-list">
              {localConfig.exercises.map((exercise, idx) => (
                <div key={exercise.id} className="exercise-item">
                  <div className="exercise-controls">
                    <button
                      className="move-btn"
                      onClick={() => moveExercise(idx, 'up')}
                      disabled={idx === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="move-btn"
                      onClick={() => moveExercise(idx, 'down')}
                      disabled={idx === localConfig.exercises.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                  <div className="exercise-info">
                    <div className="exercise-name-display">
                      {exercise.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Audio Settings */}
          <section className="settings-section">
            <h3>Audio</h3>
            <div className="setting-item">
              <label>Sound Type</label>
              <select
                value={localConfig.audioPreference}
                onChange={(e) => updateLocalConfig({ audioPreference: e.target.value })}
              >
                <option value="beep">Beep</option>
                <option value="chime">Chime</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={localConfig.volume * 100}
                onChange={(e) => updateLocalConfig({ volume: parseInt(e.target.value) / 100 })}
              />
              <span className="volume-value">{Math.round(localConfig.volume * 100)}%</span>
            </div>
          </section>

          {/* Theme Settings */}
          <section className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <label>Theme</label>
              <select
                value={localConfig.theme}
                onChange={(e) => updateLocalConfig({ theme: e.target.value })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button className="btn-reset" onClick={handleReset}>
            Reset to Defaults
          </button>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
