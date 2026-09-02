import { assetUrl } from '../api/client'
import './StudentAvatar.css'

export default function StudentAvatar({ foto_profil, nama, size, className = '' }) {
  const style = size ? { width: size, height: size } : undefined

  if (foto_profil) {
    return (
      <img
        src={assetUrl(foto_profil)}
        alt={nama}
        className={`student-avatar student-avatar-photo ${className}`}
        style={style}
      />
    )
  }

  return (
    <div className={`student-avatar student-avatar-placeholder ${className}`} style={style} title={nama}>
      <DefaultPersonIcon />
    </div>
  )
}

function DefaultPersonIcon() {
  return (
    <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8.5" r="3.5" fill="currentColor" />
      <path d="M4.5 20c0-4 3.5-6.5 7.5-6.5s7.5 2.5 7.5 6.5" fill="currentColor" />
    </svg>
  )
}
