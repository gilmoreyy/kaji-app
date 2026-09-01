import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import SnbtCountdown from '../components/SnbtCountdown'
import './Header.css'

export default function Header({ title }) {
  const [snbtDate, setSnbtDate] = useState(null)

  useEffect(() => {
    apiFetch('/config')
      .then((data) => setSnbtDate(data.snbt_date))
      .catch(() => {})
  }, [])

  return (
    <header className="app-header">
      <div className="app-header-title">
        <ToggleIcon />
        <h1>{title}</h1>
      </div>
      <SnbtCountdown targetDate={snbtDate} />
    </header>
  )
}

function ToggleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 4.5v15" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
