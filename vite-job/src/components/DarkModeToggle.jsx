import React from 'react'

// Simplified: only show a static Light label (dark mode removed)
export default function DarkModeToggle() {
  return (
    <div className="me-3 d-flex align-items-center">
      <span className="badge bg-light text-dark">Light</span>
    </div>
  )
}
