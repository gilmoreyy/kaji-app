import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { getScoreColor } from '../constants/score'
import './ClassDetail.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatTanggal(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function toDateInputValue(iso) {
  return new Date(iso).toISOString().slice(0, 10)
}

export default function ClassDetail() {
  const { studentId, jadwalId } = useParams()
  const navigate = useNavigate()
  const [jadwal, setJadwal] = useState(null)
  const [babList, setBabList] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(() => {
    return Promise.all([
      apiFetch(`/siswa/${studentId}/jadwal/${jadwalId}`),
      apiFetch('/bab'),
    ])
      .then(([j, b]) => {
        setJadwal(j)
        setBabList(b)
      })
      .catch((err) => setError(err.message))
  }, [studentId, jadwalId])

  // Applies a PUT response immediately (no round-trip wait) so the breadcrumb/section
  // membership never briefly shows stale data, then reconciles fully in the background.
  const patchJadwal = useCallback(
    (partial) => {
      setJadwal((prev) => (prev ? { ...prev, ...partial } : prev))
      load()
    },
    [load],
  )

  useEffect(() => {
    load()
  }, [load])

  if (error) return <p className="class-detail-error">{error}</p>
  if (!jadwal) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isPast = new Date(jadwal.tanggal_pertemuan) < today
  const isFilled = jadwal.skor !== null && jadwal.skor !== undefined
  // Same "done" rule as the Upcoming/History split in StudentClassPanel.jsx: a meeting
  // is History once it's past OR already scored, whichever comes first.
  const isHistory = isPast || isFilled
  const middleCrumb = isPast ? 'History' : isFilled ? 'Upcoming Class' : null

  return (
    <div className="class-detail">
      <div className="class-detail-breadcrumb">
        <Link to="/student">Student</Link>
        {middleCrumb && (
          <>
            <span> &gt; </span>
            <span>{middleCrumb}</span>
          </>
        )}
        <span> &gt; </span>
        <span className="class-detail-breadcrumb-current">
          {jadwal.nama_siswa} Meeting {jadwal.meeting_number}
        </span>
      </div>

      <div className="class-detail-top">
        <ClassInformationCard jadwal={jadwal} babList={babList} onSaved={patchJadwal} />
        <ScoreNotesCard jadwal={jadwal} onSaved={patchJadwal} onCancel={() => navigate(-1)} />
      </div>

      <AssignmentCard jadwal={jadwal} isHistory={isHistory} onUploaded={patchJadwal} />
    </div>
  )
}

