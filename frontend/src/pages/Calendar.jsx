import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/client'
import ScheduleClassModal from '../components/ScheduleClassModal'
import './Calendar.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function isoDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    return date
  })
}

export default function Calendar() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [jadwal, setJadwal] = useState([])
  const [siswaList, setSiswaList] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const load = useCallback(() => {
    Promise.all([
      apiFetch(`/jadwal?month=${month + 1}&year=${year}`),
      apiFetch('/siswa'),
    ])
      .then(([j, s]) => {
        setJadwal(j)
        setSiswaList(s)
      })
      .catch((err) => setError(err.message))
  }, [month, year])

  useEffect(() => {
    load()
  }, [load])

  const jadwalByDay = useMemo(() => {
    const map = new Map()
    for (const j of jadwal) {
      const key = isoDateKey(new Date(j.tanggal_pertemuan))
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(j)
    }
    return map
  }, [jadwal])

  const upcoming = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    return jadwal
      .filter((j) => new Date(j.tanggal_pertemuan) >= startOfToday)
      .sort((a, b) => new Date(a.tanggal_pertemuan) - new Date(b.tanggal_pertemuan))[0]
  }, [jadwal])

  const days = buildMonthGrid(year, month)

  function goToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }
  function goPrev() {
    setViewDate(new Date(year, month - 1, 1))
  }
  function goNext() {
    setViewDate(new Date(year, month + 1, 1))
  }

  if (error) return <p className="calendar-error">{error}</p>

  return (
    <div className="calendar-page">
      <div className="calendar-top">
        {upcoming ? (
          <div className="calendar-upcoming">
            <div className="calendar-upcoming-label">Upcoming Class</div>
            <div className="calendar-upcoming-body">
              <span className="calendar-upcoming-nama">{upcoming.nama_siswa}</span>
              <div className="calendar-upcoming-meta">
                <span>{new Date(upcoming.tanggal_pertemuan).toDateString()}</span>
                <span>{upcoming.waktu_pertemuan} WIB</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="calendar-upcoming calendar-upcoming-empty">Tidak ada jadwal mendatang.</div>
        )}
        <button className="calendar-schedule-btn" onClick={() => setModalOpen(true)}>
          Schedule a class
        </button>
      </div>

      <div className="calendar-card">
        <div className="calendar-nav">
          <button onClick={goToday}>Today</button>
          <button onClick={goPrev}>‹</button>
          <button onClick={goNext}>›</button>
          <span className="calendar-title">
            {MONTHS[month]} {year}
          </span>
        </div>

        <div className="calendar-grid calendar-grid-header">
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar-weekday">
              {w}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {days.map((d) => {
            const key = isoDateKey(d)
            const events = jadwalByDay.get(key) ?? []
            const isCurrentMonth = d.getMonth() === month
            const isToday = key === isoDateKey(today)
            return (
              <div key={key} className={`calendar-day${isCurrentMonth ? '' : ' outside'}`}>
                <span className={`calendar-day-number${isToday ? ' today' : ''}`}>{d.getDate()}</span>
                <div className="calendar-day-events">
                  {events.slice(0, 3).map((e) => (
                    <div key={e.id_jadwal} className="calendar-event" title={`${e.nama_siswa} — ${e.waktu_pertemuan}`}>
                      {e.waktu_pertemuan} {e.nama_siswa}
                    </div>
                  ))}
                  {events.length > 3 && <div className="calendar-event-more">+{events.length - 3} lagi</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modalOpen && (
        <ScheduleClassModal
          siswaList={siswaList}
          onClose={() => setModalOpen(false)}
          onScheduled={() => {
            setModalOpen(false)
            load()
          }}
        />
      )}
    </div>
  )
}
