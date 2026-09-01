import { useState } from 'react'
import ScheduleClassModal from './ScheduleClassModal'
import './UpcomingClassPanel.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTanggal(tanggalIso) {
  const date = new Date(tanggalIso)
  const today = new Date()
  const prefix = isSameDay(date, today) ? 'Today' : WEEKDAYS[date.getDay()]
  return `${prefix}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export default function UpcomingClassPanel({ upcomingClass, siswaList, onScheduled }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="upcoming-panel">
      <div className="upcoming-header">
        <h2>Upcoming Class</h2>
        <span className="upcoming-badge">{upcomingClass.length}</span>
      </div>

      <button className="schedule-btn" onClick={() => setModalOpen(true)}>
        Schedule a class
        <PlusIcon />
      </button>

      <div className="upcoming-list">
        {upcomingClass.length === 0 && <p className="upcoming-empty">Belum ada jadwal mendatang.</p>}
        {upcomingClass.map((c) => (
          <div className="upcoming-card" key={c.id_jadwal}>
            <div className="upcoming-card-top">
              <span className="upcoming-date">{formatTanggal(c.tanggal_pertemuan)}</span>
              <span className="upcoming-time">{c.waktu_pertemuan} WIB</span>
            </div>
            <div className="upcoming-nama">{c.nama_siswa}</div>
            <div className="upcoming-bottom">
              <span className="upcoming-topik">{c.topik ?? '-'}</span>
              {c.meeting_number && <span className="upcoming-meeting">Meeting {c.meeting_number}</span>}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <ScheduleClassModal
          siswaList={siswaList}
          onClose={() => setModalOpen(false)}
          onScheduled={() => {
            setModalOpen(false)
            onScheduled()
          }}
        />
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