function ClassInformationCard({ jadwal, babList, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function startEdit() {
    setForm({
      tanggal_pertemuan: toDateInputValue(jadwal.tanggal_pertemuan),
      waktu_pertemuan: jadwal.waktu_pertemuan,
      id_bab: jadwal.id_bab ?? '',
    })
    setError('')
    setEditing(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const updated = await apiFetch(`/siswa/${jadwal.id_siswa}/jadwal/${jadwal.id_jadwal}`, {
        method: 'PUT',
        body: { ...form, id_bab: form.id_bab === '' ? null : Number(form.id_bab) },
      })
      setEditing(false)
      onSaved(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="info-card">
      <div className="info-card-header">
        <h2>Class Information</h2>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="info-form">
          <div className="info-form-grid">
            <label>
              Tanggal
              <input
                type="date"
                value={form.tanggal_pertemuan}
                onChange={(e) => setForm((f) => ({ ...f, tanggal_pertemuan: e.target.value }))}
                required
              />
            </label>
            <label>
              Waktu
              <input
                type="time"
                value={form.waktu_pertemuan}
                onChange={(e) => setForm((f) => ({ ...f, waktu_pertemuan: e.target.value }))}
                required
              />
            </label>
            <label>
              Material
              <select
                value={form.id_bab}
                onChange={(e) => setForm((f) => ({ ...f, id_bab: e.target.value }))}
              >
                <option value="">Belum ditentukan</option>
                {babList.map((b) => (
                  <option key={b.id_bab} value={b.id_bab}>
                    {b.nama_bab}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="info-error">{error}</p>}
          <div className="info-form-actions">
            <button type="button" onClick={() => setEditing(false)}>
              Batal
            </button>
            <button type="submit" className="info-save" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="info-grid">
            <div>
              <span className="info-label">Name</span>
              <span className="info-value">: {jadwal.nama_siswa}</span>
            </div>
            <div>
              <span className="info-label">Meeting number</span>
              <span className="info-value">: {jadwal.meeting_number}</span>
            </div>
            <div>
              <span className="info-label">Date</span>
              <span className="info-value">: {formatTanggal(jadwal.tanggal_pertemuan)}</span>
            </div>
            <div>
              <span className="info-label">Material</span>
              <span className="info-value">: {jadwal.bab?.nama_bab ?? jadwal.nama_bab ?? '-'}</span>
            </div>
            <div>
              <span className="info-label">Time</span>
              <span className="info-value">: {jadwal.waktu_pertemuan} WIB</span>
            </div>
          </div>
          <button className="info-edit-btn" onClick={startEdit}>
            <EditIcon /> Edit
          </button>
        </>
      )}
    </div>
  )
}

function ScoreNotesCard({ jadwal, onSaved, onCancel }) {
  const isFilled = jadwal.skor !== null && jadwal.skor !== undefined
  const [editing, setEditing] = useState(!isFilled)
  const [skor, setSkor] = useState(jadwal.skor ?? '')
  const [catatan, setCatatan] = useState(jadwal.catatan ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function startEdit() {
    setSkor(jadwal.skor ?? '')
    setCatatan(jadwal.catatan ?? '')
    setError('')
    setEditing(true)
  }

  async function handleFinish() {
    setError('')
    if (skor === '' || Number.isNaN(Number(skor))) {
      setError('Isi skor dulu')
      return
    }
    setSubmitting(true)
    try {
      const updated = await apiFetch(`/siswa/${jadwal.id_siswa}/jadwal/${jadwal.id_jadwal}`, {
        method: 'PUT',
        body: { skor: Number(skor), catatan },
      })
      setEditing(false)
      onSaved(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="score-card">
        <h2>Score</h2>
        {editing ? (
          <input
            className="score-input"
            type="number"
            min="0"
            max="100"
            placeholder="..."
            value={skor}
            onChange={(e) => setSkor(e.target.value)}
          />
        ) : (
          <div className="score-display">
            <span className="score-number">{jadwal.skor}</span>
            <span className={`score-dot ${getScoreColor(jadwal.skor)}`} />
          </div>
        )}

        {error && <p className="info-error">{error}</p>}

        {editing ? (
          <div className="score-actions">
            <button className="score-cancel" onClick={onCancel} type="button">
              Cancel
            </button>
            <button className="score-finish" onClick={handleFinish} disabled={submitting} type="button">
              {submitting ? '...' : 'Finish'}
            </button>
          </div>
        ) : (
          <button className="score-edit-btn" onClick={startEdit}>
            <EditIcon /> Edit
          </button>
        )}
      </div>

      <div className="notes-card">
        <h2>Notes</h2>
        {editing ? (
          <textarea
            className="notes-textarea"
            placeholder="Write a note..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        ) : (
          <p className="notes-text">{jadwal.catatan || '-'}</p>
        )}
      </div>
    </>
  )
}

// TODO: replace with actual uploaded student assignment file once every History
// meeting has a real one on record — this only backfills the preview UI so it's
// not sitting empty while the real upload flow above is still getting used.
const DUMMY_ASSIGNMENT_PATH = '/assets/dummy/latihan-soal-mat-wajib-tka.pdf'
const DUMMY_ASSIGNMENT_NAME = 'latihan-soal-mat-wajib-tka.pdf'

function AssignmentCard({ jadwal, isHistory, onUploaded }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('File harus berformat PDF')
      return
    }
    setError('')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const updated = await apiFetch(`/siswa/${jadwal.id_siswa}/jadwal/${jadwal.id_jadwal}/assignment`, {
        method: 'POST',
        body: formData,
      })
      onUploaded(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const isDummy = !jadwal.assignment_path && isHistory
  const fileUrl = jadwal.assignment_path
    ? `/${jadwal.assignment_path}`
    : isDummy
      ? DUMMY_ASSIGNMENT_PATH
      : null
  const fileName = jadwal.assignment_nama_file ?? (isDummy ? DUMMY_ASSIGNMENT_NAME : undefined)

  return (
    <div className="assignment-card">
      <div className="assignment-header">
        <h2>Student Assignment</h2>
        <div className="assignment-header-actions">
          {fileUrl && (
            <>
              <a href={fileUrl} target="_blank" rel="noreferrer" className="assignment-icon-btn" title="Preview">
                <UploadIcon />
              </a>
              <a href={fileUrl} download={fileName} className="assignment-icon-btn" title="Download">
                <DownloadIcon />
              </a>
            </>
          )}
        </div>
      </div>

      {fileUrl && (
        <a href={fileUrl} target="_blank" rel="noreferrer" className="preview-module-btn">
          <EyeIcon /> Preview Module
        </a>
      )}

      {error && <p className="info-error">{error}</p>}

      {fileUrl ? (
        <iframe src={fileUrl} title="Assignment preview" className="assignment-preview" />
      ) : (
        <div
          className={`assignment-dropzone${dragOver ? ' drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFile(e.dataTransfer.files[0])
          }}
        >
          <p>{uploading ? 'Mengunggah...' : 'Upload Assignment'}</p>
          <button
            type="button"
            className="choose-files-btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <FileIcon /> Choose files
          </button>
          <span className="dropzone-hint">or drop files here</span>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  )
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4L18.5 9.5a2 2 0 0 0-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v12M7 11l5 5 5-5M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
