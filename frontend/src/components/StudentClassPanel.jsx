import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api/client'
import ScheduleClassModal from './ScheduleClassModal'
import './StudentClassPanel.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatTanggal(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function withMeetingNumbers(jadwal) {
  const ascending = [...jadwal].sort((a, b) => new Date(a.tanggal_pertemuan) - new Date(b.tanggal_pertemuan))
  const numberByJadwalId = new Map(ascending.map((j, i) => [j.id_jadwal, i + 1]))
  return jadwal.map((j) => ({ ...j, meeting_number: numberByJadwalId.get(j.id_jadwal) }))
}

export default function StudentClassPanel({ siswa, onScheduled }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSesi, setEditingSesi] = useState(false)
  const [sesiValue, setSesiValue] = useState(siswa.sisa_sesi)
  const [saving, setSaving] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const jadwal = withMeetingNumbers(siswa.jadwal ?? [])
  // A meeting counts as "done" (History) once it's been scored, regardless of its
  // calendar date — that's what actually moves it out of Upcoming, not just time
  // passing. Past-but-never-scored meetings also fall into History (see ClassDetail's
  // own empty/filled logic for how that edge case still renders correctly).
  const isDone = (j) => j.skor !== null && j.skor !== undefined
  const upcoming = jadwal
    .filter((j) => new Date(j.tanggal_pertemuan) >= today && !isDone(j))
    .sort((a, b) => new Date(a.tanggal_pertemuan) - new Date(b.tanggal_pertemuan))
  const history = jadwal
    .filter((j) => new Date(j.tanggal_pertemuan) < today || isDone(j))
    .sort((a, b) => new Date(b.tanggal_pertemuan) - new Date(a.tanggal_pertemuan))

  async function saveSesi() {
    setSaving(true)
    try {
      await apiFetch(`/siswa/${siswa.id_siswa}`, { method: 'PUT', body: { sisa_sesi: Number(sesiValue) } })
      setEditingSesi(false)
      onScheduled()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="class-panel">
      <h2 className="class-panel-title">Class</h2>

      <div className="class-sessions">
        <span>Available Sessions</span>
        {!editingSesi && (
          <button className="class-sessions-edit" onClick={() => setEditingSesi(true)}>
            <EditIcon />
          </button>
        )}
      </div>

      {editingSesi ? (
        <div className="class-sessions-edit-row">
          <input
            type="number"
            min="0"
            value={sesiValue}
            onChange={(e) => setSesiValue(e.target.value)}
            autoFocus
          />
          <button onClick={saveSesi} disabled={saving}>
            {saving ? '...' : 'OK'}
          </button>
        </div>
      ) : (
        <div className="class-sessions-value">{siswa.sisa_sesi}</div>
      )}

      <button className="schedule-btn" onClick={() => setModalOpen(true)}>
        Schedule a class
        <PlusIcon />
      </button>

      <div className="class-list-section">
        <h3>Upcoming</h3>
        <div className="class-list">
          {upcoming.length === 0 && <p className="class-list-empty">Belum ada jadwal.</p>}
          {upcoming.map((j) => (
            <MeetingCard key={j.id_jadwal} siswaId={siswa.id_siswa} jadwal={j} />
          ))}
        </div>
      </div>

      <div className="class-list-section">
        <h3>History</h3>
        <div className="class-list">
          {history.length === 0 && <p className="class-list-empty">Belum ada riwayat.</p>}
          {history.map((j) => (
            <MeetingCard key={j.id_jadwal} siswaId={siswa.id_siswa} jadwal={j} />
          ))}
        </div>
      </div>

      {modalOpen && (
        <ScheduleClassModal
          siswaList={[siswa]}
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

function MeetingCard({ siswaId, jadwal }) {
  return (
    <Link to={`/student/${siswaId}/meeting/${jadwal.id_jadwal}`} className="class-list-item">
      <div className="class-list-top">
        <div className="class-list-date">
          {formatTanggal(jadwal.tanggal_pertemuan)}
          <span>{jadwal.waktu_pertemuan} WIB</span>
        </div>
        <ChevronIcon />
      </div>
      <div className="class-list-bottom">
        <span className="class-list-meeting">Meeting {jadwal.meeting_number}</span>
        <span className="class-list-material">{jadwal.bab?.nama_bab ?? 'Materi belum ditentukan'}</span>
      </div>
    </Link>
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

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4L18.5 9.5a2 2 0 0 0-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
