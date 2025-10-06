import React from 'react'
import './VideoModal.css'

const VideoModal = ({ isOpen, onClose, exercise, allExercises, onExerciseChange }) => {
  if (!isOpen) return null

  const handleVideoClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const currentExercise = exercise || (allExercises && allExercises[0])
  if (!currentExercise) return null

  return (
    <div className="video-overlay" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="video-header">
          <h2>Exercise Videos</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="video-content">
          {/* Exercise selector */}
          {allExercises && allExercises.length > 1 && (
            <div className="exercise-selector">
              {allExercises.map((ex) => (
                <button
                  key={ex.id}
                  className={`exercise-selector-btn ${ex.id === currentExercise.id ? 'active' : ''}`}
                  onClick={() => onExerciseChange && onExerciseChange(ex)}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          )}

          {currentExercise.description && (
            <p className="exercise-description">{currentExercise.description}</p>
          )}

          <div className="video-list">
            {currentExercise.videos && currentExercise.videos.map((video, idx) => (
              <div key={idx} className="video-item">
                <button
                  className="video-button"
                  onClick={() => handleVideoClick(video.url)}
                >
                  <span className="video-icon">▶️</span>
                  <div className="video-info">
                    <div className="video-title">{video.title}</div>
                    {video.duration && (
                      <div className="video-duration">{video.duration}</div>
                    )}
                  </div>
                  <span className="external-icon">↗</span>
                </button>
              </div>
            ))}
          </div>

          {(!currentExercise.videos || currentExercise.videos.length === 0) && (
            <p className="no-videos">No videos available for this exercise.</p>
          )}
        </div>

        <div className="video-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoModal
