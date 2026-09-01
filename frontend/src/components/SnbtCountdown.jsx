import { useEffect, useState } from 'react'
import './SnbtCountdown.css'

function getRemaining(targetDate) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function SnbtCountdown({ targetDate }) {
  const [remaining, setRemaining] = useState(() => (targetDate ? getRemaining(targetDate) : null))

  useEffect(() => {
    if (!targetDate) return
    setRemaining(getRemaining(targetDate))
    const id = setInterval(() => setRemaining(getRemaining(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!remaining) return null

  return (
    <div className="snbt-countdown">
      <span className="snbt-countdown-label">SNBT Countdown:</span>
      <div className="snbt-countdown-boxes">
        <span className="snbt-box">{pad(remaining.days)}</span>
        <span className="snbt-colon">:</span>
        <span className="snbt-box">{pad(remaining.hours)}</span>
        <span className="snbt-colon">:</span>
        <span className="snbt-box">{pad(remaining.minutes)}</span>
        <span className="snbt-colon">:</span>
        <span className="snbt-box">{pad(remaining.seconds)}</span>
      </div>
    </div>
  )
}
